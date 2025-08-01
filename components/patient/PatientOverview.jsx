import React, { useState, useEffect } from 'react';
import { 
  Heart, Calendar, Pill, FileText, User, Activity, Brain, 
  ChevronRight, Plus, Video, Stethoscope, AlertCircle, CheckCircle 
} from 'lucide-react';
import { healthApi, appointmentApi, medicationApi } from '../../utils/api';
import LoadingSpinner from '../shared/LoadingSpinner';

const PatientOverview = ({ user, onAppointmentModalOpen, onSectionChange }) => {
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: 0,
    bmi: 0,
    bloodSugar: 0,
    bloodPressure: '0/0'
  });
  
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentMedications, setRecentMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigationItems = [
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'medications', label: 'Medications', icon: Pill },
    { id: 'lab-reports', label: 'Lab Reports', icon: FileText },
    { id: 'personal-info', label: 'Personal Info', icon: User },
    { id: 'ai-chatbot', label: 'AI Chatbot', icon: Brain }
  ];

  useEffect(() => {
    loadDashboardData();
    
    // Listen for updates
    const handleUpdate = () => loadDashboardData();
    window.addEventListener('appointmentUpdated', handleUpdate);
    
    return () => window.removeEventListener('appointmentUpdated', handleUpdate);
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [healthResponse, appointmentsResponse, medicationsResponse] = await Promise.all([
        healthApi.getHealthMetrics(user.id),
        appointmentApi.getUpcomingAppointments(user.id, 'patient', 3),
        healthApi.getHealthMetrics(user.id) // This would be medications in a real app
      ]);

      if (healthResponse.metrics) {
        animateHealthMetrics(healthResponse.metrics);
      }
      
      setUpcomingAppointments(appointmentsResponse.appointments || []);
      
      // Mock recent medications for demo
      setRecentMedications([
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Daily', status: 'active' },
        { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', status: 'active' }
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const animateHealthMetrics = (targetMetrics) => {
    // Animate the health metrics counters
    Object.keys(targetMetrics).forEach(key => {
      if (typeof targetMetrics[key] === 'number') {
        let current = 0;
        const target = targetMetrics[key];
        const increment = target / 30;
        
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          setHealthMetrics(prev => ({
            ...prev,
            [key]: Math.floor(current)
          }));
        }, 50);
      } else {
        setHealthMetrics(prev => ({
          ...prev,
          [key]: targetMetrics[key]
        }));
      }
    });
  };

  const handleNavigationClick = (sectionId) => {
    onSectionChange(sectionId);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your health dashboard..." />;
  }

  return (
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
            <div className="text-2xl font-bold text-blue-400">{healthMetrics.heartRate || 72}</div>
            <div className="text-sm text-gray-400 mt-1">Heart Rate</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-blue-400">{healthMetrics.bmi || 23.5}</div>
            <div className="text-sm text-gray-400 mt-1">BMI</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-blue-400">{healthMetrics.bloodSugar || 95}</div>
            <div className="text-sm text-gray-400 mt-1">Blood Sugar</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-blue-400">{healthMetrics.bloodPressure || '120/80'}</div>
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
          <button
            onClick={() => onAppointmentModalOpen()}
            className="w-full flex items-center justify-between bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 hover:translate-x-2"
          >
            <div className="flex items-center">
              <Plus className="w-5 h-5 text-green-400 mr-3" />
              <span className="text-white">Schedule Appointment</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
          {navigationItems.slice(0, 4).map((item) => {
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
          <h3 className="text-xl font-semibold">Upcoming Appointments</h3>
        </div>
        <div className="space-y-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.slice(0, 3).map((apt, index) => (
              <div key={apt._id || index} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Dr. {apt.doctorName || 'Smith'}</p>
                    <p className="text-sm text-gray-400">
                      {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                    </p>
                    <p className="text-xs text-gray-500">{apt.reason}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {apt.mode === 'video' ? (
                      <Video className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Stethoscope className="w-4 h-4 text-green-400" />
                    )}
                    <div className={`w-2 h-2 rounded-full ${
                      apt.status === 'confirmed' ? 'bg-green-400' : 
                      apt.status === 'pending' ? 'bg-yellow-400' : 'bg-blue-400'
                    }`}></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-white font-medium">No upcoming appointments</p>
              <p className="text-sm text-gray-400">Schedule your next appointment</p>
              <button 
                onClick={() => onAppointmentModalOpen()}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
              >
                Schedule Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Current Medications */}
      <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/20 relative overflow-hidden lg:col-span-2 xl:col-span-1">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center mr-4">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Current Medications</h3>
          </div>
          <button 
            onClick={() => handleNavigationClick('medications')}
            className="text-purple-400 hover:text-purple-300 text-sm"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentMedications.length > 0 ? (
            recentMedications.map((med, index) => (
              <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                <div>
                  <h4 className="font-semibold text-white text-sm">{med.name}</h4>
                  <p className="text-xs text-gray-400">{med.dosage} • {med.frequency}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-green-400">Active</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <Pill className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No medications found</p>
              <button 
                onClick={() => handleNavigationClick('medications')}
                className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
              >
                Add medications
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Health Tips */}
      <div className="group bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-orange-500/20 relative overflow-hidden lg:col-span-2">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center mr-4">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold">Health Tips & Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">Daily Wellness</h4>
            <p className="text-sm text-gray-400">Remember to take your medications and stay hydrated. Your heart rate looks good!</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <h4 className="font-semibold text-white mb-2">AI Recommendation</h4>
            <p className="text-sm text-gray-400">Based on your metrics, consider scheduling a routine check-up this month.</p>
          </div>
        </div>
        <button 
          onClick={() => handleNavigationClick('ai-chatbot')}
          className="w-full mt-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white py-2 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
        >
          Get Personalized Health Insights
        </button>
      </div>
    </div>
  );
};

export default PatientOverview;