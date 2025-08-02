// utils/api.js - Updated version with better error handling

// Base API configuration - Backend server runs on port 5000, frontend on 3000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Get auth token from localStorage (in production, use secure storage)
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// Generic API helper with improved error handling
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Handle different error types
      if (response.status === 401) {
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
        }
        throw new Error('Authentication required');
      }
      
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      
      if (response.status >= 500) {
        throw new Error('Server error - please try again later');
      }
      
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    
    throw error;
  }
};

// ✅ Used in Dashboard page - with better error handling
export const getCurrentUser = async () => {
  try {
    const user = await apiRequest('/api/auth/current-user');
    console.log('getCurrentUser success:', user?.name || 'Unknown user');
    return user;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    
    // Return null for auth errors to trigger login redirect
    if (error.message === 'Authentication required' || 
        error.message.includes('Unable to connect to server')) {
      return null;
    }
    
    throw error;
  }
};

// Auth API
export const authApi = {
  getCurrentUser,
  login: async (credentials) => {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token on successful login
    if (result.token && typeof window !== 'undefined') {
      localStorage.setItem('authToken', result.token);
    }
    
    return result;
  },
  logout: async () => {
    const result = await apiRequest('/api/auth/logout', {
      method: 'POST',
    });
    
    // Clear token on logout
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    
    return result;
  },
};

// Health Metrics API
export const healthApi = {
  getHealthMetrics: async (userId) =>
    await apiRequest(`/api/health-metrics?userId=${userId}`),

  updateHealthMetrics: async (userId, metrics) =>
    await apiRequest('/api/health-metrics', {
      method: 'PUT',
      body: JSON.stringify({ userId, metrics }),
    }),
};

// Medication API
export const medicationApi = {
  getMedications: async (userId) =>
    await apiRequest(`/api/medications?userId=${userId}`),

  addMedication: async (medicationData) =>
    await apiRequest('/api/medications', {
      method: 'POST',
      body: JSON.stringify(medicationData),
    }),

  updateMedication: async (id, medicationData) =>
    await apiRequest(`/api/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicationData),
    }),

  deleteMedication: async (id) =>
    await apiRequest(`/api/medications/${id}`, {
      method: 'DELETE',
    }),
};

// Lab Reports API
export const labReportApi = {
  getLabReports: async (userId, role = 'patient') => {
    const endpoint =
      role === 'doctor'
        ? `/api/lab-reports?doctorId=${userId}`
        : `/api/lab-reports?userId=${userId}`;
    return await apiRequest(endpoint);
  },

  uploadLabReport: async (reportData) =>
    await apiRequest('/api/lab-reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    }),

  updateLabReport: async (id, reportData) =>
    await apiRequest(`/api/lab-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    }),
};

// Appointments API
export const appointmentApi = {
  getAppointments: async (userId, role) =>
    await apiRequest(`/api/appointments?userId=${userId}&role=${role}`),

  getUpcomingAppointments: async (userId, role, limit = 5) =>
    await apiRequest(
      `/api/appointments/upcoming?userId=${userId}&role=${role}&limit=${limit}`
    ),

  getPendingAppointments: async (userId) =>
    await apiRequest(`/api/appointments/pending?userId=${userId}`),

  createAppointment: async (appointmentData) =>
    await apiRequest('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    }),

  updateAppointment: async (id, data) =>
    await apiRequest(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  approveAppointment: async (appointmentId, doctorId) =>
    await apiRequest(`/api/appointments/${appointmentId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ doctorId }),
    }),

  rejectAppointment: async (appointmentId, doctorId, reason) =>
    await apiRequest(`/api/appointments/${appointmentId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ doctorId, reason }),
    }),

  deleteAppointment: async (id) =>
    await apiRequest(`/api/appointments/${id}`, {
      method: 'DELETE',
    }),
};

// Patients API
export const patientApi = {
  getPatients: async (doctorId) =>
    await apiRequest(`/api/patients?doctorId=${doctorId}`),

  getPatientDetails: async (patientId) =>
    await apiRequest(`/api/patients/${patientId}`),

  updatePatient: async (patientId, patientData) =>
    await apiRequest(`/api/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    }),
};

// Notifications API
export const notificationApi = {
  getNotifications: async (userId) =>
    await apiRequest(`/api/notifications?userId=${userId}`),

  markAsRead: async (notificationId) =>
    await apiRequest(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),

  sendNotification: async (notificationData) =>
    await apiRequest('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    }),
};

// Health check function
export const checkServerHealth = async () => {
  try {
    const health = await apiRequest('/api/health');
    console.log('Server health:', health);
    return health;
  } catch (error) {
    console.error('Server health check failed:', error);
    throw error;
  }
};

// Real-time updates (polling fallback) - Legacy function for backward compatibility
export const subscribeToUpdates = (userId, role, callback) => {
  console.log('Setting up polling-based updates for user:', userId);
  
  const interval = setInterval(async () => {
    try {
      const data = await notificationApi.getNotifications(userId);
      callback(data);
    } catch (error) {
      console.error('Error polling notifications:', error);
    }
  }, 30000); // 30s

  return () => clearInterval(interval);
};

// Utility functions
export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const formatTime = (time) =>
  new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

export const getTimeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const mins = Math.floor(diffMs / 60000);
  const hrs = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 60) return `${mins} minutes ago`;
  if (hrs < 24) return `${hrs} hours ago`;
  return `${days} days ago`;
};

export const getStatusColor = (status) => {
  const statusColors = {
    critical: 'from-red-400 to-red-600',
    stable: 'from-green-400 to-green-600',
    improving: 'from-blue-400 to-blue-600',
    monitoring: 'from-yellow-400 to-yellow-600',
    pending: 'from-yellow-400 to-yellow-600',
    confirmed: 'from-green-400 to-green-600',
    scheduled: 'from-blue-400 to-blue-600',
    completed: 'from-green-400 to-green-600',
    cancelled: 'from-red-400 to-red-600',
    reviewed: 'from-green-400 to-green-600',
    'in-progress': 'from-blue-400 to-blue-600',
    default: 'from-gray-400 to-gray-600',
  };

  return statusColors[status] || statusColors.default;
};