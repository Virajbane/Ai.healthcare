"use client"
import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, Pill, FileText, User, Settings, MessageCircle, Upload, 
  ChevronRight, Menu, X, Home, Activity, Brain, Plus, Video, Stethoscope,
  Clock, AlertCircle, CheckCircle, Phone, Bell
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppointmentModal from './AppointmentModal';

// Real API functions that fetch data from database
const healthApi = {
  getHealthMetrics: async (userId) => {
    try {
      const response = await fetch(`/api/health-metrics?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch health metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      return { metrics: {} };
    }
  },
  updateHealthMetrics: async (userId, metrics) => {
    try {
      const response = await fetch(`/api/health-metrics`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, metrics })
      });
      if (!response.ok) throw new Error('Failed to update health metrics');
      return await response.json();
    } catch (error) {
      console.error('Error updating health metrics:', error);
      throw error;
    }
  }
};

const medicationApi = {
  getMedications: async (userId) => {
    try {
      const response = await fetch(`/api/medications?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch medications');
      return await response.json();
    } catch (error) {
      console.error('Error fetching medications:', error);
      return { medications: [] };
    }
  },
  addMedication: async (medicationData) => {
    try {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicationData)
      });
      if (!response.ok) throw new Error('Failed to add medication');
      return await response.json();
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  }
};

const labReportApi = {
  getLabReports: async (userId) => {
    try {
      const response = await fetch(`/api/lab-reports?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch lab reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching lab reports:', error);
      return { reports: [] };
    }
  }
};

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
  createAppointment: async (appointmentData) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });
      if (!response.ok) throw new Error('Failed to create appointment');
      return await response.json();
    } catch (error) {
      console.error('Error creating appointment:', error);
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

const HealthcareDashboard = ({ user }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  
  // Loading and error states
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [userError, setUserError] = useState(null);
  
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
  
  // Additional data states
  const [medications, setMedications] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [isLoadingMedications, setIsLoadingMedications] = useState(false);
  const [isLoadingLabReports, setIsLoadingLabReports] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'lab-reports', label: 'Lab Reports', icon: FileText },
    { id: 'personal-info', label: 'Personal Info', icon: User },
    { id: 'ai-chatbot', label: 'AI Chatbot', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoadingUser(true);
      try {
        const userData = await getCurrentUser();
        if (userData) {
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

  // Load health metrics from database
  useEffect(() => {
    const loadHealthMetrics = async () => {
      if (!user?.id) return;
      
      try {
        const response = await healthApi.getHealthMetrics(user.id);
        if (response.metrics) {
          setHealthMetrics(response.metrics);
        }
      } catch (error) {
        console.error('Error loading health metrics:', error);
      }
    };

    if (user?.id) {
      loadHealthMetrics();
    }
  }, [user?.id]);

  // Load appointments when appointments section is active
  useEffect(() => {
    if (activeSection === 'appointments' && user?.id) {
      loadAppointments();
    }
  }, [activeSection, user?.id]);

  // Load medications when medications section is active
  useEffect(() => {
    if (activeSection === 'medications' && user?.id) {
      loadMedications();
    }
  }, [activeSection, user?.id]);

  // Load lab reports when lab-reports section is active
  useEffect(() => {
    if (activeSection === 'lab-reports' && user?.id) {
      loadLabReports();
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

  const loadMedications = async () => {
    if (!user?.id) return;
    
    setIsLoadingMedications(true);
    try {
      const response = await medicationApi.getMedications(user.id);
      setMedications(response.medications || []);
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setIsLoadingMedications(false);
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
    console.log('Feedback submitted:', feedbackForm);
    setFeedbackForm({ subject: 'General Inquiry', message: '' });
  };

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
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.slice(0, 3).map((apt, index) => (
              <div key={apt._id || index} className="bg-white/5 rounded-xl p-4">
                <p className="text-white font-medium">Appointment with {apt.doctorName || 'Doctor'}</p>
                <p className="text-sm text-gray-400">{new Date(apt.appointmentDate).toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white font-medium">No recent activity</p>
              <p className="text-sm text-gray-400">Schedule your first appointment</p>
            </div>
          )}
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
        
        {isLoadingMedications ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="ml-3 text-white">Loading medications...</span>
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-8">
            <Pill className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No medications found</p>
            <p className="text-sm text-gray-500 mt-2">Add your first medication to start tracking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((med, index) => (
              <div key={med._id || index} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                <div className="flex-1">
                  <h4 className="font-semibold text-white">{med.name}</h4>
                  <p className="text-sm text-gray-400">{med.dosage} • {med.frequency}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  med.status === 'ok' || med.status === 'active'
                    ? 'bg-gradient-to-r from-green-400 to-green-600 text-white' 
                    : 'bg-gradient-to-r from-red-400 to-red-600 text-white'
                }`}>
                  {med.daysLeft || med.status}
                </div>
              </div>
            ))}
          </div>
        )}
        
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
        
        {isLoadingLabReports ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span className="ml-3 text-white">Loading lab reports...</span>
          </div>
        ) : labReports.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No lab reports found</p>
            <p className="text-sm text-gray-500 mt-2">Upload your first lab report to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold mb-4">Recent Reports</h4>
            {labReports.map((report, index) => (
              <div key={report._id || index} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer">
                <div className="font-semibold text-white">{report.testType || report.name}</div>
                <div className="text-sm text-gray-400">
                  {report.testDate ? new Date(report.testDate).toLocaleDateString() : report.date}
                </div>
                {report.status && (
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2 ${
                    report.status === 'completed' || report.status === 'reviewed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {report.status}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
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
      case 'ai-chatbot':
        return (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-2xl font-bold mb-6">AI Health Assistant</h3>
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-gray-300 mb-2">AI-Powered Health Insights</h4>
              <p className="text-gray-400 mb-6">Get personalized health recommendations and answers to your questions</p>
              <button className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300">
                Start Chat
              </button>
            </div>
          </div>
        );
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
            <p className="text-white">Loading healthcare dashboard...</p>
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">HealthCare AI</h2>
                  <p className="text-xs text-gray-400">
                    {user ? `${user.firstName} ${user.lastName} Portal` : 'Patient Portal'}
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
                        ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30'
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
                    {user ? `${user.firstName?.[0]}${user.lastName?.[0]}` : 'PT'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {user ? `${user.firstName} ${user.lastName}` : 'Patient'}
                  </p>
                  <p className="text-xs text-gray-400">{user?.email || 'email@example.com'}</p>
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
                      {user ? `Welcome back, ${user.firstName} ${user.lastName}` : 'Welcome back'}
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
          <AppointmentModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedAppointment(null);
            }}
            onSubmit={selectedAppointment ? handleUpdateAppointment : handleCreateAppointment}
            appointment={selectedAppointment}
            userType="patient"
          />
        </>
      )}
    </div>
  );
};

export default HealthcareDashboard;