import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <CheckCircle2 className="h-12 w-12 mx-auto text-green-600 mb-4" />
      <h1 className="text-2xl font-bold">Thank you for your order!</h1>
      <p className="text-muted-foreground mt-2">
        Your payment was successful. You&apos;ll receive a confirmation email shortly.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Continue Shopping</Link>
      </Button>
    </div>
  );
}
