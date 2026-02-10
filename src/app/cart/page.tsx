import { CartItems } from "@/components/cart/cart-items";
import { CartSummary } from "@/components/cart/cart-summary";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-4 mb-6 inline-block">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Continue shopping
        </Link>
      </div>

      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 p-6 mb-8">
        <h1 className="text-2xl font-bold">Cart</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CartItems />
        </div>
        <div>
          <CartSummary />
        </div>
      </div>
    </div>
  );
}
