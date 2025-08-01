"use client";
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Stethoscope, Video, Phone, AlertCircle } from 'lucide-react';

const AppointmentModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  appointment = null, 
  userType = 'patient',
  doctors = [],
  patients = []
}) => {
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    mode: 'in-person',
    doctorName: '',
    patientName: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (appointment) {
      setFormData({
        appointmentDate: appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
        appointmentTime: appointment.appointmentTime || '',
        reason: appointment.reason || '',
        mode: appointment.mode || 'in-person',
        doctorName: appointment.doctorName || '',
        patientName: appointment.patientName || '',
        notes: appointment.notes || ''
      });
    } else {
      setFormData({
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        mode: 'in-person',
        doctorName: '',
        patientName: '',
        notes: ''
      });
    }
    setErrors({});
  }, [appointment, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Date is required';
    if (!formData.appointmentTime) newErrors.appointmentTime = 'Time is required';
    if (!formData.reason) newErrors.reason = 'Reason is required';
    
    if (userType === 'patient' && !formData.doctorName) {
      newErrors.doctorName = 'Please select a doctor';
    }
    
    if (userType === 'doctor' && !formData.patientName) {
      newErrors.patientName = 'Please select a patient';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {appointment ? 'Edit Appointment' : 'New Appointment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.appointmentDate ? 'border-red-500' : 'border-gray-600'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.appointmentDate && (
                <p className="text-red-400 text-sm mt-1">{errors.appointmentDate}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Time
              </label>
              <input
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => handleInputChange('appointmentTime', e.target.value)}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.appointmentTime ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.appointmentTime && (
                <p className="text-red-400 text-sm mt-1">{errors.appointmentTime}</p>
              )}
            </div>
          </div>

          {/* Doctor/Patient Selection */}
          {userType === 'patient' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Stethoscope className="w-4 h-4 inline mr-2" />
                Select Doctor
              </label>
              <select
                value={formData.doctorName}
                onChange={(e) => handleInputChange('doctorName', e.target.value)}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.doctorName ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Choose a doctor...</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.name}>
                    {doctor.name} - {doctor.specialty}
                  </option>
                ))}
              </select>
              {errors.doctorName && (
                <p className="text-red-400 text-sm mt-1">{errors.doctorName}</p>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Select Patient
              </label>
              <select
                value={formData.patientName}
                onChange={(e) => handleInputChange('patientName', e.target.value)}
                className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.patientName ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Choose a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.name}>
                    {patient.name} - {patient.condition}
                  </option>
                ))}
              </select>
              {errors.patientName && (
                <p className="text-red-400 text-sm mt-1">{errors.patientName}</p>
              )}
            </div>
          )}

          {/* Appointment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Appointment Mode
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value="in-person"
                  checked={formData.mode === 'in-person'}
                  onChange={(e) => handleInputChange('mode', e.target.value)}
                  className="mr-2"
                />
                <Stethoscope className="w-4 h-4 mr-1 text-green-400" />
                <span className="text-white">In-Person</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="mode"
                  value="video"
                  checked={formData.mode === 'video'}
                  onChange={(e) => handleInputChange('mode', e.target.value)}
                  className="mr-2"
                />
                <Video className="w-4 h-4 mr-1 text-purple-400" />
                <span className="text-white">Video Call</span>
              </label>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason for Visit
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange('reason', e.target.value)}
              rows={3}
              className={`w-full bg-gray-700 border rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reason ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="Describe the reason for the appointment..."
            />
            {errors.reason && (
              <p className="text-red-400 text-sm mt-1">{errors.reason}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional notes..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : (appointment ? 'Update' : 'Schedule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal; 