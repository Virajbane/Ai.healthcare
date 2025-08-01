// Shared API utilities for healthcare application

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

// Auth API
export const authApi = {
  getCurrentUser: async () => {
    try {
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
    return await apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },
};

// Health Metrics API
export const healthApi = {
  getHealthMetrics: async (userId) => {
    try {
      return await apiRequest(`/api/health-metrics?userId=${userId}`);
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      return { metrics: {} };
    }
  },

  updateHealthMetrics: async (userId, metrics) => {
    return await apiRequest('/api/health-metrics', {
      method: 'PUT',
      body: JSON.stringify({ userId, metrics }),
    });
  },
};

// Medication API
export const medicationApi = {
  getMedications: async (userId) => {
    try {
      return await apiRequest(`/api/medications?userId=${userId}`);
    } catch (error) {
      console.error('Error fetching medications:', error);
      return { medications: [] };
    }
  },

  addMedication: async (medicationData) => {
    return await apiRequest('/api/medications', {
      method: 'POST',
      body: JSON.stringify(medicationData),
    });
  },

  updateMedication: async (id, medicationData) => {
    return await apiRequest(`/api/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicationData),
    });
  },

  deleteMedication: async (id) => {
    return await apiRequest(`/api/medications/${id}`, {
      method: 'DELETE',
    });
  },
};

// Lab Reports API
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
    return await apiRequest('/api/lab-reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  updateLabReport: async (id, reportData) => {
    return await apiRequest(`/api/lab-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  },
};

// Appointments API
export const appointmentApi = {
  getAppointments: async (userId, role) => {
    try {
      return await apiRequest(`/api/appointments?userId=${userId}&role=${role}`);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { appointments: [] };
    }
  },

  getUpcomingAppointments: async (userId, role, limit = 5) => {
    try {
      return await apiRequest(`/api/appointments/upcoming?userId=${userId}&role=${role}&limit=${limit}`);
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return { appointments: [] };
    }
  },

  getPendingAppointments: async (userId) => {
    try {
      return await apiRequest(`/api/appointments/pending?userId=${userId}`);
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      return { appointments: [] };
    }
  },

  createAppointment: async (appointmentData) => {
    return await apiRequest('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  },

  updateAppointment: async (id, data) => {
    return await apiRequest(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  approveAppointment: async (appointmentId, doctorId) => {
    return await apiRequest(`/api/appointments/${appointmentId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ doctorId }),
    });
  },

  rejectAppointment: async (appointmentId, doctorId, reason) => {
    return await apiRequest(`/api/appointments/${appointmentId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ doctorId, reason }),
    });
  },

  deleteAppointment: async (id) => {
    return await apiRequest(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  },
};

// Patients API (for doctors)
export const patientApi = {
  getPatients: async (doctorId) => {
    try {
      return await apiRequest(`/api/patients?doctorId=${doctorId}`);
    } catch (error) {
      console.error('Error fetching patients:', error);
      return { patients: [] };
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
    return await apiRequest(`/api/patients/${patientId}`, {
      method: 'PUT',
      body: JSON.stringify(patientData),
    });
  },
};

// Notifications API
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
    return await apiRequest(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  sendNotification: async (notificationData) => {
    return await apiRequest('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  },
};

// Real-time updates helper
export const subscribeToUpdates = (userId, role, callback) => {
  // This would implement WebSocket or Server-Sent Events
  // For now, we'll use polling as a fallback
  const interval = setInterval(async () => {
    try {
      const notifications = await notificationApi.getNotifications(userId);
      callback(notifications);
    } catch (error) {
      console.error('Error polling for updates:', error);
    }
  }, 30000); // Poll every 30 seconds

  return () => clearInterval(interval);
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