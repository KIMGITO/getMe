import { apiClient } from './apiClient';

export type VehicleType = 'bike' | 'motorcycle' | 'car' | 'van' | 'truck';
export type OnboardingStatus = 'pending' | 'verified' | 'rejected' | 'incomplete';

export interface RiderProfilePayload {
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
  id_front: File | null;
  id_back: File | null;
}

export interface RiderOnboardingResponse {
  success: boolean;
  message: string;
  rider_id?: string;
  status?: OnboardingStatus;
}

export interface RiderStatusMetrics {
  success: boolean;
  rider_id: string;
  status: OnboardingStatus;
  is_active: boolean;
  rejection_reason?: string;
}

export  interface RiderVerificationStatus {
  success: boolean,
  status:  OnboardingStatus
}

export const riderServices = {
 
 submitProfile: async (payload: RiderProfilePayload): Promise<RiderOnboardingResponse> => {
  const formData = new FormData();

  // 1. Loop through your payload entries to safely append text primitives
  Object.entries(payload).forEach(([key, value]) => {
    if (key !== 'id_front' && key !== 'id_back' && value !== null && value !== undefined) {
      formData.append(key, String(value));
    }
  });

  // 2. PORTED GUARD: Use strict instanceof File checks to prevent sending stringified garbage structures
  if (payload.id_front && payload.id_front instanceof File) {
    formData.append('id_front', payload.id_front);
  }
  
  if (payload.id_back && payload.id_back instanceof File) {
    formData.append('id_back', payload.id_back);
  }

  const response = await apiClient.post<RiderOnboardingResponse>('/riders/profile', formData, {
    headers: {
      'Accept': 'application/json',
    }
  });

  return response.data;
},

  /**
   * Checks verification and administrative status metrics of a specific rider profile.
   */
  getStatus: async (riderId: string): Promise<RiderStatusMetrics> => {
    if (!riderId) {
      throw new Error('Cannot fetch rider verification metrics without a valid reference ID.');
    }
    
    const response = await apiClient.get<any>(`/riders/status/${riderId}`);
    const data = response.data?.data ?? response.data;

    return {
      success: data?.success ?? true,
      rider_id: data?.rider_id ?? riderId,
      status: data?.status ?? 'incomplete',
      is_active: Boolean(data?.is_active ?? false),
      rejection_reason: data?.rejection_reason ?? undefined,
    };
  },

  /**
   * Updates operational geometric positioning coordinates dynamically.
   */
  updateLocation: async (
    riderId: string, 
    latitude: number, 
    longitude: number
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch(`/riders/location/${riderId}`, {
      latitude,
      longitude,
    });
    return response.data;
  },

  /**
   * Check if profile is verified or waiting for verification.
   */
  verificationStatus: async (): Promise<RiderVerificationStatus> => {
    const response = await apiClient.get('/riders/verification-status');
    return response.data;
  }
};