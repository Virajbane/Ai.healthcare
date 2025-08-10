// utils/api.js - Fixed version with correct configuration

// ✅ Fixed: Use Next.js API routes (internal API) - your env shows port 3000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// ✅ Fixed: Use correct token name that matches your login
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Try both token names for compatibility
    const sessionToken = localStorage.getItem('sessionToken');
    const authToken = localStorage.getItem('authToken');
    const token = sessionToken || authToken;
    
    console.log('🔑 Token check:', {
      sessionToken: sessionToken ? 'Found' : 'Not found',
      authToken: authToken ? 'Found' : 'Not found',
      usingToken: token ? 'sessionToken' : 'none'
    });
    
    return token;
  }
  return null;
};

// ✅ Fixed: Updated for Next.js API routes
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = getAuthToken();
    
    // ✅ For Next.js API routes, we don't need full URL for internal routes
    const url = endpoint.startsWith('/api') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    console.log(`🚀 API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        // ✅ For Next.js API routes, we might need cookies instead of Authorization header
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      // ✅ Include credentials for Next.js API routes to handle cookies
      credentials: 'include',
      ...options,
    });

    console.log(`📡 Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }

      console.error(`❌ API Error:`, {
        status: response.status,
        endpoint: url,
        error: errorData
      });

      // Handle different error types
      if (response.status === 401) {
        // Clear invalid tokens
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sessionToken');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
        throw new Error('Authentication required');
      }
      
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      
      if (response.status >= 500) {
        throw new Error('Server error - please try again later');
      }
      
      throw new Error(errorData.message || `API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API Success:`, { endpoint: url, hasData: !!data });
    return data;

  } catch (error) {
    console.error(`💥 API Error (${endpoint}):`, error);
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    
    throw error;
  }
};

// ✅ Fixed: Use correct endpoint that matches your backend
export const getCurrentUser = async () => {
  try {
    // Check if user data exists in localStorage first (faster)
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      console.log('📦 Using cached user data:', userData);
      
      // Still validate with server but return cached data first
      try {
        await apiRequest('/api/auth/current-user');
        return userData;
      } catch (error) {
        // If server validation fails, clear cache and throw error
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('sessionToken');
        }
        throw error;
      }
    }
    
    // No cached data, get from server
    const user = await apiRequest('/api/auth/current-user');
    console.log('🌐 Retrieved user from server:', user?.email || 'Unknown user');
    
    // Cache user data
    if (user && typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return user;
  } catch (error) {
    console.error('❌ getCurrentUser error:', error);
    
    // Return null for auth errors to trigger login redirect
    if (error.message === 'Authentication required' || 
        error.message.includes('Unable to connect to server')) {
      return null;
    }
    
    throw error;
  }
};

// ✅ Fixed: Updated auth API to match your login implementation
export const authApi = {
  getCurrentUser,
  
  login: async (credentials) => {
    console.log('🔐 Login attempt for:', credentials.email);
    
    const result = await apiRequest('/api/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // ✅ Fixed: Store correct token names that match your login
    if (result.sessionToken && typeof window !== 'undefined') {
      localStorage.setItem('sessionToken', result.sessionToken);
      console.log('✅ Session token stored');
    }
    
    if (result.user && typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(result.user));
      console.log('✅ User data cached');
    }
    
    return result;
  },
  
  logout: async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.warn('Logout API call failed, but clearing local storage');
    }
    
    // Always clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      console.log('✅ All auth data cleared');
    }
  },
};

// Health Metrics API - ✅ Updated to use correct base URL
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
    const endpoint = role === 'doctor'
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

// ✅ Added: Check if we have a valid session
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('sessionToken') || localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  return !!(token && user);
};

// ✅ Added: Get cached user without API call
export const getCachedUser = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing cached user data:', error);
    return null;
  }
};

// Health check function for Next.js API routes
export const checkServerHealth = async () => {
  try {
    const health = await apiRequest('/api/health');
    console.log('✅ Server health check passed:', health);
    return health;
  } catch (error) {
    console.error('❌ Server health check failed:', error);
    throw error;
  }
};

// Real-time updates (polling fallback)
export const subscribeToUpdates = (userId, role, callback) => {
  console.log('🔄 Setting up polling updates for user:', userId);
  
  const interval = setInterval(async () => {
    try {
      if (isAuthenticated()) {
        const data = await notificationApi.getNotifications(userId);
        callback(data);
      }
    } catch (error) {
      console.error('❌ Error polling notifications:', error);
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