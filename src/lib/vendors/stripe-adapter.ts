import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";
import type { Product, VendorAdapter } from "./types";

function mapProduct(product: Stripe.Product): Product | null {
  const price = product.default_price as Stripe.Price | null;
  if (!price || !price.unit_amount) return null;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: price.unit_amount,
    currency: price.currency,
    images: product.images,
    metadata: product.metadata as Record<string, string>,
    vendor: "stripe",
    vendorProductId: product.id,
    priceId: price.id,
  };
}

export class StripeAdapter implements VendorAdapter {
  async getProducts(): Promise<Product[]> {
    const { data } = await getStripe().products.list({
      active: true,
      expand: ["data.default_price"],
      limit: 100,
    });

    return data.map(mapProduct).filter((p): p is Product => p !== null);
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const product = await getStripe().products.retrieve(id, {
        expand: ["default_price"],
      });
      if (!product.active) return null;
      return mapProduct(product);
    } catch {
      return null;
    }
  }
}
