// Enhanced API utilities that integrate with existing structure
import { appointmentApi as existingAppointmentApi } from './appointmentApi';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Generic API helper
const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Enhanced Auth API with existing localStorage integration
export const authApi = {
  getCurrentUser: async () => {
    try {
      // First try localStorage (existing approach)
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user');
        if (userData) {
          return JSON.parse(userData);
        }
      }
      
      // Fallback to API call
      return await apiRequest('/api/auth/current-user');
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  login: async (credentials) => {
    return await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    // Clear localStorage (existing approach)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    try {
      return await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Continue even if API call fails since localStorage is cleared
      return { success: true };
    }
  },
};

// Enhanced Appointment API that extends existing functionality
export const appointmentApi = {
  // Use existing API methods
  getAppointments: async (userId, userType) => {
    try {
      return await existingAppointmentApi.getAppointments(userId, userType);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { appointments: [] };
    }
  },

  getUpcomingAppointments: async (userId, userType, limit = 5) => {
    try {
      return await existingAppointmentApi.getUpcomingAppointments(userId, userType, limit);
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return { appointments: [] };
    }
  },

  createAppointment: async (appointmentData) => {
    try {
      return await existingAppointmentApi.createAppointment(appointmentData);
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  updateAppointment: async (id, data) => {
    try {
      return await existingAppointmentApi.updateAppointment(id, data);
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },

  deleteAppointment: async (id) => {
    try {
      return await existingAppointmentApi.deleteAppointment(id);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  },

  // New methods for enhanced functionality
  getPendingAppointments: async (userId) => {
    try {
      return await apiRequest(`/api/appointments/pending?userId=${userId}`);
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      return { appointments: [] };
    }
  },

  approveAppointment: async (appointmentId, doctorId) => {
    try {
      return await apiRequest(`/api/appointments/${appointmentId}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ doctorId }),
      });
    } catch (error) {
      console.error('Error approving appointment:', error);
      throw error;
    }
  },

  rejectAppointment: async (appointmentId, doctorId, reason) => {
    try {
      return await apiRequest(`/api/appointments/${appointmentId}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ doctorId, reason }),
      });
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      throw error;
    }
  },
};

// Health Metrics API (new functionality)
export const healthApi = {
  getHealthMetrics: async (userId) => {
    try {
      return await apiRequest(`/api/health-metrics?userId=${userId}`);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      // Return mock data for demo purposes
      return { 
        metrics: {
          heartRate: 72,
          bmi: 23.5,
          bloodSugar: 95,
          bloodPressure: '120/80'
        }
      };
    }
  },

  updateHealthMetrics: async (userId, metrics) => {
    try {
      return await apiRequest('/api/health-metrics', {
        method: 'PUT',
        body: JSON.stringify({ userId, metrics }),
      });
    } catch (error) {
      console.error('Error updating health metrics:', error);
      throw error;
    }
  },
};

// Medication API (new functionality)
export const medicationApi = {
  getMedications: async (userId) => {
    try {
      return await apiRequest(`/api/medications?userId=${userId}`);
    } catch (error) {
      console.error('Error fetching medications:', error);
      // Return mock data for demo purposes
      return { 
        medications: [
          { _id: '1', name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', status: 'active' },
          { _id: '2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', status: 'active' }
        ]
      };
    }
  },

  addMedication: async (medicationData) => {
    try {
      return await apiRequest('/api/medications', {
        method: 'POST',
        body: JSON.stringify(medicationData),
      });
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  },

  updateMedication: async (id, medicationData) => {
    try {
      return await apiRequest(`/api/medications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(medicationData),
      });
    } catch (error) {
      console.error('Error updating medication:', error);
      throw error;
    }
  },

  deleteMedication: async (id) => {
    try {
      return await apiRequest(`/api/medications/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting medication:', error);
      throw error;
    }
  },
};

// Lab Reports API (new functionality)
export const labReportApi = {
  getLabReports: async (userId, role = 'patient') => {
    try {
      const endpoint = role === 'doctor' 
        ? `/api/lab-reports?doctorId=${userId}`
        : `/api/lab-reports?userId=${userId}`;
      return await apiRequest(endpoint);
    } catch (error) {
      console.error('Error fetching lab reports:', error);
      return { reports: [] };
    }
  },

  uploadLabReport: async (reportData) => {
    try {
      return await apiRequest('/api/lab-reports', {
        method: 'POST',
        body: JSON.stringify(reportData),
      });
    } catch (error) {
      console.error('Error uploading lab report:', error);
      throw error;
    }
  },

  updateLabReport: async (id, reportData) => {
    try {
      return await apiRequest(`/api/lab-reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reportData),
      });
    } catch (error) {
      console.error('Error updating lab report:', error);
      throw error;
    }
  },
};

// Patients API (for doctors, new functionality)
export const patientApi = {
  getPatients: async (doctorId) => {
    try {
      return await apiRequest(`/api/patients?doctorId=${doctorId}`);
    } catch (error) {
      console.error('Error fetching patients:', error);
      // Return mock data for demo purposes
      return { 
        patients: [
          { 
            _id: '1', 
            firstName: 'Sarah', 
            lastName: 'Johnson', 
            age: 34, 
            status: 'stable',
            currentConditions: ['Hypertension'],
            email: 'sarah.johnson@email.com'
          },
          { 
            _id: '2', 
            firstName: 'Mike', 
            lastName: 'Chen', 
            age: 28, 
            status: 'critical',
            currentConditions: ['Diabetes Type 2'],
            email: 'mike.chen@email.com'
          }
        ]
      };
    }
  },

  getPatientDetails: async (patientId) => {
    try {
      return await apiRequest(`/api/patients/${patientId}`);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      return null;
    }
  },

  updatePatient: async (patientId, patientData) => {
    try {
      return await apiRequest(`/api/patients/${patientId}`, {
        method: 'PUT',
        body: JSON.stringify(patientData),
      });
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },
};

// Notifications API (new functionality)
export const notificationApi = {
  getNotifications: async (userId) => {
    try {
      return await apiRequest(`/api/notifications?userId=${userId}`);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [] };
    }
  },

  markAsRead: async (notificationId) => {
    try {
      return await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  sendNotification: async (notificationData) => {
    try {
      return await apiRequest('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(notificationData),
      });
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },
};

// Real-time updates helper (enhanced with fallback)
export const subscribeToUpdates = (userId, role, callback) => {
  // Try WebSocket first, fallback to polling
  const usePolling = true; // Set to false when WebSocket is available
  
  if (usePolling) {
    const interval = setInterval(async () => {
      try {
        const notifications = await notificationApi.getNotifications(userId);
        callback(notifications);
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  } else {
    // WebSocket implementation would go here
    // const ws = new WebSocket(`ws://localhost:3000/ws?userId=${userId}&role=${role}`);
    // ... WebSocket handling
    return () => {}; // Cleanup function
  }
};

// Utility functions
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (time) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const getTimeAgo = (date) => {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${diffDays} days ago`;
};

export const getStatusColor = (status) => {
  const statusColors = {
    // Patient status colors
    critical: 'from-red-400 to-red-600',
    stable: 'from-green-400 to-green-600',
    improving: 'from-blue-400 to-blue-600',
    monitoring: 'from-yellow-400 to-yellow-600',
    
    // Appointment status colors
    pending: 'from-yellow-400 to-yellow-600',
    confirmed: 'from-green-400 to-green-600',
    scheduled: 'from-blue-400 to-blue-600',
    completed: 'from-green-400 to-green-600',
    cancelled: 'from-red-400 to-red-600',
    
    // Lab report status colors
    reviewed: 'from-green-400 to-green-600',
    'in-progress': 'from-blue-400 to-blue-600',
    
    // Default
    default: 'from-gray-400 to-gray-600',
  };

  return statusColors[status] || statusColors.default;
};

// User type detection (compatible with existing user structure)
export const determineUserType = (userData) => {
  if (!userData) return 'patient';
  
  // Check existing role field
  if (userData.role === 'doctor' || userData.role === 'Doctor') {
    return 'doctor';
  }
  if (userData.role === 'patient' || userData.role === 'Patient') {
    return 'patient';
  }
  
  // Check userType field
  if (userData.userType === 'doctor') {
    return 'doctor';
  }
  if (userData.userType === 'patient') {
    return 'patient';
  }
  
  // Check email domain
  if (userData.email?.includes('@hospital.') || userData.email?.includes('@clinic.') || userData.email?.includes('@med.')) {
    return 'doctor';
  }
  
  // Default to patient
  return 'patient';
};