import axios from 'axios';
import { Patient, Appointment, DashboardStats, ApiResponse } from '../types';

// Configure base URL - this will be your backend API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> => {
    try {
      const response = await api.post('/auth/login', { email, password });
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
      const response = await api.get('/patients');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Return mock data for now
      return mockPatients;
    }
  },

  getById: async (id: string): Promise<Patient | null> => {
    try {
      const response = await api.get(`/patients/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      return mockPatients.find(p => p.id === id) || null;
    }
  },

  create: async (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> => {
    try {
      const response = await api.post('/patients', patient);
      return response.data.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      // Return mock created patient
      const newPatient: Patient = {
        ...patient,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockPatients.push(newPatient);
      return newPatient;
    }
  },

  update: async (id: string, patient: Partial<Patient>): Promise<Patient> => {
    try {
      const response = await api.put(`/patients/${id}`, patient);
      return response.data.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/patients/${id}`);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  },
};

export const appointmentService = {
  getAll: async (): Promise<Appointment[]> => {
    try {
      const response = await api.get('/appointments');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return mockAppointments;
    }
  },

  create: async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> => {
    try {
      const response = await api.post('/appointments', appointment);
      return response.data.data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      // Return mock created appointment
      const newAppointment: Appointment = {
        ...appointment,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockAppointments.push(newAppointment);
      return newAppointment;
    }
  },

  update: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
    try {
      const response = await api.put(`/appointments/${id}`, appointment);
      return response.data.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/appointments/${id}`);
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
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalPatients: mockPatients.length,
        todaysAppointments: mockAppointments.filter(a => 
          new Date(a.date).toDateString() === new Date().toDateString()
        ).length,
        upcomingAppointments: mockAppointments.filter(a => 
          new Date(a.date) > new Date() && a.status === 'scheduled'
        ).length,
        completedAppointments: mockAppointments.filter(a => a.status === 'completed').length,
      };
    }
  },
};

// Mock data for development
const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: '1985-06-15',
    email: 'john.doe@email.com',
    phone: '+1-555-0123',
    address: '123 Main St, City, State 12345',
    medicalHistory: 'Hypertension, managed with medication',
    allergies: 'Penicillin',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    dateOfBirth: '1990-09-22',
    email: 'jane.smith@email.com',
    phone: '+1-555-0124',
    address: '456 Oak Ave, City, State 12345',
    medicalHistory: 'No significant medical history',
    allergies: 'None known',
    createdAt: '2024-01-16T11:00:00Z',
    updatedAt: '2024-01-16T11:00:00Z',
  },
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Doe',
    doctorId: '1',
    doctorName: 'Dr. Smith',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    duration: 30,
    reason: 'Regular checkup',
    status: 'scheduled',
    notes: '',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Jane Smith',
    doctorId: '1',
    doctorName: 'Dr. Smith',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00',
    duration: 45,
    reason: 'Follow-up consultation',
    status: 'scheduled',
    notes: '',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
];

export default api;
