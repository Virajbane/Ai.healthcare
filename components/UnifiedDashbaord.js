"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart, Calendar, Pill, FileText, User, Settings, MessageCircle, Upload, 
  ChevronRight, Home, Activity, Brain, Plus, Video, Stethoscope,
  Clock, AlertCircle, CheckCircle, Phone, Bell, Stethoscope as DoctorIcon,
  Users, ClipboardList, TrendingUp, Menu, Search, Filter, Download,
  Edit, Eye, Star, Award, Target
} from 'lucide-react';

// Import shared components and utilities
import Sidebar from '@/components/shared/Sidebar';
import DashboardHeader from '@/components/shared/DashboardHeader';
import LoadingSpinner from './shared/LoadingSpinner';
import ErrorDisplay from './shared/ErrorDisplay';
import AppointmentModal from './shared/AppointmentModal';

// Import API utilities (updated imports)
import { 
  authApi, 
  appointmentApi, 
  healthApi, 
  medicationApi, 
  labReportApi, 
  patientApi,
  notificationApi,
  formatDate,
  formatTime,
  getTimeAgo,
  getStatusColor 
} from '../utils/api';

// Import socket utilities for real-time updates
import { 
  initializeSocket,
  getSocket,
  subscribeToNotifications,
  subscribeToHealthMetrics,
  subscribeToMedications,
  subscribeToAppointments,
  disconnectSocket
} from '@/lib/socket';

// Import section components
import PatientDashboard from '@/components/patient/PatientDashboard';
import DoctorDashboard from '@/components/doctor/Doctordashboard';

const UnifiedDashboard = ({ initialUser = null, userType = null }) => {
  const router = useRouter();
  
  // Core state
  const [user, setUser] = useState(initialUser);
  const [detectedUserType, setDetectedUserType] = useState(userType);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Loading and error states
  const [isLoadingUser, setIsLoadingUser] = useState(!initialUser);
  const [userError, setUserError] = useState(null);
  
  // Modal states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentModalMode, setAppointmentModalMode] = useState('create');
  
  // Real-time updates
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);

  // Navigation items for different user types
  const getNavigationItems = () => {
    if (detectedUserType === 'doctor') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'appointments', label: 'Appointments & Approvals', icon: Calendar },
        { id: 'patients', label: 'Patients', icon: Users },
        { id: 'lab-reports', label: 'Lab Reports', icon: FileText },
        { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
        { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'medications', label: 'Medications', icon: Pill },
        { id: 'lab-reports', label: 'Lab Reports', icon: FileText },
        { id: 'personal-info', label: 'Personal Info', icon: User },
        { id: 'ai-chatbot', label: 'AI Chatbot', icon: Brain },
        { id: 'settings', label: 'Settings', icon: Settings },
      ];
    }
  };

  // Load user data and determine user type
  useEffect(() => {
    const loadUserData = async () => {
      if (initialUser) {
        setUser(initialUser);
        setDetectedUserType(userType || determineUserType(initialUser));
        setIsLoadingUser(false);
        return;
      }

      setIsLoadingUser(true);
      try {
        const userData = await authApi.getCurrentUser();
        if (userData) {
          setUser(userData);
          const type = userType || determineUserType(userData);
          setDetectedUserType(type);
        } else {
          setUserError('Failed to load user data');
        }
      } catch (error) {
        setUserError('Error loading user data');
        console.error('Error loading user:', error);
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserData();
  }, [initialUser, userType]);

  // Initialize socket connection when user is loaded
  useEffect(() => {
    if (user?.id) {
      console.log('Initializing socket for user:', user.id);
      const socket = initializeSocket(user.id);
      
      if (socket) {
        // Monitor connection status
        setSocketConnected(socket.connected);
        
        socket.on('connect', () => {
          console.log('Socket connected in dashboard');
          setSocketConnected(true);
        });
        
        socket.on('disconnect', () => {
          console.log('Socket disconnected in dashboard');
          setSocketConnected(false);
        });
      }
    }

    // Cleanup on unmount
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, [user?.id]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up real-time subscriptions for user:', user.id);

    // Subscribe to notifications
    const unsubscribeNotifications = subscribeToNotifications(user.id, (notification) => {
      console.log('New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    // Subscribe to health metrics updates (for patients)
    const unsubscribeHealthMetrics = subscribeToHealthMetrics(user.id, (metrics) => {
      console.log('Health metrics updated:', metrics);
      // Trigger refresh in child components
      window.dispatchEvent(new CustomEvent('healthMetricsUpdated', { detail: metrics }));
    });

    // Subscribe to medication updates
    const unsubscribeMedications = subscribeToMedications(user.id, (medicationUpdate) => {
      console.log('Medication update received:', medicationUpdate);
      // Trigger refresh in child components
      window.dispatchEvent(new CustomEvent('medicationUpdated', { detail: medicationUpdate }));
    });

    // Subscribe to appointment updates
    const unsubscribeAppointments = subscribeToAppointments(user.id, (appointmentUpdate) => {
      console.log('Appointment update received:', appointmentUpdate);
      // Trigger refresh in child components
      window.dispatchEvent(new CustomEvent('appointmentUpdated', { detail: appointmentUpdate }));
    });

    // Cleanup function
    return () => {
      if (unsubscribeNotifications) unsubscribeNotifications();
      if (unsubscribeHealthMetrics) unsubscribeHealthMetrics();
      if (unsubscribeMedications) unsubscribeMedications();
      if (unsubscribeAppointments) unsubscribeAppointments();
    };
  }, [user?.id]);

  // Load initial notifications
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  const determineUserType = (userData) => {
    // Logic to determine if user is a patient or doctor
    // This could be based on role field, email domain, or other criteria
    if (userData.role === 'doctor' || userData.userType === 'doctor') {
      return 'doctor';
    }
    if (userData.role === 'patient' || userData.userType === 'patient') {
      return 'patient';
    }
    
    // Default fallback - could also check email domain or other indicators
    return userData.email?.includes('@hospital.') || userData.email?.includes('@clinic.') ? 'doctor' : 'patient';
  };

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const response = await notificationApi.getNotifications(user.id);
      const notificationList = Array.isArray(response) ? response : (response.notifications || []);
      setNotifications(notificationList);
      setUnreadCount(notificationList.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleNavigationChange = (sectionId) => {
    if (sectionId === 'ai-chatbot' && detectedUserType === 'patient') {
      // Navigate to dedicated AI chatbot page for patients
      router.push('/ai-chatbot');
    } else {
      setActiveSection(sectionId);
    }
  };

  const handleAppointmentAction = async (appointmentData, action = 'create', reason = null) => {
    try {
      if (action === 'create') {
        if (detectedUserType === 'patient') {
          // Patient creating appointment
          const appointmentWithUser = {
            ...appointmentData,
            patientId: user.id,
            patientName: `${user.firstName || user.name} ${user.lastName || ''}`.trim(),
            patientEmail: user.email
          };
          await appointmentApi.createAppointment(appointmentWithUser);
        } else {
          // Doctor creating appointment
          await appointmentApi.createAppointment(appointmentData);
        }
      } else if (action === 'update') {
        await appointmentApi.updateAppointment(selectedAppointment._id || selectedAppointment.id, appointmentData);
      } else if (action === 'approve') {
        await appointmentApi.approveAppointment(appointmentData, user.id);
      } else if (action === 'reject') {
        await appointmentApi.rejectAppointment(appointmentData, user.id, reason);
      }
      
      // Close modal and refresh data
      setIsAppointmentModalOpen(false);
      setSelectedAppointment(null);
      
      // Trigger refresh in child components
      window.dispatchEvent(new CustomEvent('appointmentUpdated'));
      
    } catch (error) {
      console.error('Error handling appointment action:', error);
      throw error;
    }
  };

  const openAppointmentModal = (appointment = null, mode = 'create') => {
    setSelectedAppointment(appointment);
    setAppointmentModalMode(mode);
    setIsAppointmentModalOpen(true);
  };

  const handleNotificationClick = async () => {
    // Handle notification click - mark notifications as read
    try {
      // Mark all notifications as read
      await Promise.all(
        notifications
          .filter(n => !n.read)
          .map(n => notificationApi.markAsRead(n.id))
      );
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      console.log('All notifications marked as read');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const handleMessageClick = () => {
    // Handle message click - could open chat
    console.log('Messages clicked');
  };

  // Show loading state
  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <LoadingSpinner message="Loading healthcare dashboard..." size="xl" />
      </div>
    );
  }

  // Show error state
  if (userError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <ErrorDisplay 
          title="Error Loading Dashboard"
          message={userError}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigationItems={getNavigationItems()}
        activeSection={activeSection}
        onNavigationChange={handleNavigationChange}
        user={user}
        userType={detectedUserType}
      />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <DashboardHeader
          activeSection={activeSection}
          navigationItems={getNavigationItems()}
          user={user}
          userType={detectedUserType}
          onMenuClick={() => setSidebarOpen(true)}
          onNotificationClick={handleNotificationClick}
          onMessageClick={handleMessageClick}
          socketConnected={socketConnected}
          unreadCount={unreadCount}
        />

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {/* Render appropriate dashboard based on user type */}
          {detectedUserType === 'doctor' ? (
            <DoctorDashboard
              user={user}
              activeSection={activeSection}
              onAppointmentModalOpen={openAppointmentModal}
              onSectionChange={setActiveSection}
            />
          ) : (
            <PatientDashboard
              user={user}
              activeSection={activeSection}
              onAppointmentModalOpen={openAppointmentModal}
              onSectionChange={setActiveSection}
            />
          )}
        </main>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isAppointmentModalOpen}
        onClose={() => {
          setIsAppointmentModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSubmit={handleAppointmentAction}
        appointment={selectedAppointment}
        userType={detectedUserType}
        mode={appointmentModalMode}
      />

      {/* Notification Badge (floating) */}
      {unreadCount > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleNotificationClick}
            className="bg-gradient-to-r from-red-400 to-red-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          </button>
        </div>
      )}

      {/* Socket Connection Status (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-50">
          <div className={`px-3 py-2 rounded-full text-xs font-medium ${
            socketConnected 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {socketConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedDashboard;