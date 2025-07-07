import axios from 'axios';
import { 
  Patient, 
  Appointment, 
  DashboardStats, 
  ApiResponse, 
  BackendResponse,
  AddPatientRequest,
  UpdatePatientRequest,
  AddAppointmentRequest,
  UpdateAppointmentRequest
} from '../types';

// Configure base URL - this will be your backend API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://userservice-app-sea.azurewebsites.net/user-service';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors and transform backend responses
api.interceptors.response.use(
  (response) => {
    // Transform backend ResponseDto to frontend ApiResponse
    if (response.data && typeof response.data === 'object') {
      const backendData = response.data as any;
      
      // Check if it's a backend ResponseDto structure (has status field)
      if (backendData.hasOwnProperty('status')) {
        // Handle boolean status (true/false) from ResponseDto - current backend format
        if (typeof backendData.status === 'boolean') {
          response.data = {
            success: backendData.status, // true becomes success: true, false becomes success: false
            data: backendData.data,
            message: backendData.message
          };
        } 
        // Handle string status ('SUCCESS'/'FAILURE') - keeping for backward compatibility
        else if (backendData.status === 'SUCCESS') {
          response.data = {
            success: true,
            data: backendData.data,
            message: backendData.message
          };
        } else if (backendData.status === 'FAILURE') {
          response.data = {
            success: false,
            data: null,
            message: backendData.message,
            errors: backendData.errors
          };
        }
      }
    }
    return response;
  },
  (error) => {
    // Check if this is an auth endpoint - don't redirect for auth failures
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Handle unauthorized access for non-auth endpoints
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth service for mobile-based OTP authentication
export const authService = {
  // Send OTP to mobile number
  requestOtp: async (mobile: string, isoCode: string, userType: string = 'PATIENT'): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/auth/login', { 
        mobile, 
        isoCode, 
        userType,
        loginWithPin: false 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Validate OTP and login
  validateOtp: async (mobile: string, isoCode: string, otp: string, userType: string = 'PATIENT'): Promise<ApiResponse<{ token: string; user: any }>> => {
    try {
      const response = await api.post('/auth/validateOtp', { 
        mobile, 
        isoCode, 
        otp,
        userType,
        loginWithPin: false 
      });
      return response.data;
    } catch (error: any) {
      // For auth endpoints, don't rethrow the error if it's a validation failure
      if (error.response?.status >= 400 && error.response?.status < 500) {
        // Return a controlled failure response instead of throwing
        return {
          success: false,
          data: undefined as any,
          message: error.response?.data?.message || 'Invalid OTP. Please try again.'
        };
      }
      throw error;
    }
  },

  // Resend OTP
  resendOtp: async (mobile: string, isoCode: string, userType: string = 'PATIENT'): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post('/auth/resendOtp', { 
        mobile, 
        isoCode, 
        userType,
        loginWithPin: false 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('authToken');
  },
};

export const patientService = {
  getAll: async (): Promise<Patient[]> => {
    try {
      const response = await api.get('/patient/get/all');
      const apiResponse = response.data as ApiResponse<Patient[]>;
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Return mock data for development
      return mockPatients;
    }
  },

  getById: async (id: string): Promise<Patient | null> => {
    try {
      const response = await api.get(`/patient/get/${id}`);
      const apiResponse = response.data as ApiResponse<Patient>;
      return apiResponse.data || null;
    } catch (error) {
      console.error('Error fetching patient:', error);
      return mockPatients.find(p => p.uuid === id) || null;
    }
  },

  getByMobile: async (mobile: string): Promise<Patient | null> => {
    try {
      const response = await api.get(`/patient/get/mobile/${mobile}`);
      const apiResponse = response.data as ApiResponse<Patient>;
      return apiResponse.data || null;
    } catch (error) {
      console.error('Error fetching patient by mobile:', error);
      return mockPatients.find(p => p.mobile === mobile) || null;
    }
  },

  search: async (query: string): Promise<Patient[]> => {
    try {
      const response = await api.get(`/patient/search?query=${encodeURIComponent(query)}`);
      const apiResponse = response.data as ApiResponse<Patient[]>;
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error searching patients:', error);
      return mockPatients.filter(p => 
        p.firstName.toLowerCase().includes(query.toLowerCase()) ||
        p.lastName.toLowerCase().includes(query.toLowerCase()) ||
        p.mobile.includes(query)
      );
    }
  },

  create: async (patientData: AddPatientRequest): Promise<Patient> => {
    try {
      const response = await api.post('/patient/add', patientData);
      const apiResponse = response.data as ApiResponse<Patient>;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }
      throw new Error(apiResponse.message || 'Failed to create patient');
    } catch (error) {
      console.error('Error creating patient:', error);
      // Return mock created patient for development
      const newPatient: Patient = {
        ...patientData,
        uuid: Date.now().toString(),
        status: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockPatients.push(newPatient);
      return newPatient;
    }
  },

  update: async (updateData: UpdatePatientRequest): Promise<Patient> => {
    try {
      const response = await api.put('/patient/update', updateData);
      const apiResponse = response.data as ApiResponse<Patient>;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }
      throw new Error(apiResponse.message || 'Failed to update patient');
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await api.delete(`/patient/delete/${id}`);
      const apiResponse = response.data as ApiResponse<string>;
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to delete patient');
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  },
};

export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    try {
      const response = await api.get('/appointment/get/all');
      const apiResponse = response.data as ApiResponse<Appointment[]>;
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return mockAppointments;
    }
  },

  getById: async (id: string): Promise<Appointment | null> => {
    try {
      const response = await api.get(`/appointment/get/${id}`);
      const apiResponse = response.data as ApiResponse<Appointment>;
      return apiResponse.data || null;
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return mockAppointments.find(a => a.uuid === id) || null;
    }
  },

  getByPatient: async (patientId: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/appointment/get/patient/${patientId}`);
      const apiResponse = response.data as ApiResponse<Appointment[]>;
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return mockAppointments.filter(a => a.patientId === patientId);
    }
  },

  getByDoctor: async (doctorId: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/appointment/get/doctor/${doctorId}`);
      const apiResponse = response.data as ApiResponse<Appointment[]>;
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      return mockAppointments.filter(a => a.doctorId === doctorId);
    }
  },

  getByDate: async (date: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/appointment/get/date/${date}`);
      const apiResponse = response.data as ApiResponse<Appointment[]>;
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      return mockAppointments.filter(a => a.date === date);
    }
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/appointment/get/date-range?startDate=${startDate}&endDate=${endDate}`);
      const apiResponse = response.data as ApiResponse<Appointment[]>;
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error fetching appointments by date range:', error);
      return mockAppointments.filter(a => a.date >= startDate && a.date <= endDate);
    }
  },

  getTodaysAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await api.get('/appointment/get/today');
      const apiResponse = response.data as ApiResponse<Appointment[]>;
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error fetching today\'s appointments:', error);
      const today = new Date().toISOString().split('T')[0];
      return mockAppointments.filter(a => a.date === today);
    }
  },

  getUpcomingAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await api.get('/appointment/get/upcoming');
      const apiResponse = response.data as ApiResponse<Appointment[]>;
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      const today = new Date().toISOString().split('T')[0];
      return mockAppointments.filter(a => 
        a.date > today && a.appointmentStatus === 'SCHEDULED'
      );
    }
  },

  getByStatus: async (status: string): Promise<Appointment[]> => {
    try {
      const response = await api.get(`/appointment/get/status/${status}`);
      const apiResponse = response.data as ApiResponse<Appointment[]>;
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error fetching appointments by status:', error);
      return mockAppointments.filter(a => a.appointmentStatus === status);
    }
  },

  create: async (appointmentData: AddAppointmentRequest): Promise<Appointment> => {
    try {
      const response = await api.post('/appointment/add', appointmentData);
      const apiResponse = response.data as ApiResponse<Appointment>;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }
      throw new Error(apiResponse.message || 'Failed to create appointment');
    } catch (error) {
      console.error('Error creating appointment:', error);
      // Return mock created appointment for development
      const newAppointment: Appointment = {
        uuid: Date.now().toString(),
        patientId: appointmentData.patientId,
        patientName: 'Patient Name', // This would come from the backend
        doctorId: appointmentData.doctorId,
        doctorName: appointmentData.doctorName,
        date: appointmentData.appointmentDate,
        time: appointmentData.appointmentTime,
        duration: appointmentData.durationMinutes,
        reason: appointmentData.reason,
        appointmentStatus: appointmentData.status || 'SCHEDULED',
        notes: appointmentData.notes,
        appointmentType: appointmentData.appointmentType,
        estimatedCost: appointmentData.estimatedCost,
        status: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockAppointments.push(newAppointment);
      return newAppointment;
    }
  },

  schedule: async (appointmentData: AddAppointmentRequest): Promise<Appointment> => {
    try {
      const response = await api.post('/appointment/schedule', appointmentData);
      const apiResponse = response.data as ApiResponse<Appointment>;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }
      throw new Error(apiResponse.message || 'Failed to schedule appointment');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      throw error;
    }
  },

  update: async (updateData: UpdateAppointmentRequest): Promise<Appointment> => {
    try {
      const response = await api.put('/appointment/update', updateData);
      const apiResponse = response.data as ApiResponse<Appointment>;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }
      throw new Error(apiResponse.message || 'Failed to update appointment');
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  reschedule: async (appointmentId: string, newDate: string, newTime: string): Promise<Appointment> => {
    try {
      const response = await api.put(`/appointment/reschedule/${appointmentId}?newDate=${newDate}&newTime=${newTime}`);
      const apiResponse = response.data as ApiResponse<Appointment>;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }
      throw new Error(apiResponse.message || 'Failed to reschedule appointment');
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  },

  cancel: async (appointmentId: string, reason?: string): Promise<Appointment> => {
    try {
      const url = reason 
        ? `/appointment/cancel/${appointmentId}?reason=${encodeURIComponent(reason)}`
        : `/appointment/cancel/${appointmentId}`;
      const response = await api.put(url);
      const apiResponse = response.data as ApiResponse<Appointment>;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }
      throw new Error(apiResponse.message || 'Failed to cancel appointment');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },

  complete: async (appointmentId: string, notes?: string, actualDuration?: number): Promise<Appointment> => {
    try {
      let url = `/appointment/complete/${appointmentId}`;
      const params = new URLSearchParams();
      if (notes) params.append('notes', notes);
      if (actualDuration) params.append('actualDuration', actualDuration.toString());
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await api.put(url);
      const apiResponse = response.data as ApiResponse<Appointment>;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }
      throw new Error(apiResponse.message || 'Failed to complete appointment');
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  },

  updateStatus: async (appointmentId: string, status: string): Promise<Appointment> => {
    try {
      const response = await api.put(`/appointment/status/${appointmentId}?status=${status}`);
      const apiResponse = response.data as ApiResponse<Appointment>;
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data;
      }
      throw new Error(apiResponse.message || 'Failed to update appointment status');
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  checkAvailability: async (doctorId: string, date: string, startTime: string, durationMinutes: number): Promise<boolean> => {
    try {
      const response = await api.get(`/appointment/availability/check?doctorId=${doctorId}&date=${date}&startTime=${startTime}&durationMinutes=${durationMinutes}`);
      const apiResponse = response.data as ApiResponse<boolean>;
      return apiResponse.data || false;
    } catch (error) {
      console.error('Error checking appointment availability:', error);
      return false;
    }
  },

  getAvailableSlots: async (doctorId: string, date: string): Promise<string[]> => {
    try {
      const response = await api.get(`/appointment/availability/slots?doctorId=${doctorId}&date=${date}`);
      const apiResponse = response.data as ApiResponse<string[]>;
      return apiResponse.data || [];
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']; // Default slots
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await api.delete(`/appointment/delete/${id}`);
      const apiResponse = response.data as ApiResponse<string>;
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to delete appointment');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await api.get('/dashboard/stats');
      const apiResponse = response.data as ApiResponse<DashboardStats>;
      return apiResponse.data || {
        totalPatients: 0,
        todaysAppointments: 0,
        upcomingAppointments: 0,
        completedAppointments: 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalPatients: mockPatients.length,
        todaysAppointments: mockAppointments.filter(a => 
          new Date(a.date).toDateString() === new Date().toDateString()
        ).length,
        upcomingAppointments: mockAppointments.filter(a => 
          new Date(a.date) > new Date() && a.appointmentStatus === 'SCHEDULED'
        ).length,
        completedAppointments: mockAppointments.filter(a => a.appointmentStatus === 'COMPLETED').length,
      };
    }
  },
};

// Mock data for development
const mockPatients: Patient[] = [
  {
    uuid: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-06-15',
    email: 'john.doe@email.com',
    mobile: '+1-555-0123',
    address: '123 Main St, City, State 12345',
    medicalHistory: 'Hypertension, managed with medication',
    allergies: 'Penicillin',
    emergencyContactName: 'Jane Doe',
    emergencyContactPhone: '+1-555-0124',
    insuranceProvider: 'Blue Cross Blue Shield',
    insurancePolicyNumber: 'BC123456789',
    bloodGroup: 'O+',
    gender: 'Male',
    status: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    uuid: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1990-09-22',
    email: 'jane.smith@email.com',
    mobile: '+1-555-0124',
    address: '456 Oak Ave, City, State 12345',
    medicalHistory: 'No significant medical history',
    allergies: 'None known',
    emergencyContactName: 'John Smith',
    emergencyContactPhone: '+1-555-0125',
    insuranceProvider: 'Aetna',
    insurancePolicyNumber: 'AET987654321',
    bloodGroup: 'A-',
    gender: 'Female',
    status: true,
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
  },
];

const mockAppointments: Appointment[] = [
  {
    uuid: '1',
    patientId: '1',
    patientName: 'John Doe',
    doctorId: '1',
    doctorName: 'Dr. Smith',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 30,
    reason: 'Regular checkup',
    appointmentStatus: 'SCHEDULED',
    notes: '',
    appointmentType: 'Consultation',
    estimatedCost: 150,
    status: true,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    uuid: '2',
    patientId: '2',
    patientName: 'Jane Smith',
    doctorId: '1',
    doctorName: 'Dr. Smith',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00',
    duration: 45,
    reason: 'Follow-up consultation',
    appointmentStatus: 'SCHEDULED',
    notes: '',
    appointmentType: 'Follow-up',
    estimatedCost: 200,
    status: true,
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
];

export default api;
