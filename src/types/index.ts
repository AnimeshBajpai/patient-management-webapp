export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  address: string;
  medicalHistory: string;
  allergies: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}
