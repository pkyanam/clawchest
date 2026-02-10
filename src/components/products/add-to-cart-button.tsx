"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import type { Product } from "@/lib/vendors";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

export function AddToCartButton({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.images[0],
      priceId: product.priceId,
      vendor: product.vendor,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button onClick={handleClick} size="lg" className="w-full">
      <ShoppingBag className="h-4 w-4 mr-2" />
      {added ? "Added!" : "Add to Cart"}
    </Button>
  );
}
