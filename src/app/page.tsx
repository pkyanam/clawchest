import { ProductGrid } from "@/components/products/product-grid";
import { getVendor } from "@/lib/vendors";
import type { Product } from "@/lib/vendors";

export const revalidate = 60;

export default async function HomePage() {
  let products: Product[] = [];
  try {
    const vendor = getVendor();
    products = await vendor.getProducts();
  } catch {
    // Stripe not configured — show empty state
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shop</h1>
      <ProductGrid products={products} />
    </div>
  );
}
