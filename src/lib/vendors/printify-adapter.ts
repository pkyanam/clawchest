import { getPrintify, type PrintifyProduct, type PrintifyVariant } from "@/lib/printify";
import type { Product, VendorAdapter } from "./types";

function mapProduct(product: PrintifyProduct): Product | null {
  if (!product.visible || product.is_deleted) return null;

  const availableVariant = product.variants.find((v: PrintifyVariant) => v.is_available);
  if (!availableVariant) return null;

  return {
    id: product.id,
    name: product.title,
    description: product.description,
    price: Math.round(availableVariant.price * 100),
    currency: availableVariant.currency,
    images: product.images.map((img: { src: string }) => img.src),
    metadata: {
      blueprints: product.blueprints.join(","),
      print_provider_id: String(product.print_provider_id),
    },
    vendor: "printify",
    vendorProductId: product.id,
    priceId: availableVariant.id.toString(),
  };
}

export class PrintifyAdapter implements VendorAdapter {
  async getProducts(): Promise<Product[]> {
    const response = await getPrintify().getProducts();

    // Handle both array and paginated response formats
    const products = Array.isArray(response) ? response : (response as any).data || [];

    if (!Array.isArray(products)) {
      console.error("Unexpected Printify API response format:", response);
      return [];
    }

    return products
      .map(mapProduct)
      .filter((p): p is Product => p !== null);
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const product = await getPrintify().getProduct(id);
      if (!product || !product.visible || product.is_deleted) return null;
      return mapProduct(product);
    } catch {
      return null;
    }
  }
}
