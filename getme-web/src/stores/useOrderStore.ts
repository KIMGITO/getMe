import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ShoppingItem {
  shop?: string;
  product_name: string;
  unit: string;
  quantity: number ;
  allow_substitutes: boolean;
  estimated_price_per_unit?: number;
  substitute_allowed: boolean;
  photo_url?: string;
  notes?: string;
}

export interface CustomAddress {
  lat: number;
  lng: number;
  description: string;
}

interface OrderState {
  step: 'market' | 'items' | 'logistics' | 'delivery' | 'summary';
  title: string;
  preferred_pickup_start_time: string;
  note_for_rider: string;
  tip_amount: number;
  market_location: {
    lat: number;
    lng: number;
    description: string;
  };
  items: ShoppingItem[];
  // Address Strategy: 'saved' or 'custom'
  addressMode: 'saved' | 'custom';
  delivery_address_id: string | null;
  custom_delivery_location: CustomAddress | null;
  
  // Setters
  setStep: (step: OrderState['step']) => void;
  updateMarketLocation: (lat: number, lng: number, description?: string) => void;
  updateItem: (index: number, updates: Partial<ShoppingItem>) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  updateLogistics: (fields: Partial<Pick<OrderState, 'title' | 'preferred_pickup_start_time' | 'note_for_rider' | 'tip_amount'>>) => void;
  setAddressMode: (mode: 'saved' | 'custom') => void;
  setSavedAddressId: (id: string | null) => void;
  updateCustomAddress: (updates: Partial<CustomAddress>) => void;
  
  // Validation Checkers
  isLastItemValid: () => boolean;
  clearStore: () => void;
}

const initialFormValues = {
  step: 'market' as const,
  title: '',
  preferred_pickup_start_time: '',
  note_for_rider: '',
  tip_amount: 10,
  market_location: { lat: -1.286389, lng: 36.817223, description: '' },
  items: [{ product_name: '', unit: 'kg', quantity: 1, substitute_allowed: true }],
  addressMode: 'saved' as const,
  delivery_address_id: null,
  custom_delivery_location: null,
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      ...initialFormValues,

      setStep: (step) => set({ step }),

      updateMarketLocation: (lat, lng, description) => set((state) => ({
        market_location: { 
          lat, 
          lng, 
          description: description !== undefined ? description : state.market_location.description 
        }
      })),

      updateItem: (index, updates) => set((state) => {
        const newItems = [...state.items];
        newItems[index] = { ...newItems[index], ...updates };
        return { items: newItems };
      }),

      isLastItemValid: () => {
        const items = get().items;
        if (items.length === 0) return false;
        const lastItem = items[items.length - 1];
        return (
          lastItem.product_name.trim() !== '' &&
          lastItem.unit.trim() !== '' &&
          lastItem.quantity > 0
        );
      },

      addItem: () => {
        if (get().isLastItemValid()) {
          set((state) => ({
            items: [...state.items, { product_name: '', unit: 'kg', quantity: 1, substitute_allowed: true }]
          }));
        }
      },

      removeItem: (index) => set((state) => {
        if (state.items.length <= 1) return {};
        return { items: state.items.filter((_, i) => i !== index) };
      }),

      updateLogistics: (fields) => set((state) => ({ ...state, ...fields })),

      setAddressMode: (mode) => set((state) => ({
        addressMode: mode,
        // Initialize basic structure if custom option selected
        custom_delivery_location: mode === 'custom' && !state.custom_delivery_location 
          ? { lat: -1.286389, lng: 36.817223, description: '' } 
          : state.custom_delivery_location
      })),

      setSavedAddressId: (id) => set({ delivery_address_id: id }),

      updateCustomAddress: (updates) => set((state) => ({
        custom_delivery_location: state.custom_delivery_location 
          ? { ...state.custom_delivery_location, ...updates }
          : { lat: -1.286389, lng: 36.817223, description: '', ...updates }
      })),

      clearStore: () => set(initialFormValues),
    }),
    {
      name: 'market-order-persistence-store',
    }
  )
);