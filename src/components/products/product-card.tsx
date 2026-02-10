import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/vendors";
import { formatPrice } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
        <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              width={600}
              height={600}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-base text-gray-900">{product.name}</h3>
          <p className="text-base font-medium text-gray-700">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>
      </div>
    </Link>
  );
}
