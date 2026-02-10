# Automated Order Fulfillment Setup

This guide explains how to set up automated order fulfillment with Printify when customers complete checkout.

## How It Works

1. Customer completes checkout on Stripe
2. Stripe sends webhook to `/api/webhooks/stripe`
3. Webhook extracts order details and shipping address
4. Creates order in Printify with customer's items
5. Publishes order to production (Printify starts printing/shipping)

## Setup Instructions

### 1. Install Stripe CLI (for local testing)

```bash
brew install stripe/stripe-cli/stripe
```

### 2. Login to Stripe CLI

```bash
stripe login
```

### 3. Forward webhooks to your local server

In a separate terminal, run:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will output a webhook signing secret like: `whsec_xxxxx`

### 4. Update your .env file

Copy the webhook secret and update `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 5. Test the integration

1. Start your dev server: `npm run dev`
2. Keep the `stripe listen` command running in another terminal
3. Add a Printify product to cart
4. Complete checkout with test card: `4242 4242 4242 4242`
5. Watch the terminal logs to see:
   - Stripe webhook received
   - Printify order created
   - Printify order published

### 6. Production Setup

For production, you'll need to:

1. Deploy your app to a public URL (Vercel, Railway, etc.)

2. Go to Stripe Dashboard → Developers → Webhooks

3. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`

4. Select events to listen for:
   - `checkout.session.completed`

5. Copy the webhook signing secret

6. Add to production environment variables:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_prod_xxxxx
   ```

## Webhook Handler Details

**File:** `src/app/api/webhooks/stripe/route.ts`

**Events Handled:**
- `checkout.session.completed` - Creates and publishes Printify order

**What it does:**
1. Verifies webhook signature for security
2. Extracts line items from the session
3. Filters Printify products (checks `metadata.vendor === "printify"`)
4. Builds shipping address from customer details
5. Creates order in Printify via API
6. Publishes order to production

## Shipping Address Collection

The checkout now collects:
- ✅ Full shipping address
- ✅ Phone number
- ✅ Email

Supported countries: US, CA, GB, AU, DE, FR, ES, IT, NL, SE, NO, DK, FI

Add more countries in `src/app/api/checkout/route.ts:68`

## Debugging

### Check webhook logs

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-json
```

### Check Printify order status

1. Log into Printify dashboard
2. Go to Orders section
3. Find the order by ID (logged in console)

### Common issues

**"No signature" error:**
- Make sure `stripe listen` is running
- Check that STRIPE_WEBHOOK_SECRET is set correctly

**"Invalid signature" error:**
- Webhook secret doesn't match
- Make sure you're using the secret from `stripe listen` output

**"No shipping address" error:**
- Stripe session needs shipping address collection enabled
- Already configured in the checkout route

**Printify order creation fails:**
- Check PRINTIFY_API_KEY is valid
- Verify product IDs exist in your Printify shop
- Check variant IDs are correct

## Next Steps

### Add order tracking

Store order IDs in a database:

```typescript
// In webhook handler after order creation
await db.orders.create({
  stripeSessionId: session.id,
  printifyOrderId: order.id,
  customerEmail: fullSession.customer_details?.email,
  status: "processing",
  createdAt: new Date(),
});
```

### Add order status page

Create `/orders/[id]` page to show:
- Order status
- Tracking number (when available)
- Estimated delivery

### Add email notifications

Use Resend or SendGrid to email customers:
- Order confirmation
- Shipping notification with tracking

### Add admin dashboard

Build `/admin/orders` to:
- View all orders
- See fulfillment status
- Handle issues

## Testing Checklist

- [ ] Webhook receives events from Stripe
- [ ] Shipping address is collected at checkout
- [ ] Printify order is created with correct items
- [ ] Printify order is published to production
- [ ] Order appears in Printify dashboard
- [ ] Test with multiple items in cart
- [ ] Test with mixed Printify + Stripe products
- [ ] Test with international addresses

## Security Notes

- ✅ Webhook signature verification prevents fake webhooks
- ✅ HTTPS required in production
- ✅ Webhook secret should be kept private
- ✅ Never expose STRIPE_WEBHOOK_SECRET in client-side code
