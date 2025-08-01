// models/patient.js
import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  age: Number,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: { type: String, enum: ['active', 'resolved', 'chronic'], default: 'active' },
    notes: String
  }],
  currentConditions: [String],
  allergies: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: String
  }],
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  lastVisit: Date,
  nextAppointment: Date,
  status: { 
    type: String, 
    enum: ['stable', 'critical', 'improving', 'monitoring'], 
    default: 'stable' 
  },
  notes: String
}, {
  timestamps: true
});

// Index for faster queries
PatientSchema.index({ doctorId: 1 });
PatientSchema.index({ userId: 1 });
PatientSchema.index({ email: 1 });

export default mongoose.models.Patient || mongoose.model('Patient', PatientSchema);