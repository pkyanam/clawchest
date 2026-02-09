import { StripeAdapter } from "./stripe-adapter";
import type { VendorAdapter } from "./types";

export function getVendor(): VendorAdapter {
  return new StripeAdapter();
}

export type { Product, VendorAdapter } from "./types";
