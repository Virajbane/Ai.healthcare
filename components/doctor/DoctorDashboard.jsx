import React, { useState, useEffect } from 'react';
import { 
  Calendar, Users, FileText, ClipboardList, TrendingUp, Settings,
  Brain, AlertCircle, CheckCircle, Clock, Star, Award, Target,
  Search, Filter, Download, Plus, Edit, Eye, Video, Stethoscope,
  Phone, MessageCircle, ChevronRight
} from 'lucide-react';
import { 
  appointmentApi, 
  patientApi, 
  labReportApi, 
  getStatusColor, 
  getTimeAgo,
  formatDate 
} from '../../lib/api';
import LoadingSpinner from '../shared/LoadingSpinner';

const DoctorDashboard = ({ user, activeSection, onAppointmentModalOpen, onSectionChange }) => {
  // Dashboard state
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

  // Loading states
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingLabReports, setIsLoadingLabReports] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState('today');

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

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

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setIsLoadingStats(true);
    try {
      const [appointmentsRes, patientsRes, labReportsRes, upcomingRes, pendingRes] = await Promise.all([
        appointmentApi.getAppointments(user.id, 'doctor'),
        patientApi.getPatients(user.id),
        labReportApi.getLabReports(user.id, 'doctor'),
        appointmentApi.getUpcomingAppointments(user.id, 'doctor', 5),
        appointmentApi.getPendingAppointments(user.id)
      ]);

      setUpcomingAppointments(upcomingRes.appointments || []);
      const allPatients = patientsRes.patients || [];
      const allLabReports = labReportsRes.reports || [];
      const allAppointments = appointmentsRes.appointments || [];

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

      animateStats({
        totalPatients: allPatients.length,
        todayAppointments,
        pendingReports,
        criticalAlerts: criticalPatients,
        pendingAppointments: pendingRes.appointments?.length || 0
      });

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
    
    appointments.slice(0, 2).forEach(apt => {
      activities.push({
        id: `apt-${apt._id}`,
        type: 'appointment',
        message: `Appointment ${apt.status} with ${apt.patientName}`,
        time: getTimeAgo(new Date(apt.updatedAt || apt.createdAt)),
        color: 'blue'
      });
    });

    labReports.slice(0, 2).forEach(report => {
      activities.push({
        id: `lab-${report._id}`,
        type: 'lab',
        message: `Lab results ${report.status} for ${report.patientName}`,
        time: getTimeAgo(new Date(report.updatedAt || report.createdAt)),
        color: report.status === 'reviewed' ? 'green' : 'purple'
      });
    });

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    setRecentActivity(activities.slice(0, 5));
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
      const response = await labReportApi.getLabReports(user.id, 'doctor');
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
      await loadDashboardData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
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
              onClick={() => onSectionChange('appointments')}
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
                    <p className="text-sm text-gray-400">{apt.reason}</p>
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
              onClick={() => onSectionChange('patients')}
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
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'appointments':
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-6">Appointments & Approvals</h3>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Appointment management features</p>
            </div>
          </div>
        );
      case 'patients':
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-6">Patients</h3>
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Patient management features</p>
            </div>
          </div>
        );
      case 'lab-reports':
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-6">Lab Reports</h3>
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Lab report management features</p>
            </div>
          </div>
        );
      case 'prescriptions':
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-6">Prescriptions</h3>
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Prescription management features</p>
            </div>
          </div>
        );
      case 'ai-assistant':
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-6">AI Medical Assistant</h3>
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">AI assistant features</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-6">Practice Analytics</h3>
            <div className="text-center py-8">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Analytics dashboard features</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-6">Settings</h3>
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Settings and preferences</p>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
};

export default DoctorDashboard;