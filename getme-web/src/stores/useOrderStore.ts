import { shoppingService } from '@/services/shoppingService';
import { create } from 'zustand';

export type OrderStep = 'history' | 'cart' | 'route' | 'summary' | 'finding_rider';
export type AddressMode = 'saved' | 'custom';

export interface ShoppingItem {
  shop?: string;
  product_name: string;
  unit: string;
  quantity: number;
  estimated_price_per_unit: number;
  substitute_allowed: boolean;
  notes?: string;
  photo_url?: string;
}

export interface LocationCoordinates {
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

interface OrderState {
  step: OrderStep;
  history: any[];
  shoppingListId: string | null;
  feePreview: FeePreview | null;
  addressMode: AddressMode;
  title: string;
  preferred_pickup_start_time: string;
  delivery_address_id: string | null;
  note_for_rider: string;
  tip_amount: number;
  market_location: LocationCoordinates;
  custom_delivery_location: LocationCoordinates;
  items: ShoppingItem[];
  hydrateFromOrder: (order: any) => void;
}

interface OrderActions {
  setStep: (step: OrderStep) => void;
  setHistory: (history: any[]) => void;
  fetchHistory: () => Promise<void>;
  loadOrderToStore: (order: any) => void;
  setShoppingListId: (id: string | null) => void;
  setFeePreview: (preview: FeePreview | null) => void;
  setAddressMode: (mode: AddressMode) => void;
  setSavedAddressId: (id: string | null) => void;
  updateMarketLocation: (lat: number, lng: number, description?: string) => void;
  updateCustomAddress: (updates: Partial<LocationCoordinates>) => void;
  updateLogistics: (updates: Partial<Pick<OrderState, 'title' | 'preferred_pickup_start_time' | 'note_for_rider' | 'tip_amount'>>) => void;
  addItem: (item: ShoppingItem) => void;
  removeItem: (index: number) => void;
  clearStore: () => void;
}

const initialLocation = { lat: -1.2921, lng: 36.8219, description: '' };

export const useOrderStore = create<OrderState & OrderActions>((set) => ({
  step: 'history', 
  history: [],
  items: [],
  shoppingListId: null,
  feePreview: null,
  addressMode: 'saved',
  title: '',
  preferred_pickup_start_time: '',
  delivery_address_id: null,
  note_for_rider: '',
  tip_amount: 0,
  market_location: { ...initialLocation },
  custom_delivery_location: { ...initialLocation },

  hydrateFromOrder: (order) => set({
    title: order.title,
    items: order.items,
    market_location: order.market_location,
    shoppingListId: order.id,
    step: 'cart', // Jump back to the cart step
  }),
  setStep: (step) => set({ step }),
  setHistory: (history) => set({ history }),
  setShoppingListId: (id) => set({ shoppingListId: id }),
  setFeePreview: (preview) => set({ feePreview: preview }),
  setAddressMode: (mode) => set({ addressMode: mode }),
  setSavedAddressId: (id) => set({ delivery_address_id: id }),
  fetchHistory: async () => {
      try{
        const  data = await shoppingService.getHistory();
        set({history: data});
      }catch(e){
        console.log('failed to store history ' ,e);
      }
  },
  loadOrderToStore: (order :any) => {
    set({
      setShoppingListId: order.id,
      title: order.title,
      items: order.items,
      market_location: order.market_location || { lat: 0, lng: 0, description: '' },
      addressMode: order.delivery_address_id ? 'saved' : 'custom',
      delivery_address_id: order.delivery_address_id || null,
      custom_delivery_location: order.delivery_location || { lat: 0, lng: 0, description: '' },      
      step: 'cart'
    })
  },
  updateMarketLocation: (lat, lng, description) => set((state) => ({
    market_location: { ...state.market_location, lat, lng, ...(description !== undefined && { description }) }
  })),
  updateCustomAddress: (updates) => set((state) => ({
    custom_delivery_location: { ...state.custom_delivery_location, ...updates }
  })),
  updateLogistics: (updates) => set((state) => ({ ...state, ...updates })),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (index) => set((state) => ({ items: state.items.filter((_, idx) => idx !== index) })),
  clearStore: () => set({
    step: 'history',
    shoppingListId: null,
    feePreview: null,
    addressMode: 'saved',
    title: '',
    preferred_pickup_start_time: '',
    delivery_address_id: null,
    note_for_rider: '',
    tip_amount: 0,
    market_location: { ...initialLocation },
    custom_delivery_location: { ...initialLocation },
    items: [],
  }),
}));