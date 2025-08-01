"use client"
import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Calendar, Users, FileText, ClipboardList, Settings, 
  MessageCircle, Bell, Search, ChevronRight, Menu, X, Home, Activity, 
  Brain, Clock, TrendingUp, AlertCircle, CheckCircle, Phone, Video,
  Filter, Download, Plus, Edit, Eye, Star, Award, Target
} from 'lucide-react';

// Real API functions that fetch data from database
const appointmentApi = {
  getAppointments: async (userId, role) => {
    try {
      const response = await fetch(`/api/appointments?userId=${userId}&role=${role}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return { appointments: [] };
    }
  },
  getUpcomingAppointments: async (userId, role, limit) => {
    try {
      const response = await fetch(`/api/appointments/upcoming?userId=${userId}&role=${role}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch upcoming appointments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return { appointments: [] };
    }
  },
  getPendingAppointments: async (userId) => {
    try {
      const response = await fetch(`/api/appointments/pending?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch pending appointments');
      return await response.json();
    } catch (error) {
      console.error('Error fetching pending appointments:', error);
      return { appointments: [] };
    }
  },
  approveAppointment: async (appointmentId, doctorId) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId })
      });
      if (!response.ok) throw new Error('Failed to approve appointment');
      return await response.json();
    } catch (error) {
      console.error('Error approving appointment:', error);
      throw error;
    }
  },
  rejectAppointment: async (appointmentId, doctorId, reason) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId, reason })
      });
      if (!response.ok) throw new Error('Failed to reject appointment');
      return await response.json();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      throw error;
    }
  },
  updateAppointment: async (id, data) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to update appointment');
      return await response.json();
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  },
  deleteAppointment: async (id) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete appointment');
      return await response.json();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error;
    }
  }
};

const patientApi = {
  getPatients: async (userId) => {
    try {
      const response = await fetch(`/api/patients?doctorId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      return await response.json();
    } catch (error) {
      console.error('Error fetching patients:', error);
      return { patients: [] };
    }
  }
};

const labReportApi = {
  getLabReports: async (userId) => {
    try {
      const response = await fetch(`/api/lab-reports?doctorId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch lab reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching lab reports:', error);
      return { reports: [] };
    }
  }
};

// Mock AppointmentModal component
const AppointmentApprovalModal = ({ isOpen, onClose, appointment, onApprove, onReject }) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (!appointment?._id) return;
    
    setIsProcessing(true);
    try {
      await onApprove(appointment._id);
      onClose();
    } catch (error) {
      console.error('Error approving appointment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!appointment?._id || !rejectionReason.trim()) return;
    
    setIsProcessing(true);
    try {
      await onReject(appointment._id, rejectionReason);
      onClose();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !appointment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            Review Appointment Request
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-3">Patient Information</h4>
            <div className="space-y-2">
              <p className="text-gray-300">
                <span className="text-gray-400">Patient:</span> {appointment.patientName}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-400">Date:</span> {new Date(appointment.appointmentDate).toLocaleDateString()}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-400">Time:</span> {appointment.appointmentTime}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-400">Mode:</span> {appointment.mode === 'video' ? 'Video Call' : 'In-Person'}
              </p>
              <p className="text-gray-300">
                <span className="text-gray-400">Reason:</span> {appointment.reason}
              </p>
          </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rejection Reason (if rejecting)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Provide a reason for rejection..."
              rows={3}
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isProcessing || !rejectionReason.trim()}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {isProcessing ? 'Rejecting...' : 'Reject'}
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {isProcessing ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DoctorDashboard = ({ user }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState('today');
  
  // Dynamic data states
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReports: 0,
    criticalAlerts: 0,
    pendingAppointments: 0
  });

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  // Modal and loading states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingLabReports, setIsLoadingLabReports] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState(null);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'appointments', label: 'Appointments & Approvals', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'lab-reports', label: 'Lab Reports', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoadingUser(true);
      try {
        const userData = await getCurrentUser();
        if (userData) {
          // Update user state or pass to parent component
          console.log('User loaded:', userData);
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

    if (!user) {
      loadUserData();
    } else {
      setIsLoadingUser(false);
    }
  }, [user]);

  // Load dashboard data on component mount
  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  // Load section-specific data when section changes
  useEffect(() => {
    if (!user?.id) return;

    switch (activeSection) {
      case 'appointments':
        loadAppointments();
        break;
      case 'patients':
        loadPatients();
        break;
      case 'lab-reports':
        loadLabReports();
        break;
      default:
        break;
    }
  }, [activeSection, user?.id]);

  // Function to get current user from database
  const getCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/current-user');
      if (!response.ok) throw new Error('Failed to fetch current user');
      return await response.json();
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  };

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setIsLoadingStats(true);
    try {
      // Load all dashboard data in parallel
      const [appointmentsRes, patientsRes, labReportsRes, upcomingRes, pendingRes] = await Promise.all([
        appointmentApi.getAppointments(user.id, 'doctor'),
        patientApi.getPatients(user.id),
        labReportApi.getLabReports(user.id),
        appointmentApi.getUpcomingAppointments(user.id, 'doctor', 5),
        appointmentApi.getPendingAppointments(user.id)
      ]);

      // Set data
      setUpcomingAppointments(upcomingRes.appointments || []);
      const allPatients = patientsRes.patients || [];
      const allLabReports = labReportsRes.reports || [];
      const allAppointments = appointmentsRes.appointments || [];

      // Calculate dashboard statistics
      const today = new Date().toDateString();
      const todayAppointments = allAppointments.filter(apt => 
        new Date(apt.appointmentDate).toDateString() === today
      ).length;

      const pendingReports = allLabReports.filter(report => 
        report.status === 'pending' || report.status === 'in-progress'
      ).length;

      const criticalPatients = allPatients.filter(patient => 
        patient.status === 'critical'
      ).length;

      // Animate stats update
      animateStats({
        totalPatients: allPatients.length,
        todayAppointments,
        pendingReports,
        criticalAlerts: criticalPatients,
        pendingAppointments: pendingRes.appointments.length
      });

      // Generate recent activity
      generateRecentActivity(allAppointments, allLabReports, allPatients);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const animateStats = (targetStats) => {
    Object.keys(targetStats).forEach(key => {
      let current = 0;
      const target = targetStats[key];
      const increment = target / 30;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setDashboardStats(prev => ({
          ...prev,
          [key]: Math.floor(current)
        }));
      }, 50);
    });
  };

  const generateRecentActivity = (appointments, labReports, patients) => {
    const activities = [];
    
    // Recent appointments
    appointments.slice(0, 2).forEach(apt => {
      activities.push({
        id: `apt-${apt._id}`,
        type: 'appointment',
        message: `Appointment ${apt.status} with ${apt.patientName}`,
        time: getTimeAgo(new Date(apt.updatedAt || apt.createdAt)),
        color: 'blue'
      });
    });

    // Recent lab reports
    labReports.slice(0, 2).forEach(report => {
      activities.push({
        id: `lab-${report._id}`,
        type: 'lab',
        message: `Lab results ${report.status} for ${report.patientName}`,
        time: getTimeAgo(new Date(report.updatedAt || report.createdAt)),
        color: report.status === 'reviewed' ? 'green' : 'purple'
      });
    });

    // Sort by most recent
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    setRecentActivity(activities.slice(0, 5));
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const loadAppointments = async () => {
    if (!user?.id) return;
    
    setIsLoadingAppointments(true);
    try {
      const [appointmentsRes, upcomingRes, pendingRes] = await Promise.all([
        appointmentApi.getAppointments(user.id, 'doctor'),
        appointmentApi.getUpcomingAppointments(user.id, 'doctor', 5),
        appointmentApi.getPendingAppointments(user.id)
      ]);
      
      setAppointments(appointmentsRes.appointments || []);
      setUpcomingAppointments(upcomingRes.appointments || []);
      setPendingAppointments(pendingRes.appointments || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const handleApproveAppointment = async (appointmentId) => {
    if (!user?.id) return;
    
    try {
      await appointmentApi.approveAppointment(appointmentId, user.id);
      await loadAppointments();
      await loadDashboardData(); // Refresh dashboard stats
    } catch (error) {
      console.error('Error approving appointment:', error);
      throw error;
    }
  };

  const handleRejectAppointment = async (appointmentId, reason) => {
    if (!user?.id) return;
    
    try {
      await appointmentApi.rejectAppointment(appointmentId, user.id, reason);
      await loadAppointments();
      await loadDashboardData(); // Refresh dashboard stats
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      throw error;
    }
  };

  const loadPatients = async () => {
    if (!user?.id) return;
    
    setIsLoadingPatients(true);
    try {
      const response = await patientApi.getPatients(user.id);
      setPatients(response.patients || []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const loadLabReports = async () => {
    if (!user?.id) return;
    
    setIsLoadingLabReports(true);
    try {
      const response = await labReportApi.getLabReports(user.id);
      setLabReports(response.reports || []);
    } catch (error) {
      console.error('Error loading lab reports:', error);
    } finally {
      setIsLoadingLabReports(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await appointmentApi.deleteAppointment(appointmentId);
      await loadAppointments();
      await loadDashboardData(); // Refresh dashboard stats
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const openAppointmentModal = (appointment = null) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'from-red-400 to-red-600';
      case 'stable': return 'from-green-400 to-green-600';
      case 'improving': return 'from-blue-400 to-blue-600';
      case 'monitoring': return 'from-yellow-400 to-yellow-600';
      case 'pending': return 'from-yellow-400 to-yellow-600';
      case 'confirmed': return 'from-green-400 to-green-600';
      case 'scheduled': return 'from-blue-400 to-blue-600';
      case 'completed': return 'from-green-400 to-green-600';
      case 'reviewed': return 'from-green-400 to-green-600';
      case 'in-progress': return 'from-blue-400 to-blue-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getPatientInitials = (patient) => {
    if (patient.firstName && patient.lastName) {
      return `${patient.firstName[0]}${patient.lastName[0]}`.toUpperCase();
    }
    if (patient.name) {
      const names = patient.name.split(' ');
      return names.length > 1 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : names[0][0].toUpperCase();
    }
    return 'P';
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Patients</p>
              <p className="text-3xl font-bold text-blue-400">
                {isLoadingStats ? '...' : dashboardStats.totalPatients}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Today's Appointments</p>
              <p className="text-3xl font-bold text-green-400">
                {isLoadingStats ? '...' : dashboardStats.todayAppointments}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Reports</p>
              <p className="text-3xl font-bold text-purple-400">
                {isLoadingStats ? '...' : dashboardStats.pendingReports}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-400">
                {isLoadingStats ? '...' : dashboardStats.criticalAlerts}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Pending Approvals</p>
              <p className="text-3xl font-bold text-yellow-400">
                {isLoadingStats ? '...' : dashboardStats.pendingAppointments}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule & Critical Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Today's Schedule</h3>
            <button 
              onClick={() => setActiveSection('appointments')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.slice(0, 3).map((apt) => (
                <div key={apt._id || apt.id} className="flex items-center bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-3 py-1 rounded-lg font-semibold mr-4 text-sm">
                    {apt.appointmentTime}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{apt.patientName || 'Patient'}</h4>
                    <p className="text-sm text-gray-400">{apt.appointmentType || apt.reason} • {apt.reason}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {apt.mode === 'video' ? 
                      <Video className="w-4 h-4 text-purple-400" /> : 
                      <Stethoscope className="w-4 h-4 text-green-400" />
                    }
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getStatusColor(apt.status || 'scheduled')}`}></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No upcoming appointments</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Critical Patients</h3>
            <button 
              onClick={() => setActiveSection('patients')}
              className="text-red-400 hover:text-red-300 text-sm"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {patients.filter(p => p.status === 'critical').slice(0, 3).map((patient) => (
              <div key={patient._id} className="flex items-center bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center text-white font-semibold mr-4">
                  {getPatientInitials(patient)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">
                    {patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : patient.name}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {patient.currentConditions?.[0] || 'No condition specified'} • Age {patient.age || 'N/A'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
            {patients.filter(p => p.status === 'critical').length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-400">No critical patients</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center bg-white/5 rounded-xl p-4">
                <div className={`w-2 h-2 bg-${activity.color}-400 rounded-full mr-4`}></div>
                <div className="flex-1">
                  <p className="text-white">{activity.message}</p>
                  <p className="text-sm text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      {/* Filter and Actions */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <select 
              value={appointmentFilter}
              onChange={(e) => setAppointmentFilter(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Appointments</option>
              <option value="pending">Pending Approval</option>
            </select>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-400 font-medium">
                {pendingAppointments.length} Pending Approval
              </span>
            </div>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pending Appointments Section */}
      {appointmentFilter === 'pending' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Pending Approval</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-yellow-400">{pendingAppointments.length} requests</span>
            </div>
          </div>
          
          {isLoadingAppointments ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="ml-3 text-white">Loading pending appointments...</span>
            </div>
          ) : pendingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-400">No pending appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingAppointments
                .filter(apt => 
                  !searchTerm || 
                  apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((apt) => (
                <div key={apt._id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 border-l-4 border-yellow-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-lg font-semibold">
                        {apt.appointmentTime}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{apt.patientName || 'Patient'}</h4>
                        <p className="text-sm text-gray-400">
                          {apt.reason} • {apt.mode === 'video' ? 'Video Call' : 'In-Person'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(apt.appointmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                        Pending
                      </div>
                      <div className="flex items-center space-x-2">
                        {apt.mode === 'video' ? (
                          <button className="p-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-colors">
                            <Video className="w-4 h-4 text-purple-400" />
                          </button>
                        ) : (
                          <button className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors">
                            <Stethoscope className="w-4 h-4 text-green-400" />
                          </button>
                        )}
                        <button 
                          onClick={() => openAppointmentModal(apt)}
                          className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-blue-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Appointments List */}
      {appointmentFilter !== 'pending' && (
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold mb-6">Appointments</h3>
        
        {isLoadingAppointments ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="ml-3 text-white">Loading appointments...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No appointments scheduled</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments
              .filter(apt => 
                !searchTerm || 
                apt.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                apt.reason?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((apt) => (
              <div key={apt._id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                      {apt.appointmentTime}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{apt.patientName || 'Patient'}</h4>
                      <p className="text-sm text-gray-400">
                        {apt.reason} • {apt.mode === 'video' ? 'Video Call' : 'In-Person'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(apt.status || 'scheduled')} text-white`}>
                      {apt.status || 'scheduled'}
                    </div>
                    <div className="flex items-center space-x-2">
                      {apt.mode === 'video' ? (
                        <button className="p-2 bg-purple-500/20 rounded-lg hover:bg-purple-500/30 transition-colors">
                          <Video className="w-4 h-4 text-purple-400" />
                        </button>
                      ) : (
                        <button className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors">
                          <Stethoscope className="w-4 h-4 text-green-400" />
                        </button>
                      )}
                        {apt.status === 'pending' && (
                      <button 
                        onClick={() => openAppointmentModal(apt)}
                        className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                            <Eye className="w-4 h-4 text-blue-400" />
                      </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            <button className="flex items-center bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Add Patient
            </button>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold mb-6">Patients</h3>
        
        {isLoadingPatients ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="ml-3 text-white">Loading patients...</span>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No patients found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients
              .filter(patient => 
                !searchTerm || 
                `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.currentConditions?.some(condition => 
                  condition.toLowerCase().includes(searchTerm.toLowerCase())
                )
              )
              .map((patient) => (
              <div key={patient._id} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getStatusColor(patient.status)} flex items-center justify-center text-white font-semibold mr-4`}>
                    {getPatientInitials(patient)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">
                      {patient.firstName && patient.lastName ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient'}
                    </h4>
                    <p className="text-sm text-gray-400">Age {patient.age || 'N/A'}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusColor(patient.status)}`}></div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Primary Condition</p>
                    <p className="text-white font-medium">
                      {patient.currentConditions?.[0] || 'No condition specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Visit</p>
                    <p className="text-white">
                      {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString() : 'No visits yet'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Next Appointment</p>
                    <p className="text-white">
                      {patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString() : 'Not scheduled'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                  <button className="flex items-center text-blue-400 hover:text-blue-300 text-sm">
                    <Eye className="w-4 h-4 mr-1" />
                    View Profile
                  </button>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors">
                      <Phone className="w-4 h-4 text-green-400" />
                    </button>
                    <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors">
                      <MessageCircle className="w-4 h-4 text-blue-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderLabReports = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Lab Reports</h3>
          <button className="flex items-center bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300">
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </button>
        </div>
        
        {isLoadingLabReports ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="ml-3 text-white">Loading lab reports...</span>
          </div>
        ) : labReports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No lab reports found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {labReports.map((report) => (
              <div key={report._id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                      report.priority === 'high' || report.priority === 'urgent' ? 'from-red-400 to-red-600' : 'from-green-400 to-green-600'
                    }`}></div>
                    <div>
                      <h4 className="font-semibold text-white">{report.patientName || 'Unknown Patient'}</h4>
                      <p className="text-sm text-gray-400">
                        {report.testType} • {new Date(report.testDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(report.status)} text-white`}>
                      {report.status}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      report.priority === 'high' || report.priority === 'urgent' 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {report.priority}
                    </div>
                    <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors">
                      <Eye className="w-4 h-4 text-blue-400" />
                    </button>
                  </div>
                </div>
                {report.results?.summary && (
                  <div className="mt-3 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-300">{report.results.summary}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Prescriptions</h3>
          <button className="flex items-center bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
            <Plus className="w-4 h-4 mr-2" />
            New Prescription
          </button>
        </div>
        
        <div className="text-center py-12">
          <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-300 mb-2">Prescription Management</h4>
          <p className="text-gray-400 mb-6">Create, manage, and track patient prescriptions</p>
          <button className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
            Create First Prescription
          </button>
        </div>
      </div>
    </div>
  );

  const renderAIAssistant = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">AI Medical Assistant</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Online</span>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-300 mb-2">AI-Powered Insights</h4>
          <p className="text-gray-400 mb-6">Get intelligent recommendations and clinical decision support</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <Target className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h5 className="font-semibold text-white mb-2">Diagnosis Support</h5>
              <p className="text-sm text-gray-400">AI-powered diagnostic suggestions based on symptoms</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <FileText className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h5 className="font-semibold text-white mb-2">Treatment Plans</h5>
              <p className="text-sm text-gray-400">Personalized treatment recommendations</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <TrendingUp className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h5 className="font-semibold text-white mb-2">Risk Analysis</h5>
              <p className="text-sm text-gray-400">Predictive health risk assessments</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Practice Analytics</h3>
          <button className="flex items-center bg-white/10 border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">4.8</span>
            </div>
            <h4 className="font-semibold text-white">Patient Satisfaction</h4>
            <p className="text-sm text-gray-400">Average rating this month</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <Calendar className="w-6 h-6 text-blue-400" />
              <span className="text-2xl font-bold text-blue-400">89%</span>
            </div>
            <h4 className="font-semibold text-white">Appointment Rate</h4>
            <p className="text-sm text-gray-400">Scheduled vs completed</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-green-400">12m</span>
            </div>
            <h4 className="font-semibold text-white">Avg Wait Time</h4>
            <p className="text-sm text-gray-400">Patient waiting average</p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <Award className="w-6 h-6 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">95%</span>
            </div>
            <h4 className="font-semibold text-white">Success Rate</h4>
            <p className="text-sm text-gray-400">Treatment effectiveness</p>
          </div>
        </div>
        
        <div className="text-center py-8">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-300 mb-2">Detailed Analytics Dashboard</h4>
          <p className="text-gray-400">Comprehensive insights into your practice performance</p>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold mb-6">Settings</h3>
        
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold text-white mb-4">Profile Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <input
                  type="text"
                  value={user?.firstName || ''}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input
                  type="text"
                  value={user?.lastName || ''}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  readOnly
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold text-white mb-4">Notification Preferences</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-gray-300">Email notifications for new appointments</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span className="text-gray-300">SMS reminders for upcoming appointments</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span className="text-gray-300">Weekly practice summary reports</span>
              </label>
            </div>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="font-semibold text-white mb-4">Privacy & Security</h4>
            <div className="space-y-3">
              <button className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-white">Change Password</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
              <button className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-white">Two-Factor Authentication</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
              <button className="w-full text-left bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-white">Data Export</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'appointments':
        return renderAppointments();
      case 'patients':
        return renderPatients();
      case 'lab-reports':
        return renderLabReports();
      case 'prescriptions':
        return renderPrescriptions();
      case 'ai-assistant':
        return renderAIAssistant();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Loading State */}
      {isLoadingUser && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading doctor dashboard...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {userError && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-400 mb-4">{userError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      {!isLoadingUser && !userError && (
        <>
          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/10 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">HealthCare AI</h2>
                  <p className="text-xs text-gray-400">
                    {user ? `Dr. ${user.firstName} ${user.lastName} Portal` : 'Doctor Portal'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : 'DR'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {user ? `Dr. ${user.firstName} ${user.lastName}` : 'Doctor'}
                  </p>
                  <p className="text-xs text-gray-400">{user?.email || 'email@hospital.com'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:ml-64">
            {/* Header */}
            <header className="bg-white/5 backdrop-blur-lg border-b border-white/10 p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-gray-400 hover:text-white"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
                    </h1>
                    <p className="text-gray-400">
                      {user ? `Welcome back, Dr. ${user.firstName} ${user.lastName}` : 'Welcome back'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button className="relative p-2 text-gray-400 hover:text-white">
                    <Bell className="w-5 h-5" />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full"></div>
                  </button>
                  <button className="relative p-2 text-gray-400 hover:text-white">
                    <MessageCircle className="w-5 h-5" />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                  </button>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="p-4 lg:p-6">
              {renderContent()}
            </main>
          </div>

          {/* Appointment Modal */}
          <AppointmentApprovalModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedAppointment(null);
            }}
            appointment={selectedAppointment}
            onApprove={handleApproveAppointment}
            onReject={handleRejectAppointment}
          />
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;