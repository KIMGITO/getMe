import { apiClient } from '@/services/apiClient';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type VehicleType = 'bike' | 'motorcycle' | 'car' | 'van' | 'truck';
export type FormStep = 'personal' | 'vehicle' | 'operational' | 'review';

export interface RiderProfileState {
  step: FormStep;
  full_name: string;
  phone_number: string;
  id_number: string;
  sacco_name: string;
  sacco_membership_number: string;
  vehicle_type: VehicleType;
  vehicle_plate_number: string;
  vehicle_model: string;
  base_latitude: number;
  base_longitude: number;
  base_location_description: string;
  operating_radius_km: number;
  owns_helmet: boolean;
  agreed_to_terms: boolean;

  // File Streams
  id_front: File | null;
  id_back: File | null;

  // Global Submission UI States
  isSubmitting: boolean;
  submitError: string | null;
}

interface RiderProfileActions {
  setStep: (step: FormStep) => void;
  updateFields: (fields: Partial<Omit<RiderProfileState, 'id_front' | 'id_back' | 'isSubmitting' | 'submitError'>>) => void;
  setFiles: (files: { id_front?: File | null; id_back?: File | null }) => void;
  clearStore: () => void;
  submitProfile: () => Promise<{ success: boolean; error?: string }>;
}

const INITIAL_STATE: Omit<RiderProfileState, 'id_front' | 'id_back' | 'isSubmitting' | 'submitError'> = {
  step: 'personal',
  full_name: '',
  phone_number: '',
  id_number: '',
  sacco_name: '',
  sacco_membership_number: '',
  vehicle_type: 'motorcycle',
  vehicle_plate_number: '',
  vehicle_model: '',
  base_latitude: -1.2921, 
  base_longitude: 36.8219,
  base_location_description: '',
  operating_radius_km: 5,
  owns_helmet: false,
  agreed_to_terms: false,
};

export const useRiderProfileStore = create<RiderProfileState & RiderProfileActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,
      id_front: null,
      id_back: null,
      isSubmitting: false,
      submitError: null,

      setStep: (step) => set({ step }),
      updateFields: (fields) => set((state) => ({ ...state, ...fields })),
      setFiles: (files) => set((state) => ({ ...state, ...files })),
      clearStore: () => set({ ...INITIAL_STATE, id_front: null, id_back: null, isSubmitting: false, submitError: null }),

      submitProfile: async () => {
        const  endpoint = import.meta.env.VITE_API_BASE_URL + '/riders/profile';
        set({ isSubmitting: true, submitError: null });

        try {
          const state = get();
          const formData = new FormData();

          // 1. Append structural/primitive fields dynamically
          const primitiveKeys = Object.keys(INITIAL_STATE) as Array<keyof typeof INITIAL_STATE>;
          primitiveKeys.forEach((key) => {
            const value = state[key];
            if (value !== undefined && value !== null) {
              formData.append(key, String(value));
            }
          });

          // 2. FIX: Guard with strict "instanceof File" checks to prevent sending stringified objects
          if (state.id_front && state.id_front instanceof File) {
            formData.append('id_front', state.id_front);
          }
          if (state.id_back && state.id_back instanceof File) {
            formData.append('id_back', state.id_back);
          }

          // 3. Execute the network request
          // const response = await fetch(endpoint, {
          //   method: 'POST',
          //   body: formData,
          // });

          const  response = await apiClient.post('/riders/profile', formData);

          if (response.status !== 200) {
            throw new Error( `Server responded with status ${response.status}`);
          }

          get().clearStore();
          return { success: true };

        } catch (error: any) {
          const errorMessage = error?.message || 'An unexpected error occurred during submission.';
          set({ isSubmitting: false, submitError: errorMessage });
          return { success: false, error: errorMessage };
        }
      }
    }),
    {
      name: 'codensons_rider_onboarding_cache',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { id_front, id_back, isSubmitting, submitError, ...rest } = state;
        return rest;
      },
      // FIX: Forces file references to always evaluate to null upon loading from localStorage,
      // completely cleaning up any older corrupted session object properties.
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        id_front: null, 
        id_back: null,
      }),
    }
  )
);