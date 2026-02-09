"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { useEffect, useState } from "react";

export function CartIcon() {
  const totalItems = useCartStore((s) => s.totalItems);
  const [count, setCount] = useState(0);

  // Avoid hydration mismatch — localStorage only available on client
  useEffect(() => {
    setCount(totalItems());
  }, [totalItems]);

  return (
    <Link href="/cart" className="relative p-2">
      <ShoppingBag className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
