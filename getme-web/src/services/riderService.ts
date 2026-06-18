import {  RiderDashboard, RiderOnboardingResponse, RiderProfilePayload, RiderStatusMetrics, RiderVerificationStatus } from '@/types/riders';
import { apiClient } from './apiClient';

export const riderService = {

  getDashboardData:  async (): Promise<any> => {
    const response = await apiClient.get<RiderDashboard>('/riders/dashboard');
    return response.data;
  },
 
  submitProfile: async (payload: RiderProfilePayload): Promise<RiderOnboardingResponse> => {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (key !== 'id_front' && key !== 'id_back' && value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    if (payload.id_front instanceof File) {
      formData.append('id_front', payload.id_front);
    }
    if (payload.id_back instanceof File) {
      formData.append('id_back', payload.id_back);
    }

    const response = await apiClient.post<RiderOnboardingResponse>('/riders/profile', formData, {
      headers: {
        'Accept': 'application/json',
      }
    });

    return response.data;
  },

  
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
    latitude: number, 
    longitude: number,
    heading: number | null,
    speed: number | null,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch(`/riders/location`, {
      'lat': latitude,
      'lng': longitude,
      'heading': heading,
      'speed': speed
    }).catch((error) => {
      throw new Error(error.response.data.message);
    });
    return response.data;
  },

  /**
   * Check if profile is verified or waiting for verification.
   */
  verificationStatus: async (): Promise<RiderVerificationStatus> => {
    const response = await apiClient.get('/riders/verification-status');
    return response.data;
  },

  /**
   * Toggle rider online status.
   */
  toggleOnlineStatus: async (): Promise<{ success: boolean; message: string, status: boolean }> => {
    const response = await apiClient.patch('/riders/online-status');
    return response.data;
  },
};