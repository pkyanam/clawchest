export const PRINTIFY_API_BASE_URL = "https://api.printify.com/v1";

export interface PrintifyShop {
  id: number;
  title: string;
  sales_channel: string;
}

export interface PrintifyVariant {
  id: number;
  title: string;
  price: number;
  is_available: boolean;
  currency: string;
  options: {
    color: string;
    size: string;
  };
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string | null;
  images: { src: string }[];
  variants: PrintifyVariant[];
  created_at: string;
  updated_at: string;
  visible: boolean;
  is_deleted: boolean;
  blueprints: number[];
  print_provider_id: number;
}

export interface PrintifyOrderLineItem {
  product_id: string;
  variant_id: number;
  quantity: number;
}

export interface PrintifyShippingAddress {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  region: string;
  address1: string;
  address2?: string;
  city: string;
  zip: string;
}

export interface PrintifyOrderRequest {
  line_items: PrintifyOrderLineItem[];
  shipping_method: number;
  send_shipping_notification: boolean;
  address_to: PrintifyShippingAddress;
}

export interface PrintifyOrder {
  id: string;
  status: string;
  shipping: {
    tracking_number?: string;
    tracking_url?: string;
  };
}

export class PrintifyClient {
  private apiKey: string;
  private shopId: string | null = null;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("PRINTIFY_API_KEY is not set");
    }
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${PRINTIFY_API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Printify API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  async getShops(): Promise<PrintifyShop[]> {
    return this.request<PrintifyShop[]>("/shops.json");
  }

  async getShopId(): Promise<string> {
    if (this.shopId) {
      return this.shopId;
    }

    const shops = await this.getShops();
    if (shops.length === 0) {
      throw new Error("No shops found in Printify account");
    }

    this.shopId = String(shops[0].id);
    return this.shopId;
  }

  async getProducts(): Promise<PrintifyProduct[]> {
    const shopId = await this.getShopId();
    const response = await this.request<any>(`/shops/${shopId}/products.json`);

    // Handle both paginated and direct array responses
    if (Array.isArray(response)) {
      return response;
    }

    // If it's a paginated response with a data property
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }

    // If neither, return empty array
    console.error("Unexpected Printify products response format:", response);
    return [];
  }

  async getProduct(productId: string): Promise<PrintifyProduct | null> {
    try {
      const shopId = await this.getShopId();
      return this.request<PrintifyProduct>(`/shops/${shopId}/products/${productId}.json`);
    } catch {
      return null;
    }
  }

  async createOrder(orderData: PrintifyOrderRequest): Promise<PrintifyOrder> {
    const shopId = await this.getShopId();
    return this.request<PrintifyOrder>(`/shops/${shopId}/orders.json`, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async publishOrder(orderId: string): Promise<PrintifyOrder> {
    const shopId = await this.getShopId();
    return this.request<PrintifyOrder>(`/shops/${shopId}/orders/${orderId}/send_to_production.json`, {
      method: "POST",
    });
  }
}

let _printify: PrintifyClient | null = null;

export function getPrintify(): PrintifyClient {
  if (!_printify) {
    const apiKey = process.env.PRINTIFY_API_KEY;
    if (!apiKey) {
      throw new Error("PRINTIFY_API_KEY is not set");
    }
    _printify = new PrintifyClient(apiKey);
  }
  return _printify;
}
