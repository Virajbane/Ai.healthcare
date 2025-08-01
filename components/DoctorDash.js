"use client"
import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, Calendar, Users, FileText, ClipboardList, Settings, 
  MessageCircle, Bell, Search, ChevronRight, Menu, X, Home, Activity, 
  Brain, Clock, TrendingUp, AlertCircle, CheckCircle, Phone, Video,
  Filter, Download, Plus, Edit, Eye
} from 'lucide-react';
import { appointmentApi } from '@/lib/appointmentApi';
import AppointmentModal from './AppointmentModal';

const DoctorDashboard = ({ user }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState('today');
  
  const [dashboardStats, setDashboardStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReports: 0,
    criticalAlerts: 0
  });

  // Appointment states
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'lab-reports', label: 'Lab Reports', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: ClipboardList },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Brain },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Mock data - In real app, this would come from API
  const patients = [
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      age: 34, 
      condition: 'Hypertension', 
      lastVisit: '2024-07-25',
      status: 'stable',
      avatar: 'SJ',
      phone: '+1 (555) 123-4567',
      email: 'sarah.j@email.com',
      nextAppointment: '2024-08-15 10:30 AM'
    },
    { 
      id: 2, 
      name: 'Michael Chen', 
      age: 45, 
      condition: 'Diabetes Type 2', 
      lastVisit: '2024-07-28',
      status: 'critical',
      avatar: 'MC',
      phone: '+1 (555) 234-5678',
      email: 'michael.c@email.com',
      nextAppointment: '2024-08-02 14:00 PM'
    },
    { 
      id: 3, 
      name: 'Emily Davis', 
      age: 28, 
      condition: 'Anxiety', 
      lastVisit: '2024-07-30',
      status: 'improving',
      avatar: 'ED',
      phone: '+1 (555) 345-6789',
      email: 'emily.d@email.com',
      nextAppointment: '2024-08-20 09:00 AM'
    }
  ];

  const mockAppointments = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      time: '10:30 AM',
      type: 'Follow-up',
      status: 'confirmed',
      condition: 'Hypertension',
      duration: '30 min',
      mode: 'in-person'
    },
    {
      id: 2,
      patientName: 'Michael Chen',
      time: '02:00 PM',
      type: 'Regular Checkup',
      status: 'pending',
      condition: 'Diabetes',
      duration: '45 min',
      mode: 'video'
    },
    {
      id: 3,
      patientName: 'Emily Davis',
      time: '04:30 PM',
      type: 'Consultation',
      status: 'confirmed',
      condition: 'Anxiety',
      duration: '60 min',
      mode: 'in-person'
    }
  ];

  const labReports = [
    {
      id: 1,
      patientName: 'Sarah Johnson',
      testType: 'Blood Panel',
      date: '2024-07-30',
      status: 'reviewed',
      priority: 'normal',
      results: 'Normal values across all parameters'
    },
    {
      id: 2,
      patientName: 'Michael Chen',
      testType: 'HbA1c',
      date: '2024-07-29',
      status: 'pending',
      priority: 'high',
      results: 'Elevated glucose levels - requires attention'
    }
  ];

  // Animate dashboard stats on load
  useEffect(() => {
    const targets = { totalPatients: 127, todayAppointments: 8, pendingReports: 5, criticalAlerts: 2 };
    
    Object.keys(targets).forEach(key => {
      let current = 0;
      const target = targets[key];
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
  }, []);

  // Load appointments when appointments section is active
  useEffect(() => {
    if (activeSection === 'appointments' && user?.id) {
      loadAppointments();
    }
  }, [activeSection, user?.id]);

  const loadAppointments = async () => {
    if (!user?.id) return;
    
    setIsLoadingAppointments(true);
    try {
      const response = await appointmentApi.getAppointments(user.id, 'doctor');
      setAppointments(response.appointments || []);
      
      const upcomingResponse = await appointmentApi.getUpcomingAppointments(user.id, 'doctor', 5);
      setUpcomingAppointments(upcomingResponse.appointments || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const handleCreateAppointment = async (appointmentData) => {
    if (!user?.id) return;
    
    try {
      const appointmentWithUser = {
        ...appointmentData,
        doctorId: user.id,
        doctorName: `Dr. ${user.firstName} ${user.lastName}`,
        doctorEmail: user.email
      };
      
      await appointmentApi.createAppointment(appointmentWithUser);
      await loadAppointments(); // Reload appointments
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  };

  const handleUpdateAppointment = async (appointmentData) => {
    if (!selectedAppointment?._id) return;
    
    try {
      await appointmentApi.updateAppointment(selectedAppointment._id, appointmentData);
      await loadAppointments(); // Reload appointments
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error;
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await appointmentApi.deleteAppointment(appointmentId);
      await loadAppointments(); // Reload appointments
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
      case 'pending': return 'from-yellow-400 to-yellow-600';
      case 'confirmed': return 'from-green-400 to-green-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Patients</p>
              <p className="text-3xl font-bold text-blue-400">{dashboardStats.totalPatients}</p>
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
              <p className="text-3xl font-bold text-green-400">{dashboardStats.todayAppointments}</p>
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
              <p className="text-3xl font-bold text-purple-400">{dashboardStats.pendingReports}</p>
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
              <p className="text-3xl font-bold text-red-400">{dashboardStats.criticalAlerts}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Appointments & Critical Patients */}
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
                    <h4 className="font-semibold text-white">{apt.patientName}</h4>
                    <p className="text-sm text-gray-400">{apt.appointmentType} • {apt.reason}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {apt.mode === 'video' ? 
                      <Video className="w-4 h-4 text-purple-400" /> : 
                      <Stethoscope className="w-4 h-4 text-green-400" />
                    }
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getStatusColor(apt.status)}`}></div>
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
            {patients.filter(p => p.status === 'critical').map((patient) => (
              <div key={patient.id} className="flex items-center bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-400 to-red-600 flex items-center justify-center text-white font-semibold mr-4">
                  {patient.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{patient.name}</h4>
                  <p className="text-sm text-gray-400">{patient.condition} • Age {patient.age}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center bg-white/5 rounded-xl p-4">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-4"></div>
            <div className="flex-1">
              <p className="text-white">Lab results reviewed for Michael Chen</p>
              <p className="text-sm text-gray-400">15 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center bg-white/5 rounded-xl p-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-4"></div>
            <div className="flex-1">
              <p className="text-white">New appointment scheduled with Emily Davis</p>
              <p className="text-sm text-gray-400">1 hour ago</p>
            </div>
          </div>
          <div className="flex items-center bg-white/5 rounded-xl p-4">
            <div className="w-2 h-2 bg-purple-400 rounded-full mr-4"></div>
            <div className="flex-1">
              <p className="text-white">Prescription updated for Sarah Johnson</p>
              <p className="text-sm text-gray-400">2 hours ago</p>
            </div>
          </div>
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
            </select>
            <button 
              onClick={() => openAppointmentModal()}
              className="flex items-center bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </button>
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

      {/* Appointments List */}
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
            <button 
              onClick={() => openAppointmentModal()}
              className="mt-4 text-blue-400 hover:text-blue-300"
            >
              Schedule your first appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => (
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
                      <button 
                        onClick={() => openAppointmentModal(apt)}
                        className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAppointment(apt._id)}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <X className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <div key={patient.id} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20 cursor-pointer">
            <div className="flex items-center mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getStatusColor(patient.status)} flex items-center justify-center text-white font-semibold mr-4`}>
                {patient.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white">{patient.name}</h4>
                <p className="text-sm text-gray-400">Age {patient.age}</p>
              </div>
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getStatusColor(patient.status)}`}></div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-400">Condition</p>
                <p className="text-white font-medium">{patient.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Last Visit</p>
                <p className="text-white">{patient.lastVisit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Next Appointment</p>
                <p className="text-white">{patient.nextAppointment}</p>
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
        
        <div className="space-y-4">
          {labReports.map((report) => (
            <div key={report.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${
                    report.priority === 'high' ? 'from-red-400 to-red-600' : 'from-green-400 to-green-600'
                  }`}></div>
                  <div>
                    <h4 className="font-semibold text-white">{report.patientName}</h4>
                    <p className="text-sm text-gray-400">{report.testType} • {report.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(report.status)} text-white`}>
                    {report.status}
                  </div>
                  <button className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors">
                    <Eye className="w-4 h-4 text-blue-400" />
                  </button>
                </div>
              </div>
              {report.results && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-300">{report.results}</p>
                </div>
              )}
            </div>
          ))}
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
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-4">Prescriptions</h3>
            <p className="text-gray-300">Prescription management system coming soon...</p>
          </div>
        );
      case 'ai-assistant':
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-4">AI Assistant</h3>
            <p className="text-gray-300">AI-powered diagnostic and treatment assistant coming soon...</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-4">Analytics</h3>
            <p className="text-gray-300">Practice analytics and insights coming soon...</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-4">Settings</h3>
            <p className="text-gray-300">Account and practice settings coming soon...</p>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Mobile Navigation Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:text-gray-300 transition-colors duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Doctor Portal
          </h1>
          <div className="flex items-center space-x-2">
            <button className="relative p-2">
              <Bell className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Layout Container */}
      <div className="flex pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-black/50 backdrop-blur-lg border-r border-white/10 z-30">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                    Doctor Portal
                  </h2>
                  <p className="text-xs text-gray-400">Dr. Alex Smith</p>
                </div>
              </div>
              </div>

            {/* Navigation Menu */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                  AS
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Dr. Alex Smith</p>
                  <p className="text-xs text-gray-400">Cardiologist</p>
                </div>
                <Settings className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-lg border-r border-white/10">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                        Doctor Portal
                      </h2>
                      <p className="text-xs text-gray-400">Dr. Alex Smith</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          activeSection === item.id
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Mobile User Profile */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                      AS
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">Dr. Alex Smith</p>
                      <p className="text-xs text-gray-400">Cardiologist</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Desktop Header */}
          <div className="hidden lg:block sticky top-0 z-20 bg-black/50 backdrop-blur-lg border-b border-white/10">
            <div className="flex items-center justify-between px-8 py-4">
              <div>
                <h1 className="text-2xl font-bold text-white capitalize">
                  {activeSection.replace('-', ' ')}
                </h1>
                <p className="text-sm text-gray-400">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Quick search..."
                    className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>
                
                <button className="relative p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <Bell className="w-5 h-5 text-white" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </button>
                
                <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                  <MessageCircle className="w-5 h-5 text-white" />
                </button>
                
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
                  AS
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 lg:p-8 min-h-screen">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppointment(null);
        }}
        onSubmit={selectedAppointment ? handleUpdateAppointment : handleCreateAppointment}
        appointment={selectedAppointment}
        userType="doctor"
        patients={patients}
      />
    </div>
  );
};

export default DoctorDashboard;