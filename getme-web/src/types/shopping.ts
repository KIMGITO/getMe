export type OrderStep = 'route' | 'cart' | 'summary';
export type AddressMode = 'saved' | 'custom';

export interface ShoppingItem {
  product_name: string;
  unit: string;
  quantity: number;
  allow_substitutes: boolean;
  estimated_price_per_unit?: number;
  shop?: string;
  notes?: string;
}

export interface MarketLocationNode {
  lat: number;
  lng: number;
  description: string;
}

export interface CustomDeliveryNode {
  lat: number;
  lng: number;
  description: string;
}

// Complete request payload dispatched to your API backend
export interface OrderSubmissionPayload {
  title: string;
  preferred_pickup_start_time: string;
  note_for_rider: string;
  tip_amount: number;
  market_location: MarketLocationNode;
  address_mode: AddressMode;
  delivery_address_id: string | null;
  custom_delivery_location: CustomDeliveryNode | null;
  items: ShoppingItem[];
}

export interface OrderSubmissionResponse {
  success: boolean;
  message: string;
  order_id?: string;
  estimated_total_cost: number;
}

export type ShoppingValidationErrors = {
  [K in keyof Partial<OrderSubmissionPayload>]: string;
} & {
  global?: string;
  items?: string; // For general cart/items array validation errors
};