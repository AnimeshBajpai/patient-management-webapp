export interface Patient {
  uuid: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  mobile: string;
  address: string;
  medicalHistory?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  bloodGroup?: string;
  gender?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Appointment {
  uuid: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  reason?: string;
  appointmentStatus: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  notes?: string;
  appointmentType?: string;
  estimatedCost?: number;
  actualDurationMinutes?: number;
  cancellationReason?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Request DTOs for API calls
export interface AddPatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  mobile: string;
  address: string;
  medicalHistory?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  bloodGroup?: string;
  gender?: string;
}

export interface UpdatePatientRequest {
  patientId: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  email?: string;
  mobile?: string;
  address?: string;
  medicalHistory?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  bloodGroup?: string;
  gender?: string;
}

export interface AddAppointmentRequest {
  patientId: string;
  doctorId: string;
  doctorName: string;
  appointmentDate: string; // YYYY-MM-DD format
  appointmentTime: string; // HH:MM format
  durationMinutes: number;
  reason?: string;
  notes?: string;
  appointmentType?: string;
  estimatedCost?: number;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
}

export interface UpdateAppointmentRequest {
  appointmentId: string;
  doctorId?: string;
  doctorName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  durationMinutes?: number;
  reason?: string;
  notes?: string;
  appointmentType?: string;
  estimatedCost?: number;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
  actualDurationMinutes?: number;
  cancellationReason?: string;
}

export interface DashboardStats {
  totalPatients: number;
  todaysAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'patient';
}

// Complete user data from backend AclUserDto
export interface AclUser {
  uuid: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  status: boolean;
  userType: 'DOCTOR' | 'PATIENT' | 'ADMIN';
  isoCode: string;
  mobile: string;
  mobileVerified: boolean;
  email?: string;
  emailVerified: boolean;
  department?: string;
  firstName?: string;
  lastName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationality?: string;
  acl?: any[];
  locationAcl?: any[];
}

// User profile for UI display
export interface UserProfile {
  id: string;
  uuid: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobile: string;
  userType: 'DOCTOR' | 'PATIENT' | 'ADMIN';
  department?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationality?: string;
  mobileVerified: boolean;
  emailVerified: boolean;
  status: boolean;
  role: 'doctor' | 'patient' | 'admin';
  displayName: string;
  initials: string;
}

// Backend ResponseDto structure
export interface BackendResponse<T> {
  status: 'SUCCESS' | 'FAILURE';
  message: string;
  data?: T;
  errors?: string[];
}

// Frontend API Response structure  
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

// Appointment Status mapping
export const APPOINTMENT_STATUS_LABELS = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed', 
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  RESCHEDULED: 'Rescheduled',
  NO_SHOW: 'No Show'
} as const;

export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS_LABELS;
