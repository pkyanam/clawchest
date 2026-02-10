import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { CartIcon } from "@/components/cart/cart-icon";

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4">
        <MobileNav />

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-lg font-bold tracking-tight md:static md:translate-x-0"
        >
          Clawchest Store
        </Link>

        <nav className="hidden md:flex items-center gap-6 ml-8">
          <Link
            href="/"
            className="text-sm font-medium hover:text-muted-foreground transition-colors"
          >
            Shop
          </Link>
        </nav>

        <div className="ml-auto">
          <CartIcon />
        </div>
      </div>
    </header>
  );
}
