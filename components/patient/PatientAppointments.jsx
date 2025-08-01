import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Video, Stethoscope, Clock, AlertCircle, 
  CheckCircle, X, Edit, Search, Filter 
} from 'lucide-react';
import { appointmentApi, getStatusColor, formatDate } from '../../lib/api';
import LoadingSpinner from '../shared/LoadingSpinner';

const PatientAppointments = ({ user, onAppointmentModalOpen }) => {
  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAppointments();
    
    // Listen for updates
    const handleUpdate = () => loadAppointments();
    window.addEventListener('appointmentUpdated', handleUpdate);
    
    return () => window.removeEventListener('appointmentUpdated', handleUpdate);
  }, [user?.id]);

  const loadAppointments = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [appointmentsResponse, upcomingResponse] = await Promise.all([
        appointmentApi.getAppointments(user.id, 'patient'),
        appointmentApi.getUpcomingAppointments(user.id, 'patient', 5)
      ]);
      
      setAppointments(appointmentsResponse.appointments || []);
      setUpcomingAppointments(upcomingResponse.appointments || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    try {
      await appointmentApi.deleteAppointment(appointmentId);
      await loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = !searchTerm || 
      apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', text: 'Pending' },
      confirmed: { color: 'green', text: 'Confirmed' },
      scheduled: { color: 'blue', text: 'Scheduled' },
      completed: { color: 'green', text: 'Completed' },
      cancelled: { color: 'red', text: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.scheduled;
    
    return (
      <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(status)} text-white`}>
        {config.text}
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading your appointments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-2xl font-bold">My Appointments</h3>
          <button 
            onClick={() => onAppointmentModalOpen()}
            className="flex items-center bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule New
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Upcoming Appointments - Quick View */}
      {upcomingAppointments.length > 0 && (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Upcoming Appointments</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">{upcomingAppointments.length} upcoming</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingAppointments.map((apt) => (
              <div key={apt._id} className="bg-white/5 rounded-xl p-4 border-l-4 border-green-400 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-semibold text-green-400">
                    {formatDate(apt.appointmentDate)}
                  </div>
                  <div className="text-sm text-gray-400">{apt.appointmentTime}</div>
                </div>
                <h4 className="font-semibold text-white mb-1">Dr. {apt.doctorName || 'Doctor'}</h4>
                <p className="text-sm text-gray-400 mb-3">{apt.reason}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {apt.mode === 'video' ? (
                      <Video className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Stethoscope className="w-4 h-4 text-green-400" />
                    )}
                    <span className="text-xs text-gray-400">
                      {apt.mode === 'video' ? 'Video Call' : 'In-Person'}
                    </span>
                  </div>
                  {getStatusBadge(apt.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Appointments */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <h3 className="text-xl font-semibold mb-6">All Appointments</h3>
        
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-gray-300 mb-2">No appointments found</h4>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Schedule your first appointment to get started'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button 
                onClick={() => onAppointmentModalOpen()}
                className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
              >
                Schedule Your First Appointment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((apt) => (
              <div key={apt._id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                      <div className="text-sm">{formatDate(apt.appointmentDate)}</div>
                      <div className="text-xs opacity-80">{apt.appointmentTime}</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">Dr. {apt.doctorName || 'Doctor'}</h4>
                      <p className="text-sm text-gray-400">{apt.reason}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          {apt.mode === 'video' ? (
                            <Video className="w-4 h-4 text-purple-400" />
                          ) : (
                            <Stethoscope className="w-4 h-4 text-green-400" />
                          )}
                          <span className="text-xs text-gray-400">
                            {apt.mode === 'video' ? 'Video Call' : 'In-Person'}
                          </span>
                        </div>
                        {apt.notes && (
                          <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                            Notes included
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(apt.status)}
                    <div className="flex items-center space-x-2">
                      {(apt.status === 'pending' || apt.status === 'scheduled') && (
                        <button 
                          onClick={() => onAppointmentModalOpen(apt, 'edit')}
                          className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                          title="Edit appointment"
                        >
                          <Edit className="w-4 h-4 text-blue-400" />
                        </button>
                      )}
                      {(apt.status === 'pending' || apt.status === 'scheduled') && (
                        <button 
                          onClick={() => handleDeleteAppointment(apt._id)}
                          className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                          title="Cancel appointment"
                        >
                          <X className="w-4 h-4 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Additional appointment details */}
                {apt.notes && (
                  <div className="mt-4 p-3 bg-white/5 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <span className="font-medium">Notes:</span> {apt.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Appointments</p>
              <p className="text-3xl font-bold text-blue-400">{appointments.length}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Upcoming</p>
              <p className="text-3xl font-bold text-green-400">{upcomingAppointments.length}</p>
            </div>
            <Clock className="w-8 h-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Completed</p>
              <p className="text-3xl font-bold text-purple-400">
                {appointments.filter(apt => apt.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;