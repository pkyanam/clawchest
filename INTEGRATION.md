# Printify + Stripe Integration

This project integrates **Printify** for product listings and **Stripe** for payment processing.

## How It Works

1. **Product Listings**: Products are fetched from Printify API
2. **Checkout**: Payments are processed through Stripe Checkout
3. **Dynamic Pricing**: Printify products use Stripe's dynamic pricing feature (`price_data`)

## Configuration

### Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Printify
PRINTIFY_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGc...

# Vendor Selection
VENDOR=printify  # or "stripe" for Stripe Products
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Switching Vendors

Change the `VENDOR` environment variable:
- `VENDOR=printify` - Fetch products from Printify, pay with Stripe
- `VENDOR=stripe` - Use Stripe Products and Prices directly

## Architecture

### Vendor Adapters

The project uses a vendor adapter pattern to support multiple product sources:

```
src/lib/vendors/
├── types.ts              # Common Product interface
├── index.ts              # Vendor selection logic
├── printify-adapter.ts   # Printify implementation
└── stripe-adapter.ts     # Stripe implementation
```

### Printify Integration

**Files:**
- `src/lib/printify.ts` - Printify API client
- `src/lib/vendors/printify-adapter.ts` - Maps Printify products to common format

**Features:**
- Fetches products from Printify shops
- Filters visible and available products
- Uses first available variant for pricing

### Stripe Integration

**Files:**
- `src/lib/stripe.ts` - Stripe client
- `src/app/api/checkout/route.ts` - Checkout session handler

**Features:**
- Handles both Stripe Price IDs and dynamic pricing
- Automatically detects Printify products (priceId doesn't start with "price_")
- Creates checkout sessions with proper product metadata

## Checkout Flow

1. User adds Printify products to cart
2. Cart stores product details (id, name, price, image, vendor)
3. On checkout, the API route creates a Stripe Checkout session:
   - **Printify products**: Uses `price_data` with dynamic pricing
   - **Stripe products**: Uses existing Price IDs
4. After payment, Stripe redirects to success page

## API Routes

### POST /api/checkout

Creates a Stripe Checkout session.

**Request:**
```json
{
  "items": [
    {
      "id": "product-id",
      "name": "Product Name",
      "price": 2999,
      "currency": "usd",
      "image": "https://...",
      "priceId": "variant-id",
      "quantity": 1,
      "vendor": "printify"
    }
  ]
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

## Testing

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000

3. Products should load from Printify

4. Add items to cart and proceed to checkout

5. Complete payment with Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

## Printify Setup

1. Create a Printify account at https://printify.com
2. Create a shop
3. Add products to your shop
4. Generate an API key from Settings > API
5. Add the API key to your `.env` file

## Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your test API keys from the Dashboard
3. Add keys to your `.env` file
4. Configure webhook endpoints (if needed for order fulfillment)

## Order Fulfillment

After a successful payment, you'll need to:

1. Listen for Stripe webhook events (`checkout.session.completed`)
2. Extract product metadata (vendor, vendorProductId)
3. Create order in Printify using their Orders API
4. Printify will handle printing and shipping

## Automated Order Fulfillment ✅

Webhook handler is now implemented! When a customer completes checkout:

1. ✅ Stripe webhook triggers at `/api/webhooks/stripe`
2. ✅ Order is automatically created in Printify
3. ✅ Order is published to production
4. ✅ Printify handles printing and shipping

See `WEBHOOK_SETUP.md` for complete setup instructions.

## Next Steps

- [ ] Add order status tracking database
- [ ] Build order status page for customers
- [ ] Add email notifications (order confirmation, shipping)
- [ ] Support product variants (size, color selection)
- [ ] Add admin dashboard for order management
