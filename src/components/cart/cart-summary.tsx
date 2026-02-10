"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function CartSummary() {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const [loading, setLoading] = useState(false);

  if (items.length === 0) return null;

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const { url } = await res.json();
      if (url) {
        window.location.href = url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-6">
      <h2 className="text-lg font-semibold">Order Summary</h2>
      <Separator className="my-4" />
      <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span className="font-medium">{formatPrice(totalPrice())}</span>
      </div>
      <div className="flex justify-between text-sm mt-2 text-muted-foreground">
        <span>Shipping</span>
        <span>Calculated at checkout</span>
      </div>
      <Separator className="my-4" />
      <Button
        className="w-full"
        size="lg"
        onClick={handleCheckout}
        disabled={loading}
      >
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Checkout
      </Button>
    </div>
  );
}
