/**
 * BookPage Database Types
 * Generated TypeScript types for Supabase database
 */

// ============================================
// ENUM TYPES
// ============================================

export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';
export type HoldStatus = 'active' | 'converted' | 'expired' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';
export type DocumentType = 'registration' | 'gstin' | 'utility_bill' | 'license' | 'other';
export type ReferralStatus = 'pending' | 'completed' | 'expired';

// ============================================
// TABLE TYPES
// ============================================

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  referral_code: string | null;
  credits_earned: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  referral_code?: string | null;
  credits_earned?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProfileUpdate {
  id?: string;
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  referral_code?: string | null;
  credits_earned?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  location: string | null;
  location_lat: number | null;
  location_lng: number | null;
  images: string[];
  amenities: string[];
  is_verified: boolean;
  verification_status: VerificationStatus;
  is_hibernating: boolean;
  last_login_at: string;
  hibernation_warning_sent: boolean;
  subscription_status: SubscriptionStatus;
  subscription_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyInsert {
  id?: string;
  owner_id: string;
  name: string;
  slug: string;
  description?: string | null;
  location?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  images?: string[];
  amenities?: string[];
  is_verified?: boolean;
  verification_status?: VerificationStatus;
  is_hibernating?: boolean;
  last_login_at?: string;
  hibernation_warning_sent?: boolean;
  subscription_status?: SubscriptionStatus;
  subscription_ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PropertyUpdate {
  id?: string;
  owner_id?: string;
  name?: string;
  slug?: string;
  description?: string | null;
  location?: string | null;
  location_lat?: number | null;
  location_lng?: number | null;
  images?: string[];
  amenities?: string[];
  is_verified?: boolean;
  verification_status?: VerificationStatus;
  is_hibernating?: boolean;
  last_login_at?: string;
  hibernation_warning_sent?: boolean;
  subscription_status?: SubscriptionStatus;
  subscription_ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RoomType {
  id: string;
  property_id: string;
  name: string;
  description: string | null;
  price_per_night: number;
  max_guests: number;
  num_beds: number;
  bed_type: string;
  images: string[];
  amenities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoomTypeInsert {
  id?: string;
  property_id: string;
  name: string;
  description?: string | null;
  price_per_night: number;
  max_guests: number;
  num_beds?: number;
  bed_type?: string;
  images?: string[];
  amenities?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RoomTypeUpdate {
  id?: string;
  property_id?: string;
  name?: string;
  description?: string | null;
  price_per_night?: number;
  max_guests?: number;
  num_beds?: number;
  bed_type?: string;
  images?: string[];
  amenities?: string[];
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Room {
  id: string;
  property_id: string;
  room_type_id: string | null;
  room_number: string;
  floor_number: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoomInsert {
  id?: string;
  property_id: string;
  room_type_id?: string | null;
  room_number: string;
  floor_number?: number;
  is_active?: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface RoomUpdate {
  id?: string;
  property_id?: string;
  room_type_id?: string | null;
  room_number?: string;
  floor_number?: number;
  is_active?: boolean;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BlockedDate {
  id: string;
  room_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export interface BlockedDateInsert {
  id?: string;
  room_id: string;
  start_date: string;
  end_date: string;
  reason?: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface BlockedDateUpdate {
  id?: string;
  room_id?: string;
  start_date?: string;
  end_date?: string;
  reason?: string | null;
  created_by?: string | null;
  created_at?: string;
}

export interface Hold {
  id: string;
  property_id: string;
  room_type_id: string;
  room_id: string | null;
  hold_code: string;
  check_in: string;
  check_out: string;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  num_guests: number;
  status: HoldStatus;
  expires_at: string;
  converted_booking_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface HoldInsert {
  id?: string;
  property_id: string;
  room_type_id: string;
  room_id?: string | null;
  hold_code?: string;
  check_in: string;
  check_out: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string | null;
  num_guests?: number;
  status?: HoldStatus;
  expires_at?: string;
  converted_booking_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HoldUpdate {
  id?: string;
  property_id?: string;
  room_type_id?: string;
  room_id?: string | null;
  hold_code?: string;
  check_in?: string;
  check_out?: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string | null;
  num_guests?: number;
  status?: HoldStatus;
  expires_at?: string;
  converted_booking_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  property_id: string;
  room_id: string | null;
  hold_id: string | null;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  num_guests: number;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingInsert {
  id?: string;
  property_id: string;
  room_id?: string | null;
  hold_id?: string | null;
  guest_name: string;
  guest_phone: string;
  guest_email?: string | null;
  num_guests?: number;
  check_in: string;
  check_out: string;
  total_amount: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  notes?: string | null;
  cancellation_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BookingUpdate {
  id?: string;
  property_id?: string;
  room_id?: string | null;
  hold_id?: string | null;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string | null;
  num_guests?: number;
  check_in?: string;
  check_out?: string;
  total_amount?: number;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  notes?: string | null;
  cancellation_reason?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface VerificationDocument {
  id: string;
  property_id: string;
  document_type: DocumentType;
  document_url: string;
  document_number: string | null;
  status: VerificationStatus;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  uploaded_at: string;
}

export interface VerificationDocumentInsert {
  id?: string;
  property_id: string;
  document_type: DocumentType;
  document_url: string;
  document_number?: string | null;
  status?: VerificationStatus;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  uploaded_at?: string;
}

export interface VerificationDocumentUpdate {
  id?: string;
  property_id?: string;
  document_type?: DocumentType;
  document_url?: string;
  document_number?: string | null;
  status?: VerificationStatus;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  uploaded_at?: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string | null;
  referral_code_used: string;
  status: ReferralStatus;
  credits_awarded: number;
  created_at: string;
  completed_at: string | null;
}

export interface ReferralInsert {
  id?: string;
  referrer_id: string;
  referred_id?: string | null;
  referral_code_used: string;
  status?: ReferralStatus;
  credits_awarded?: number;
  created_at?: string;
  completed_at?: string | null;
}

export interface ReferralUpdate {
  id?: string;
  referrer_id?: string;
  referred_id?: string | null;
  referral_code_used?: string;
  status?: ReferralStatus;
  credits_awarded?: number;
  created_at?: string;
  completed_at?: string | null;
}

export interface PageView {
  id: string;
  property_id: string;
  viewed_at: string;
  ip_hash: string | null;
  user_agent: string | null;
  referrer: string | null;
}

export interface PageViewInsert {
  id?: string;
  property_id: string;
  viewed_at?: string;
  ip_hash?: string | null;
  user_agent?: string | null;
  referrer?: string | null;
}

export interface SubscriptionPayment {
  id: string;
  property_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  transaction_id: string | null;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
}

export interface SubscriptionPaymentInsert {
  id?: string;
  property_id: string;
  amount: number;
  currency?: string;
  payment_method?: string | null;
  transaction_id?: string | null;
  status?: PaymentStatus;
  paid_at?: string | null;
  created_at?: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  performed_by: string | null;
  performed_at: string;
}

// ============================================
// COMPOSITE TYPES (for function returns)
// ============================================

export interface AvailableRoom {
  room_id: string;
  room_number: string;
  room_type_id: string;
  room_type_name: string;
  price_per_night: number;
  max_guests: number;
}

export interface PropertyStats {
  total_bookings: number;
  total_bookings_this_month: number;
  active_holds: number;
  total_page_views: number;
  total_page_views_this_month: number;
  total_revenue: number;
  total_revenue_this_month: number;
}

export interface UpcomingBooking {
  booking_id: string;
  guest_name: string;
  guest_phone: string;
  room_name: string;
  check_in: string;
  check_out: string;
  num_guests: number;
  status: BookingStatus;
  total_amount: number;
}

export interface SearchPropertyResult {
  property_id: string;
  property_name: string;
  slug: string;
  location: string;
  is_verified: boolean;
  min_price: number;
  max_price: number;
}

// ============================================
// DATABASE SCHEMA TYPE
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      properties: {
        Row: Property;
        Insert: PropertyInsert;
        Update: PropertyUpdate;
      };
      room_types: {
        Row: RoomType;
        Insert: RoomTypeInsert;
        Update: RoomTypeUpdate;
      };
      rooms: {
        Row: Room;
        Insert: RoomInsert;
        Update: RoomUpdate;
      };
      blocked_dates: {
        Row: BlockedDate;
        Insert: BlockedDateInsert;
        Update: BlockedDateUpdate;
      };
      holds: {
        Row: Hold;
        Insert: HoldInsert;
        Update: HoldUpdate;
      };
      bookings: {
        Row: Booking;
        Insert: BookingInsert;
        Update: BookingUpdate;
      };
      verification_documents: {
        Row: VerificationDocument;
        Insert: VerificationDocumentInsert;
        Update: VerificationDocumentUpdate;
      };
      referrals: {
        Row: Referral;
        Insert: ReferralInsert;
        Update: ReferralUpdate;
      };
      page_views: {
        Row: PageView;
        Insert: PageViewInsert;
      };
      subscription_payments: {
        Row: SubscriptionPayment;
        Insert: SubscriptionPaymentInsert;
      };
      audit_logs: {
        Row: AuditLog;
      };
    };
    Functions: {
      generate_hold_code: {
        Returns: string;
      };
      generate_referral_code: {
        Args: { user_name: string };
        Returns: string;
      };
      expire_holds: {
        Returns: { expired_count: number }[];
      };
      check_hibernation: {
        Returns: { hibernated_count: number; warned_count: number }[];
      };
      get_available_rooms: {
        Args: { 
          p_property_id: string; 
          p_check_in: string; 
          p_check_out: string; 
          p_room_type_id?: string 
        };
        Returns: AvailableRoom[];
      };
      is_room_available: {
        Args: { 
          p_room_id: string; 
          p_check_in: string; 
          p_check_out: string 
        };
        Returns: boolean;
      };
      convert_hold_to_booking: {
        Args: { 
          p_hold_id: string; 
          p_room_id?: string 
        };
        Returns: string; // booking_id
      };
      get_property_stats: {
        Args: { p_property_id: string };
        Returns: PropertyStats[];
      };
      complete_referral: {
        Args: { p_referral_id: string };
        Returns: boolean;
      };
      record_page_view: {
        Args: { 
          p_property_id: string; 
          p_ip_hash?: string; 
          p_user_agent?: string; 
          p_referrer?: string 
        };
        Returns: void;
      };
      update_last_login: {
        Args: { p_property_id: string };
        Returns: void;
      };
      get_upcoming_bookings: {
        Args: { 
          p_property_id: string; 
          p_limit?: number 
        };
        Returns: UpcomingBooking[];
      };
      search_properties: {
        Args: { 
          p_query: string; 
          p_location?: string; 
          p_verified_only?: boolean 
        };
        Returns: SearchPropertyResult[];
      };
    };
  };
}

// ============================================
// UTILITY TYPES
// ============================================

export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;

export type TableRow<T extends TableName> = Tables[T]['Row'];
export type TableInsert<T extends TableName> = Tables[T] extends { Insert: infer I } ? I : never;
export type TableUpdate<T extends TableName> = Tables[T] extends { Update: infer U } ? U : never;

// Helper type for selecting specific columns
export type SelectColumns<T extends TableName, K extends keyof TableRow<T>> = 
  Pick<TableRow<T>, K>;

// Helper type for relations
export interface PropertyWithRooms extends Property {
  rooms: Room[];
  room_types: RoomType[];
}

export interface PropertyWithDetails extends Property {
  owner: Profile;
  room_types: RoomType[];
  rooms: Room[];
}

export interface BookingWithDetails extends Booking {
  property: Property;
  room: Room | null;
  hold: Hold | null;
}

export interface HoldWithDetails extends Hold {
  property: Property;
  room_type: RoomType;
  room: Room | null;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// FORM INPUT TYPES
// ============================================

export interface BookingFormData {
  property_id: string;
  room_type_id: string;
  room_id?: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  num_guests: number;
  check_in: string;
  check_out: string;
  notes?: string;
}

export interface HoldFormData {
  property_id: string;
  room_type_id: string;
  room_id?: string;
  guest_name: string;
  guest_phone: string;
  guest_email?: string;
  num_guests: number;
  check_in: string;
  check_out: string;
}

export interface PropertyFormData {
  name: string;
  slug: string;
  description?: string;
  location?: string;
  location_lat?: number;
  location_lng?: number;
  images?: string[];
  amenities?: string[];
}

export interface RoomTypeFormData {
  property_id: string;
  name: string;
  description?: string;
  price_per_night: number;
  max_guests: number;
  num_beds?: number;
  bed_type?: string;
  images?: string[];
  amenities?: string[];
}

export interface BlockedDateFormData {
  room_id: string;
  start_date: string;
  end_date: string;
  reason?: string;
}

export interface VerificationDocumentFormData {
  property_id: string;
  document_type: DocumentType;
  document_url: string;
  document_number?: string;
}
