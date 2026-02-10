import Image from "next/image";
import { notFound } from "next/navigation";
import { getVendor } from "@/lib/vendors";
import { formatPrice } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = getVendor();
  const product = await vendor.getProduct(id);

  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-4 mb-6 inline-block">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to shop
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="aspect-square bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg border border-gray-200/50">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              width={800}
              height={800}
              className="object-cover w-full h-full"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-6">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="text-xl mt-2">
            {formatPrice(product.price, product.currency)}
          </p>

          {product.description && (
            <p className="text-muted-foreground mt-4 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="mt-8">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
