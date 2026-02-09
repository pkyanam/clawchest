export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number; // cents
  currency: string;
  images: string[];
  metadata: Record<string, string>;
  vendor: string;
  vendorProductId: string;
  priceId: string; // needed for Stripe Checkout
}

export interface VendorAdapter {
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
}
