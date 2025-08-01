"use client"
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, User, Video, Stethoscope, Phone, 
  MapPin, FileText, AlertCircle, CheckCircle, X, 
  Plus, Edit, Trash2, Search, Filter
} from 'lucide-react';

// MongoDB Schema (for reference)
/*
const appointmentSchema = {
  _id: ObjectId,
  patientId: ObjectId,
  doctorId: ObjectId,
  patientName: String,
  doctorName: String,
  patientEmail: String,
  doctorEmail: String,
  appointmentDate: Date,
  appointmentTime: String,
  duration: Number, // in minutes
  type: String, // 'consultation', 'follow-up', 'checkup', 'emergency'
  mode: String, // 'in-person', 'video', 'phone'
  status: String, // 'scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled'
  reason: String,
  notes: String,
  location: String, // for in-person appointments
  meetingLink: String, // for video appointments
  createdAt: Date,
  updatedAt: Date,
  reminders: [{
    type: String, // 'email', 'sms'
    sentAt: Date,
    status: String // 'sent', 'delivered', 'failed'
  }]
}
*/

const AppointmentManager = ({ userType, userId, userName, userEmail }) => {
  const [appointments, setAppointments] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('upcoming');

  const [formData, setFormData] = useState({
    patientName: userType === 'patient' ? userName : '',
    doctorName: userType === 'doctor' ? userName : '',
    patientEmail: userType === 'patient' ? userEmail : '',
    doctorEmail: userType === 'doctor' ? userEmail : '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    type: 'consultation',
    mode: 'in-person',
    reason: '',
    notes: '',
    location: '',
    meetingLink: ''
  });

  // API Functions
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/appointments?userId=${userId}&userType=${userType}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...appointmentData,
          patientId: userType === 'patient' ? userId : null,
          doctorId: userType === 'doctor' ? userId : null,
          status: 'scheduled',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(prev => [...prev, data.appointment]);
        setShowScheduleForm(false);
        resetForm();
        alert('Appointment scheduled successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (appointmentId, updates) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          updatedAt: new Date()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAppointments(prev => 
          prev.map(apt => apt._id === appointmentId ? data.appointment : apt)
        );
        setShowEditForm(false);
        setSelectedAppointment(null);
        alert('Appointment updated successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    await updateAppointment(appointmentId, { status });
  };

  const deleteAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAppointments(prev => prev.filter(apt => apt._id !== appointmentId));
        alert('Appointment cancelled successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userId, userType]);

  const resetForm = () => {
    setFormData({
      patientName: userType === 'patient' ? userName : '',
      doctorName: userType === 'doctor' ? userName : '',
      patientEmail: userType === 'patient' ? userEmail : '',
      doctorEmail: userType === 'doctor' ? userEmail : '',
      appointmentDate: '',
      appointmentTime: '',
      duration: 30,
      type: 'consultation',
      mode: 'in-person',
      reason: '',
      notes: '',
      location: '',
      meetingLink: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.appointmentDate || !formData.appointmentTime) {
      alert('Please select date and time');
      return;
    }
    
    if (userType === 'patient' && !formData.doctorName) {
      alert('Please enter doctor name');
      return;
    }
    
    if (userType === 'doctor' && !formData.patientName) {
      alert('Please enter patient name');
      return;
    }

    createAppointment(formData);
  };

  const handleEdit = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      patientName: appointment.patientName,
      doctorName: appointment.doctorName,
      patientEmail: appointment.patientEmail,
      doctorEmail: appointment.doctorEmail,
      appointmentDate: appointment.appointmentDate.split('T')[0],
      appointmentTime: appointment.appointmentTime,
      duration: appointment.duration,
      type: appointment.type,
      mode: appointment.mode,
      reason: appointment.reason,
      notes: appointment.notes,
      location: appointment.location || '',
      meetingLink: appointment.meetingLink || ''
    });
    setShowEditForm(true);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateAppointment(selectedAppointment._id, formData);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'from-yellow-400 to-yellow-600';
      case 'confirmed': return 'from-green-400 to-green-600';
      case 'completed': return 'from-blue-400 to-blue-600';
      case 'cancelled': return 'from-red-400 to-red-600';
      case 'rescheduled': return 'from-purple-400 to-purple-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return Clock;
      case 'confirmed': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'cancelled': return X;
      case 'rescheduled': return Calendar;
      default: return AlertCircle;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apt.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
    
    const appointmentDate = new Date(apt.appointmentDate);
    const today = new Date();
    const matchesDate = filterDate === 'all' || 
                       (filterDate === 'upcoming' && appointmentDate >= today) ||
                       (filterDate === 'past' && appointmentDate < today);
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const ScheduleForm = ({ isEdit = false }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h3>
          <button 
            onClick={() => {
              isEdit ? setShowEditForm(false) : setShowScheduleForm(false);
              setSelectedAppointment(null);
              resetForm();
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={isEdit ? handleUpdate : handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient/Doctor Info */}
            {userType === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient name"
                  required
                />
              </div>
            )}

            {userType === 'patient' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Doctor Name *
                </label>
                <input
                  type="text"
                  value={formData.doctorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter doctor name"
                  required
                />
              </div>
            )}

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Appointment Date *
              </label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentDate: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Appointment Time *
              </label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData(prev => ({ ...prev, appointmentTime: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (minutes)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Appointment Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="consultation">Consultation</option>
                <option value="follow-up">Follow-up</option>
                <option value="checkup">Regular Checkup</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Appointment Mode
              </label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData(prev => ({ ...prev, mode: e.target.value }))}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="in-person">In-Person</option>
                <option value="video">Video Call</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>

            {/* Location (for in-person) */}
            {formData.mode === 'in-person' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter clinic/hospital address"
                />
              </div>
            )}

            {/* Meeting Link (for video) */}
            {formData.mode === 'video' && isEdit && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter video call link"
                />
              </div>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Visit *
            </label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the appointment purpose"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
              placeholder="Any additional information or special requirements"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => {
                isEdit ? setShowEditForm(false) : setShowScheduleForm(false);
                setSelectedAppointment(null);
                resetForm();
              }}
              className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isEdit ? 'Update Appointment' : 'Schedule Appointment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white">Appointments</h2>
          <button
            onClick={() => setShowScheduleForm(true)}
            className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule New
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Dates</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading appointments...</p>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No appointments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => {
              const StatusIcon = getStatusIcon(appointment.status);
              return (
                <div key={appointment._id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getStatusColor(appointment.status)} flex items-center justify-center`}>
                        <StatusIcon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-white">
                            {userType === 'patient' ? `Dr. ${appointment.doctorName}` : appointment.patientName}
                          </h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getStatusColor(appointment.status)} text-white`}>
                            {appointment.status}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-400 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {new Date(appointment.appointmentDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {appointment.appointmentTime}
                            </span>
                            <span className="flex items-center">
                              {appointment.mode === 'video' ? <Video className="w-4 h-4 mr-1" /> :
                               appointment.mode === 'phone' ? <Phone className="w-4 h-4 mr-1" /> :
                               <MapPin className="w-4 h-4 mr-1" />}
                              {appointment.mode}
                            </span>
                          </div>
                          <p><strong>Type:</strong> {appointment.type}</p>
                          <p><strong>Reason:</strong> {appointment.reason}</p>
                          {appointment.location && <p><strong>Location:</strong> {appointment.location}</p>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {appointment.status === 'scheduled' && (
                        <button
                          onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                          className="p-2 bg-green-500/20 rounded-lg hover:bg-green-500/30 transition-colors"
                          title="Confirm"
                        >
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="p-2 bg-blue-500/20 rounded-lg hover:bg-blue-500/30 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-blue-400" />
                      </button>
                      
                      <button
                        onClick={() => deleteAppointment(appointment._id)}
                        className="p-2 bg-red-500/20 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Cancel"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Forms */}
      {showScheduleForm && <ScheduleForm />}
      {showEditForm && <ScheduleForm isEdit />}
    </div>
  );
};

export default AppointmentManager;