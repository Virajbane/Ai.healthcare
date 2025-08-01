import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, Stethoscope, User } from 'lucide-react';

const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  appointment = null, 
  userType = 'patient', // 'patient' or 'doctor'
  mode = 'create' // 'create', 'edit', 'approve'
}) => {
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    doctorName: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    mode: 'in-person', // 'in-person' or 'video'
    notes: ''
  });

  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when appointment prop changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        patientName: appointment.patientName || '',
        patientEmail: appointment.patientEmail || '',
        doctorName: appointment.doctorName || '',
        appointmentDate: appointment.appointmentDate ? 
          new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
        appointmentTime: appointment.appointmentTime || '',
        reason: appointment.reason || '',
        mode: appointment.mode || 'in-person',
        notes: appointment.notes || ''
      });
    } else {
      setFormData({
        patientName: '',
        patientEmail: '',
        doctorName: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        mode: 'in-person',
        notes: ''
      });
    }
    setRejectionReason('');
    setErrors({});
  }, [appointment, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Date is required';
    }

    if (!formData.appointmentTime) {
      newErrors.appointmentTime = 'Time is required';
    }

    if (!formData.reason) {
      newErrors.reason = 'Reason is required';
    }

    if (userType === 'patient' && !formData.doctorName) {
      newErrors.doctorName = 'Doctor name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting appointment:', error);
      // Handle error display
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!appointment?._id) return;
    
    setIsProcessing(true);
    try {
      await onSubmit(appointment._id, 'approve');
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
      await onSubmit(appointment._id, 'reject', rejectionReason);
      onClose();
    } catch (error) {
      console.error('Error rejecting appointment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getModalTitle = () => {
    if (mode === 'approve') return 'Review Appointment Request';
    if (mode === 'edit') return 'Edit Appointment';
    return 'Schedule New Appointment';
  };

  if (!isOpen) return null;

  // Approval mode for doctors
  if (mode === 'approve' && appointment) {
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
                  <span className="text-gray-400">Email:</span> {appointment.patientEmail}
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
  }

  // Create/Edit mode
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            {getModalTitle()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Patient Info (for doctors) */}
          {userType === 'doctor' && (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => handleInputChange('patientName', e.target.value)}
                  className={`w-full bg-white/10 border ${errors.patientName ? 'border-red-400' : 'border-white/20'} rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter patient name"
                />
                {errors.patientName && <p className="text-red-400 text-sm mt-1">{errors.patientName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Patient Email
                </label>
                <input
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter patient email"
                />
              </div>
            </div>
          )}

          {/* Doctor Info (for patients) */}
          {userType === 'patient' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Doctor *
              </label>
              <input
                type="text"
                value={formData.doctorName}
                onChange={(e) => handleInputChange('doctorName', e.target.value)}
                className={`w-full bg-white/10 border ${errors.doctorName ? 'border-red-400' : 'border-white/20'} rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter doctor name"
              />
              {errors.doctorName && <p className="text-red-400 text-sm mt-1">{errors.doctorName}</p>}
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date *
              </label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full bg-white/10 border ${errors.appointmentDate ? 'border-red-400' : 'border-white/20'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.appointmentDate && <p className="text-red-400 text-sm mt-1">{errors.appointmentDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Time *
              </label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                className={`w-full bg-white/10 border ${errors.appointmentTime ? 'border-red-400' : 'border-white/20'} rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.appointmentTime && <p className="text-red-400 text-sm mt-1">{errors.appointmentTime}</p>}
            </div>
          </div>

          {/* Appointment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Appointment Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleInputChange('mode', 'in-person')}
                className={`flex items-center justify-center p-3 rounded-lg border transition-all duration-300 ${
                  formData.mode === 'in-person'
                    ? 'bg-green-500/20 border-green-400 text-green-400'
                    : 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Stethoscope className="w-5 h-5 mr-2" />
                In-Person
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('mode', 'video')}
                className={`flex items-center justify-center p-3 rounded-lg border transition-all duration-300 ${
                  formData.mode === 'video'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-400'
                    : 'bg-white/5 border-white/20 text-gray-400 hover:bg-white/10'
                }`}
              >
                <Video className="w-5 h-5 mr-2" />
                Video Call
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Visit *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={3}
              className={`w-full bg-white/10 border ${errors.reason ? 'border-red-400' : 'border-white/20'} rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Describe the reason for your appointment..."
            />
            {errors.reason && <p className="text-red-400 text-sm mt-1">{errors.reason}</p>}
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional information..."
            />
          </div>

          {/* Submit Buttons */}
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
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 disabled:opacity-50"
            >
              {isProcessing ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;