// components/doctor/DoctorAppointments.js
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, CheckCircle, XCircle, Eye, Edit, 
  Search, Filter, Download, MoreHorizontal, Phone,
  Mail, MapPin, AlertCircle, User, Plus
} from 'lucide-react';

const DoctorAppointments = ({ user, onAppointmentModalOpen }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/appointments?doctorId=${user.id}`);
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
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
        await loadAppointments();
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
    }
  };

  const handleRejectAppointment = async () => {
    if (!selectedAppointment || !rejectReason.trim()) return;

    try {
      const response = await fetch(`/api/appointments/${selectedAppointment._id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          doctorId: user.id, 
          reason: rejectReason 
        })
      });

      if (response.ok) {
        await loadAppointments();
        setShowRejectModal(false);
        setSelectedAppointment(null);
        setRejectReason('');
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctorId: user.id })
      });

      if (response.ok) {
        await loadAppointments();
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === 'all' || appointment.status === filter;
    const matchesSearch = appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.appointmentType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !selectedDate || 
                       new Date(appointment.appointmentDate).toDateString() === new Date(selectedDate).toDateString();
    
    return matchesFilter && matchesSearch && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'confirmed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Appointment Management</h1>
          <p className="text-gray-300">Manage and approve patient appointments</p>
        </div>
        <button
          onClick={() => onAppointmentModalOpen(null, 'create')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Schedule Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-500"
          />

          <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/20">
              <tr>
                <th className="text-left p-4 text-white font-semibold">Patient</th>
                <th className="text-left p-4 text-white font-semibold">Date & Time</th>
                <th className="text-left p-4 text-white font-semibold">Type</th>
                <th className="text-left p-4 text-white font-semibold">Status</th>
                <th className="text-left p-4 text-white font-semibold">Contact</th>
                <th className="text-center p-4 text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment, index) => (
                  <tr key={appointment._id || index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {appointment.patientName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">
                            {appointment.patientName || 'Unknown Patient'}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {appointment.patientEmail || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white">
                        <p className="font-medium">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {appointment.appointmentTime}
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white">
                        {appointment.appointmentType || 'General Consultation'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        {appointment.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {appointment.patientPhone && (
                          <a 
                            href={`tel:${appointment.patientPhone}`}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        )}
                        {appointment.patientEmail && (
                          <a 
                            href={`mailto:${appointment.patientEmail}`}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center space-x-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveAppointment(appointment._id)}
                              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowRejectModal(true);
                              }}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleCompleteAppointment(appointment._id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
                            title="Mark Complete"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onAppointmentModalOpen(appointment, 'view')}
                          className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onAppointmentModalOpen(appointment, 'edit')}
                          className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-300">No appointments found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your filters or create a new appointment</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Reject Appointment</h3>
            <p className="text-gray-300 mb-4">
              Please provide a reason for rejecting this appointment with {selectedAppointment?.patientName}:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
              rows="3"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedAppointment(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectAppointment}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg transition-colors"
              >
                Reject Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {appointments.filter(a => a.status === 'pending').length}
            </p>
            <p className="text-gray-300 text-sm">Pending Approval</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {appointments.filter(a => a.status === 'confirmed').length}
            </p>
            <p className="text-gray-300 text-sm">Confirmed</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {appointments.filter(a => a.status === 'completed').length}
            </p>
            <p className="text-gray-300 text-sm">Completed</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {appointments.length}
            </p>
            <p className="text-gray-300 text-sm">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;