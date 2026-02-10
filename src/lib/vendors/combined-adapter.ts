import { PrintifyAdapter } from "./printify-adapter";
import { StripeAdapter } from "./stripe-adapter";
import type { Product, VendorAdapter } from "./types";

/**
 * Combined adapter that fetches products from both Printify and Stripe
 * and merges them into a single product catalog.
 */
export class CombinedAdapter implements VendorAdapter {
  private printifyAdapter: PrintifyAdapter;
  private stripeAdapter: StripeAdapter;

  constructor() {
    this.printifyAdapter = new PrintifyAdapter();
    this.stripeAdapter = new StripeAdapter();
  }

  async getProducts(): Promise<Product[]> {
    try {
      // Fetch from both sources in parallel
      const [printifyProducts, stripeProducts] = await Promise.allSettled([
        this.printifyAdapter.getProducts(),
        this.stripeAdapter.getProducts(),
      ]);

      const products: Product[] = [];

      // Add Printify products if successful
      if (printifyProducts.status === "fulfilled") {
        products.push(...printifyProducts.value);
      } else {
        console.warn("Failed to fetch Printify products:", printifyProducts.reason);
      }

      // Add Stripe products if successful
      if (stripeProducts.status === "fulfilled") {
        products.push(...stripeProducts.value);
      } else {
        console.warn("Failed to fetch Stripe products:", stripeProducts.reason);
      }

      return products;
    } catch (error) {
      console.error("Error fetching products from combined adapter:", error);
      return [];
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    // Try Printify first (IDs are typically UUIDs)
    try {
      const printifyProduct = await this.printifyAdapter.getProduct(id);
      if (printifyProduct) return printifyProduct;
    } catch {
      // Continue to Stripe
    }

    // Try Stripe (IDs start with "prod_")
    try {
      const stripeProduct = await this.stripeAdapter.getProduct(id);
      if (stripeProduct) return stripeProduct;
    } catch {
      // Product not found in either vendor
    }

    return null;
  }
}
