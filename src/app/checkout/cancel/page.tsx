import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold">Checkout cancelled</h1>
      <p className="text-muted-foreground mt-2">
        Your payment was not processed. Your cart items are still saved.
      </p>
      <div className="flex gap-4 justify-center mt-8">
        <Button asChild variant="outline">
          <Link href="/">Shop</Link>
        </Button>
        <Button asChild>
          <Link href="/cart">Return to Cart</Link>
        </Button>
      </div>
    </div>
  );
}
