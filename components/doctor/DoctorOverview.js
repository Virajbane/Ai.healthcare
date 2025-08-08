// components/doctor/DoctorOverview.js
import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckCircle, XCircle, Clock, 
  TrendingUp, Activity, AlertCircle, Eye, Edit,
  Phone, Mail, MapPin, FileText, Pill, Search,
  Filter, Download, Plus, MoreHorizontal, Stethoscope
} from 'lucide-react';

const DoctorOverview = ({ user, onAppointmentModalOpen, onSectionChange }) => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingApprovals: 0,
    completedToday: 0
  });
  const [recentPatients, setRecentPatients] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard statistics
      const [statsRes, patientsRes, appointmentsRes, scheduleRes] = await Promise.all([
        fetch(`/api/doctor/dashboard-stats?doctorId=${user.id}`),
        fetch(`/api/patients?doctorId=${user.id}&limit=5&recent=true`),
        fetch(`/api/appointments?doctorId=${user.id}&status=pending&limit=5`),
        fetch(`/api/appointments?doctorId=${user.id}&date=${new Date().toISOString().split('T')[0]}&status=confirmed`)
      ]);

      const [statsData, patientsData, appointmentsData, scheduleData] = await Promise.all([
        statsRes.json(),
        patientsRes.json(),
        appointmentsRes.json(),
        scheduleRes.json()
      ]);

      setStats(statsData);
      setRecentPatients(patientsData.patients || []);
      setPendingAppointments(appointmentsData.appointments || []);
      setTodaySchedule(scheduleData.appointments || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: user.id })
      });

      if (response.ok) {
        // Refresh pending appointments
        setPendingAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
        setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  };

  const handleRejectAppointment = async (appointmentId, reason) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: user.id, reason })
      });

      if (response.ok) {
        // Refresh pending appointments
        setPendingAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
        setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, Dr. {user.firstName || user.name}
            </h1>
            <p className="text-blue-100 text-lg">
              {user.specialty || 'General Practice'} • {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="hidden md:block">
            <Stethoscope className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Total Patients</p>
              <p className="text-3xl font-bold text-white">{stats.totalPatients}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Today's Appointments</p>
              <p className="text-3xl font-bold text-white">{stats.todayAppointments}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Pending Approvals</p>
              <p className="text-3xl font-bold text-white">{stats.pendingApprovals}</p>
            </div>
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm">Completed Today</p>
              <p className="text-3xl font-bold text-white">{stats.completedToday}</p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Appointment Approvals */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              Pending Appointment Approvals
            </h2>
            <button 
              onClick={() => onSectionChange('appointments')}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-4">
            {pendingAppointments.length > 0 ? (
              pendingAppointments.map((appointment, index) => (
                <div key={appointment._id || index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {appointment.patientName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {appointment.patientName || 'Unknown Patient'}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {appointment.appointmentType || 'General Consultation'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {new Date(appointment.appointmentDate).toLocaleDateString()} at {appointment.appointmentTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApproveAppointment(appointment._id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRejectAppointment(appointment._id, 'Doctor unavailable')}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-300">No pending approvals</p>
                <p className="text-gray-400 text-sm">All appointments are up to date</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Today's Schedule
            </h2>
          </div>

          <div className="space-y-3">
            {todaySchedule.length > 0 ? (
              todaySchedule.map((appointment, index) => (
                <div key={appointment._id || index} className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-white text-sm">
                        {appointment.patientName}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {appointment.appointmentTime}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : appointment.status === 'completed'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {appointment.status}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-300 text-sm">No appointments today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            Recent Patients
          </h2>
          <button 
            onClick={() => onSectionChange('patients')}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium"
          >
            View All Patients
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentPatients.length > 0 ? (
            recentPatients.map((patient, index) => (
              <div key={patient._id || index} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {patient.firstName?.charAt(0) || patient.name?.charAt(0) || 'P'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">
                      {patient.firstName && patient.lastName 
                        ? `${patient.firstName} ${patient.lastName}`
                        : patient.name || 'Unknown Patient'
                      }
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Age: {patient.age || 'N/A'} • {patient.gender || 'N/A'}
                    </p>
                    <p className="text-gray-400 text-xs">
                      Last visit: {patient.lastVisit 
                        ? new Date(patient.lastVisit).toLocaleDateString()
                        : 'Never'
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    patient.status === 'stable' 
                      ? 'bg-green-500/20 text-green-400'
                      : patient.status === 'critical'
                      ? 'bg-red-500/20 text-red-400'
                      : patient.status === 'improving'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {patient.status || 'stable'}
                  </div>
                  <button className="text-gray-400 hover:text-white">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-300">No patients yet</p>
              <p className="text-gray-400 text-sm">Start adding patients to see them here</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => onAppointmentModalOpen(null, 'create')}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-4 text-center transition-colors group"
          >
            <Plus className="w-8 h-8 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-white font-medium">New Appointment</p>
          </button>
          
          <button 
            onClick={() => onSectionChange('patients')}
            className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-4 text-center transition-colors group"
          >
            <Users className="w-8 h-8 text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-white font-medium">View Patients</p>
          </button>
          
          <button 
            onClick={() => onSectionChange('lab-reports')}
            className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg p-4 text-center transition-colors group"
          >
            <FileText className="w-8 h-8 text-purple-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-white font-medium">Lab Reports</p>
          </button>
          
          <button 
            onClick={() => onSectionChange('prescriptions')}
            className="bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg p-4 text-center transition-colors group"
          >
            <Pill className="w-8 h-8 text-orange-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-white font-medium">Prescriptions</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorOverview;