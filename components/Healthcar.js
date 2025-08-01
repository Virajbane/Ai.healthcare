"use client"
import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, Pill, FileText, User, Settings, MessageCircle, Upload, 
  ChevronRight, Menu, X, Home, Activity, Brain, Plus, Video, Stethoscope,
  Clock, AlertCircle, CheckCircle, Phone
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { appointmentApi } from '@/lib/appointmentApi';
import AppointmentModal from './AppointmentModal';

const HealthcareDashboard = ({ user }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: 0,
    bmi: 0,
    bloodSugar: 0,
    bloodPressure: '0/0'
  });
  
  const [settings, setSettings] = useState({
    privacy: false,
    notifications: true,
    darkTheme: true
  });
  
  const [feedbackForm, setFeedbackForm] = useState({
    subject: 'General Inquiry',
    message: ''
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
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'lab-reports', label: 'Lab Reports', icon: FileText },
    { id: 'personal-info', label: 'Personal Info', icon: User },
    { id: 'ai-chatbot', label: 'AI Chatbot', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Animate health metrics on load
  useEffect(() => {
    const targets = { heartRate: 72, bmi: 24.5, bloodSugar: 95 };
    
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
        setHealthMetrics(prev => ({
          ...prev,
          [key]: key === 'bmi' ? current.toFixed(1) : Math.floor(current)
        }));
      }, 50);
    });
    
    setTimeout(() => {
      setHealthMetrics(prev => ({ ...prev, bloodPressure: '120/80' }));
    }, 1000);
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
      const response = await appointmentApi.getAppointments(user.id, 'patient');
      setAppointments(response.appointments || []);
      
      const upcomingResponse = await appointmentApi.getUpcomingAppointments(user.id, 'patient', 3);
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
        patientId: user.id,
        patientName: `${user.firstName} ${user.lastName}`,
        patientEmail: user.email
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

  const handleSettingToggle = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert(`File "${file.name}" selected for upload!`);
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your feedback! We\'ll get back to you soon.');
    setFeedbackForm({ subject: 'General Inquiry', message: '' });
  };

  const mockAppointments = [
    { date: 'Jul 15', doctor: 'Dr. Johnson - Cardiology', time: '10:30 AM', type: 'Regular Checkup' },
    { date: 'Jul 22', doctor: 'Dr. Smith - General Medicine', time: '2:00 PM', type: 'Follow-up' }
  ];

  const medications = [
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', status: 'ok', daysLeft: '7 days left' },
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', status: 'due', daysLeft: 'Refill needed' }
  ];

  const recentFiles = [
    { name: 'Blood Test Results', date: 'June 28, 2025' },
    { name: 'X-Ray Report', date: 'June 15, 2025' }
  ];

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Health Metrics Card */}
      <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center mr-4">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold">Health Metrics</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-blue-400">{healthMetrics.heartRate}</div>
            <div className="text-sm text-gray-400 mt-1">Heart Rate</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-blue-400">{healthMetrics.bmi}</div>
            <div className="text-sm text-gray-400 mt-1">BMI</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-blue-400">{healthMetrics.bloodSugar}</div>
            <div className="text-sm text-gray-400 mt-1">Blood Sugar</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-blue-400">{healthMetrics.bloodPressure}</div>
            <div className="text-sm text-gray-400 mt-1">Blood Pressure</div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mr-4">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold">Quick Actions</h3>
        </div>
        <div className="space-y-3">
          {navigationItems.slice(1, 6).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigationClick(item.id)}
                className="w-full flex items-center justify-between bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:translate-x-2"
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5 text-blue-400 mr-3" />
                  <span className="text-white">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-green-500/20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center mr-4">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white font-medium">Lab results uploaded</p>
            <p className="text-sm text-gray-400">2 hours ago</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white font-medium">Appointment scheduled</p>
            <p className="text-sm text-gray-400">1 day ago</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-white font-medium">Medication reminder</p>
            <p className="text-sm text-gray-400">2 days ago</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppointments = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Appointments</h3>
          <button 
            onClick={() => openAppointmentModal()}
            className="flex items-center bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule New
          </button>
        </div>
        
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
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-3 py-1 rounded-lg font-semibold text-sm">
                      {new Date(apt.appointmentDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{apt.doctorName || 'Dr. Smith'}</h4>
                      <p className="text-sm text-gray-400">
                        {apt.reason} • {apt.appointmentTime} • {apt.mode === 'video' ? 'Video Call' : 'In-Person'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {apt.mode === 'video' ? (
                      <Video className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Stethoscope className="w-4 h-4 text-green-400" />
                    )}
                    <button 
                      onClick={() => openAppointmentModal(apt)}
                      className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-blue-400" />
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
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderMedications = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold mb-6">Medication Tracker</h3>
        <div className="space-y-4">
          {medications.map((med, index) => (
            <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
              <div className="flex-1">
                <h4 className="font-semibold text-white">{med.name}</h4>
                <p className="text-sm text-gray-400">{med.dosage} • {med.frequency}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                med.status === 'ok' 
                  ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                  : 'bg-gradient-to-r from-red-400 to-red-600 text-white'
              }`}>
                {med.daysLeft}
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 bg-gradient-to-r from-green-400 to-green-600 text-white py-3 rounded-xl font-semibold">
          Add New Medication
        </button>
      </div>
    </div>
  );

  const renderLabReports = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold mb-6">Lab Reports</h3>
        <div 
          className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-400/5 transition-all duration-300 cursor-pointer mb-6"
          onClick={() => document.getElementById('fileInput').click()}
        >
          <Upload className="w-12 h-12 text-blue-400 mx-auto mb-3" />
          <p className="text-gray-300">Click to upload new lab results</p>
          <input 
            type="file" 
            id="fileInput" 
            className="hidden" 
            accept=".pdf,.jpg,.png" 
            onChange={handleFileUpload}
          />
        </div>
        <div className="space-y-3">
          <h4 className="text-lg font-semibold mb-4">Recent Reports</h4>
          {recentFiles.map((file, index) => (
            <div key={index} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <div className="font-semibold text-white">{file.name}</div>
              <div className="text-sm text-gray-400">{file.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold mb-6">Personal Health Record</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Basic Information</h4>
              <p className="text-gray-400">Age: 34</p>
              <p className="text-gray-400">Blood Type: A+</p>
              <p className="text-gray-400">Height: 5'6"</p>
              <p className="text-gray-400">Weight: 145 lbs</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Emergency Contact</h4>
              <p className="text-gray-400">John Doe - Spouse</p>
              <p className="text-gray-400">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Allergies</h4>
              <p className="text-gray-400">Penicillin, Shellfish</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Medical History</h4>
              <p className="text-gray-400">Hypertension (2018)</p>
              <p className="text-gray-400">Appendectomy (2015)</p>
            </div>
          </div>
        </div>
        <button className="w-full mt-6 bg-gradient-to-r from-purple-400 to-purple-600 text-white py-3 rounded-xl font-semibold">
          Edit Information
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-2xl font-bold mb-6">Settings</h3>
        <div className="space-y-6">
          {Object.entries(settings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-white/10 last:border-b-0">
              <div>
                <span className="text-white font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <p className="text-sm text-gray-400">
                  {key === 'privacy' && 'Control who can see your health data'}
                  {key === 'notifications' && 'Get alerts for appointments and medications'}
                  {key === 'darkTheme' && 'Switch between light and dark theme'}
                </p>
              </div>
              <button
                onClick={() => handleSettingToggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-white/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleNavigationClick = (sectionId) => {
    if (sectionId === 'ai-chatbot') {
      // Navigate to the dedicated AI chatbot page
      router.push('/ai-chatbot');
    } else {
      // Handle other navigation items normally
      setActiveSection(sectionId);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'appointments':
        return renderAppointments();
      case 'medications':
        return renderMedications();
      case 'lab-reports':
        return renderLabReports();
      case 'personal-info':
        return renderPersonalInfo();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      {/* Mobile Navigation Bar - Fixed at top */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:text-gray-300 transition-colors duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            HealthAI
          </h1>
          <div className="w-6 h-6"></div>
        </div>
      </div>

      {/* Layout Container */}
      <div className="flex pt-16 lg:pt-0 min-h-screen">
        {/* Desktop Sidebar - Fixed position */}
        <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-black/50 backdrop-blur-lg border-r border-white/10 z-30">
          <div className="flex flex-col mt-20 h-full">
            {/* Logo */}
            <div className="flex items-center justify-center p-6 border-b border-white/10">
              
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 mt-10 px-4 py-6 overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigationClick(item.id)}
                    className={`w-full flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-300 ${
                      activeSection === item.id 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105' 
                        : 'text-gray-400 hover:text-white hover:bg-white/10 hover:transform hover:scale-105'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile Sidebar - Overlay */}
        <div className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className={`absolute left-0 top-0 bottom-0 w-64 bg-black/90 backdrop-blur-lg border-r border-white/10 transform transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                  HealthAI
                </h2>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Navigation */}
              <nav className="flex-1  px-4 py-6 overflow-y-auto">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleNavigationClick(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center  px-4 py-3 mb-2 rounded-xl transition-all duration-300 ${
                        activeSection === item.id 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="p-4 lg:p-6 max-w-full overflow-hidden">
            {/* Welcome Section */}
            <div className="mb-8 mt-32">
              <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2">
                {activeSection === 'dashboard' ? 'Welcome back, Sarah!' : 
                 navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-gray-300 text-sm lg:text-base">
                {activeSection === 'dashboard' ? "Here's your health overview for today" : 
                 `Manage your ${navigationItems.find(item => item.id === activeSection)?.label.toLowerCase()}`}
              </p>
            </div>

            {/* Content */}
            <div className="min-h-0">
              {renderContent()}
            </div>
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
        userType="patient"
        doctors={[
          { id: 1, name: 'Dr. Johnson', specialty: 'Cardiology' },
          { id: 2, name: 'Dr. Smith', specialty: 'General Medicine' },
          { id: 3, name: 'Dr. Davis', specialty: 'Dermatology' }
        ]}
      />
    </div>
  );
};

export default HealthcareDashboard;