export type UserRole = 'tenant' | 'landlord' | 'admin' | 'property_manager';

export type UtilityType = 'water' | 'wifi';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  is_verified: boolean;
  is_superuser: boolean;
  last_login: string | null;
  profile_picture: string | null;
  notification_email: boolean;
  notification_sms: boolean;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface PortalLoginCredentials {
  access_key: string;
  password: string;
  portal: 'admin' | 'landlord';
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  first_name: string;
  last_name: string;
  terms_accepted: boolean;
  room_number?: string;
  monthly_rent?: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  new_password: string;
}

// Property Types
export interface Property {
  id: number;
  uuid: string;
  name: string;
  property_type: string;
  description: string | null;
  year_built: number | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  total_units: number;
  total_area: number | null;
  lot_size: number | null;
  parking_spaces: number | null;
  stories: number | null;
  amenities: Record<string, unknown>;
  utilities_included: Record<string, unknown>;
  purchase_price: number | null;
  current_value: number | null;
  annual_taxes: number | null;
  insurance_cost: number | null;
  status: string;
  is_active: boolean;
  owner_id: number;
  created_at: string;
  updated_at: string;
  total_rental_income: number;
  occupancy_rate: number;
}

// Unit Types
export interface Unit {
  id: number;
  uuid: string;
  property_id: number;
  unit_number: string;
  floor: number | null;
  bedrooms: number;
  bathrooms: number;
  monthly_rent: number;
  is_occupied: boolean;
  created_at: string;
  updated_at: string;
  property?: Property;
}

// Tenant Types
export interface Tenant {
  id: number;
  uuid: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  employer: string | null;
  annual_income: number | null;
  unit_id: number | null;
  status: 'active' | 'inactive' | 'evicted';
  notes: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  unit?: Unit;
}

// Payment Types
export interface Payment {
  id: number;
  uuid: string;
  tenant_id: number;
  lease_id: number | null;
  user_id: number | null;
  amount: number;
  payment_date: string;
  due_date: string;
  payment_method: 'bank_transfer' | 'cash' | 'check' | 'card' | 'mpesa' | 'qrcode_scan';
  status: 'pending' | 'paid' | 'overdue' | 'failed';
  transaction_id: string | null;
  mpesa_code: string | null;
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tenant?: Tenant;
  user?: User;
}

// Maintenance Types
export interface MaintenanceRequest {
  id: number;
  uuid: string;
  tenant_id: number;
  property_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'emergency';
  created_at: string;
  updated_at: string;
  tenant?: Tenant;
  property?: Property;
}

// Notification Types
export interface Notification {
  id: number;
  uuid: string;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  type: 'info' | 'warning' | 'success' | 'error' | 'payment' | 'maintenance' | 'system';
  created_at: string;
  updated_at: string;
}

// Message Types
export interface Message {
  id: number;
  uuid: string;
  sender_id: number;
  recipient_id: number;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
  sender?: User;
  recipient?: User;
}

export interface Contact {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
}

// Document Types
export interface Document {
  id: number;
  uuid: string;
  tenant_id: number;
  property_id: number | null;
  name: string;
  file_url: string;
  document_type: string;
  uploaded_at: string;
  uploaded_by_id: number | null;
}

// Utility Types
export interface UtilityCharge {
  id: number;
  uuid: string;
  utility_type: 'water' | 'wifi';
  units_consumed: number | null;
  amount: number;
  billing_month: string;
  status: 'pending' | 'paid';
  notes: string | null;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface UtilityStatement {
  tenant_name: string;
  tenant_email: string | null;
  tenant_phone: string | null;
  property_name: string;
  unit_number: string;
  billing_month: string;
  charges: Array<{
    id: number;
    utility_type: string;
    units_consumed: number | null;
    amount: number;
    status: string;
    notes: string | null;
  }>;
  total_amount: number;
  generated_at: string;
}

export interface UtilityProfitSummary {
  total_rent_income: number;
  total_water_expense: number;
  total_wifi_expense: number;
  total_water: number;
  total_wifi: number;
  total_utility_expense: number;
  net_profit: number;
  total_water_units: number;
  charge_count: number;
  paid_count: number;
  pending_count: number;
  billing_month: string | null;
  currency: string;
}

// Dashboard Types
export interface DashboardStats {
  total_properties: number;
  total_units: number;
  occupied_units: number;
  vacant_units: number;
  total_tenants: number;
  total_revenue: number;
  pending_payments: number;
  overdue_payments: number;
  maintenance_requests: number;
}

export interface AdminStats {
  total_properties: number;
  total_tenants: number;
  total_payments: number;
  total_revenue: number;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
}

// Arrears Types
export interface ArrearsInfo {
  total_arrears: number;
  last_payment_date: string | null;
  months_overdue: number;
}

// Feedback/Review Types
export interface Feedback {
  id: number;
  uuid: string;
  tenant_id: number;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  urgency: string;
  created_at: string;
  updated_at: string;
  tenant?: Tenant;
}

export interface Review {
  id: number;
  uuid: string;
  tenant_id: number;
  property_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Form Types
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationError {
  detail: FormError[];
}