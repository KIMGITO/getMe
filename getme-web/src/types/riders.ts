export type VehicleType = 'bike' | 'motorcycle' | 'car' | 'van' | 'truck';
export type OnboardingStatus = 'pending' | 'verified' | 'rejected' | 'incomplete';
export type FormStep = 'personal' | 'vehicle' | 'operational' | 'review';


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

export interface RiderOnboardingResponse {
  success: boolean;
  message: string;
  rider_id?: string;
  status?: OnboardingStatus;
}

export interface BaseRiderFields {
  name: string;
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
}

// form component payload
export interface RiderProfilePayload extends BaseRiderFields {
  id_front: File | null;
  id_back: File | null;
}

export interface RiderProfileState extends RiderProfilePayload {
  step: FormStep;
  isSubmitting: boolean;
  submitError: string | null;
}

export interface FetchedRiderData extends BaseRiderFields {
  id: string; 
  id_front: string; 
  id_back: string; 
  status: 'pending' | 'verified' | 'suspended'; 
  created_at: string;
  updated_at: string;
}

export interface RiderStore {
  rider: FetchedRiderData | null;
  isLoading: boolean;
  fetchRiderProfile: () => Promise<void>;
  clearRider: () => void;
}