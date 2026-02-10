import { getStripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

interface CartItem {
  id: string;
  name: string;
  price: number; // in cents
  currency: string;
  image?: string;
  priceId: string;
  quantity: number;
  vendor?: string;
}

export async function POST(req: Request) {
  try {
    const { items } = (await req.json()) as { items: CartItem[] };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol = headersList.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    // Build line items - use dynamic pricing for Printify products, Price IDs for Stripe products
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
      // Check if this is a Printify product (priceId won't start with "price_")
      const isPrintifyProduct = !item.priceId.startsWith("price_");

      if (isPrintifyProduct) {
        // Use dynamic pricing for Printify products
        return {
          price_data: {
            currency: item.currency || "usd",
            unit_amount: item.price,
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : [],
              metadata: {
                vendor: item.vendor || "printify",
                vendorProductId: item.id,
                variantId: item.priceId, // This is the variant ID for Printify
              },
            },
          },
          quantity: item.quantity,
        };
      } else {
        // Use existing Price ID for Stripe products
        return {
          price: item.priceId,
          quantity: item.quantity,
        };
      }
    });

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "ES", "IT", "NL", "SE", "NO", "DK", "FI"],
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
