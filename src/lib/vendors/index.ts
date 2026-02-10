import { StripeAdapter } from "./stripe-adapter";
import { PrintifyAdapter } from "./printify-adapter";
import { CombinedAdapter } from "./combined-adapter";
import type { VendorAdapter } from "./types";

export function getVendor(): VendorAdapter {
  const vendor = process.env.VENDOR || "stripe";

  switch (vendor) {
    case "printify":
      return new PrintifyAdapter();
    case "combined":
      return new CombinedAdapter();
    case "stripe":
    default:
      return new StripeAdapter();
  }
}

export type { Product, VendorAdapter } from "./types";
