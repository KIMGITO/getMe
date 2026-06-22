export interface OrderItem {
  product_name: string;
  quantity: number;
  unit: string;
  estimated_price_per_unit: number;
  substitute_allowed: boolean;
  notes?: string;
  shop?: string;
}

export interface ShoppingList {
  id: string;
  title: string;
  items: OrderItem[];
  status: 'draft' | 'pending' | 'completed' | 'dispatched';
  market_location: { lat: number; lng: number; description: string };
  // Add other necessary fields
}

export interface ShoppingItem {
  product_name: string;
  quantity: number;
  unit: string;
  estimated_price_per_unit: number;
  substitute_allowed: boolean;
  notes?: string;
}

export interface Location {
  lat: number;
  lng: number;
  description: string;
}

export interface FeePreview {
  distance_km: number;
  delivery_fee: number;
  items_estimated_cost: number;
  total_order_cost: number;
  wallet_sufficient: boolean;
  suggested_topup_amount: number;
}