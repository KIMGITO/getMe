import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { FormStep, RiderProfileState, RiderProfilePayload, FetchedRiderData } from '@/types/riders';

// 1. Separate state slices for operational control vs form scratchpad
interface RiderOperationalState {
  rider: FetchedRiderData | null;
  isOnline: boolean;
  isLoadingProfile: boolean;
}

interface RiderActions {
  setStep: (step: FormStep) => void;
  updateFields: (fields: Partial<Omit<RiderProfileState, 'id_front' | 'id_back'>>) => void;
  setFiles: (files: { id_front?: File | null; id_back?: File | null }) => void;
  clearForm: () => void; // Clears form ONLY, leaves operational state intact
  getSubmissionPayload: () => RiderProfilePayload;

  // Operational State Actions
  setRiderProfile: (rider: FetchedRiderData | null) => void;
  setOnlineStatus: (status: boolean) => void;
  setLoadingProfile: (loading: boolean) => void;
  
  // Master Reset (Use only for explicit user logout)
  resetAll: () => void;
}

const INITIAL_FORM_STATE = {
  step: 'personal' as FormStep,
  name: '',
  phone_number: '',
  id_number: '',
  sacco_name: '',
  sacco_membership_number: '',
  vehicle_type: 'motorcycle' as const,
  vehicle_plate_number: '',
  vehicle_model: '',
  base_latitude: -1.2921, // Nairobi default
  base_longitude: 36.8219,
  base_location_description: '',
  operating_radius_km: 5,
  owns_helmet: false,
  agreed_to_terms: false,
};

export const useRiderStore = create<Omit<RiderProfileState, 'isSubmitting' | 'submitError'> & RiderOperationalState & RiderActions>()(
  persist(
    (set, get) => ({
      // Mount Core Form State
      ...INITIAL_FORM_STATE,
      id_front: null,
      id_back: null,

      // Mount Operational State
      rider: null,
      isOnline: false,
      isLoadingProfile: false,

      /* ====================================================================
         FORM ACTIONS
         ==================================================================== */
      setStep: (step) => set({ step }),
      
      updateFields: (fields) => set((state) => ({ ...state, ...fields })),
      
      setFiles: (files) => set((state) => ({ ...state, ...files })),
      
      clearForm: () => set({
        ...INITIAL_FORM_STATE,
        id_front: null,
        id_back: null,
      }),

      getSubmissionPayload: () => {
        const state = get();
        return {
          name: state.name,
          phone_number: state.phone_number,
          id_number: state.id_number,
          sacco_name: state.sacco_name,
          sacco_membership_number: state.sacco_membership_number,
          vehicle_type: state.vehicle_type,
          vehicle_plate_number: state.vehicle_plate_number,
          vehicle_model: state.vehicle_model,
          base_latitude: state.base_latitude,
          base_longitude: state.base_longitude,
          base_location_description: state.base_location_description,
          operating_radius_km: state.operating_radius_km,
          owns_helmet: state.owns_helmet,
          agreed_to_terms: state.agreed_to_terms,
          id_front: state.id_front,
          id_back: state.id_back,
        };
      },

      /* ====================================================================
         OPERATIONAL STATUS ACTIONS
         ==================================================================== */
      setRiderProfile: (rider) => set({ rider }),
      setOnlineStatus: (isOnline) => set({ isOnline }),
      setLoadingProfile: (isLoadingProfile) => set({ isLoadingProfile }),

      // Complete system purge (useful for user session timeouts or logouts)
      resetAll: () => set({
        ...INITIAL_FORM_STATE,
        id_front: null,
        id_back: null,
        rider: null,
        isOnline: false,
        isLoadingProfile: false,
      }),
    }),
    {
      name: 'getme-rider-storage',
      storage: createJSONStorage(() => localStorage),
      // Prevent volatile binary memory files from serializing to disk
      partialize: (state) => {
        const { id_front, id_back, isLoadingProfile, ...persistedSlice } = state;
        return persistedSlice;
      },
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        id_front: null,
        id_back: null,
        isLoadingProfile: false, 
      }),
    }
  )
);