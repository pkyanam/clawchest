import { getStripe } from "@/lib/stripe";
import { getPrintify } from "@/lib/printify";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import type { PrintifyOrderLineItem, PrintifyShippingAddress } from "@/lib/printify";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    }

    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutCompleted(session);
    } catch (error) {
      console.error("Error processing checkout:", error);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log("Processing checkout session:", session.id);

  // Retrieve the session with line items and shipping details
  const fullSession = await getStripe().checkout.sessions.retrieve(session.id, {
    expand: ["line_items", "line_items.data.price.product"],
  });

  if (!fullSession.line_items?.data || fullSession.line_items.data.length === 0) {
    console.log("No line items found");
    return;
  }

  // Extract shipping details
  const shippingDetails = fullSession.shipping_details || fullSession.customer_details;
  if (!shippingDetails?.address) {
    console.error("No shipping address found");
    return;
  }

  const address = shippingDetails.address;
  const name = shippingDetails.name || "Customer";
  const [firstName, ...lastNameParts] = name.split(" ");
  const lastName = lastNameParts.join(" ") || firstName;

  // Build Printify shipping address
  const shippingAddress: PrintifyShippingAddress = {
    first_name: firstName,
    last_name: lastName,
    email: fullSession.customer_details?.email || "",
    phone: shippingDetails.phone || "",
    country: address.country || "US",
    region: address.state || "",
    address1: address.line1 || "",
    address2: address.line2 || undefined,
    city: address.city || "",
    zip: address.postal_code || "",
  };

  // Process line items and group by vendor
  const printifyItems: PrintifyOrderLineItem[] = [];

  for (const item of fullSession.line_items.data) {
    const product = item.price?.product as Stripe.Product;

    // Check if this is a Printify product
    const isPrintifyProduct = product?.metadata?.vendor === "printify";

    if (isPrintifyProduct && product?.metadata?.vendorProductId) {
      printifyItems.push({
        product_id: product.metadata.vendorProductId,
        variant_id: parseInt(product.metadata.variantId || item.price?.id || "0"),
        quantity: item.quantity || 1,
      });
    }
  }

  // Create Printify order if there are Printify items
  if (printifyItems.length > 0) {
    try {
      console.log("Creating Printify order with items:", printifyItems);

      const order = await getPrintify().createOrder({
        line_items: printifyItems,
        shipping_method: 1, // Standard shipping - you may want to make this configurable
        send_shipping_notification: true,
        address_to: shippingAddress,
      });

      console.log("Printify order created:", order.id);

      // Publish order to production
      await getPrintify().publishOrder(order.id);
      console.log("Printify order published:", order.id);

      // TODO: Store order ID in your database for tracking
      // await db.orders.create({
      //   stripeSessionId: session.id,
      //   printifyOrderId: order.id,
      //   status: order.status,
      // });

    } catch (error) {
      console.error("Failed to create Printify order:", error);
      // TODO: Send notification to admin about failed order
      throw error;
    }
  }
}
