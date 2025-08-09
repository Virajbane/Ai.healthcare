// models/Medication.js
const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prescribedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true
  },
  genericName: String,
  dosage: {
    type: String,
    required: true
  },
  unit: {
    type: String,
    enum: ['mg', 'g', 'ml', 'tablets', 'capsules', 'drops', 'units'],
    default: 'mg'
  },
  frequency: {
    type: String,
    required: true
  },
  route: {
    type: String,
    enum: ['oral', 'topical', 'injection', 'inhalation', 'sublingual'],
    default: 'oral'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,
  duration: String, // "7 days", "2 weeks", etc.
  instructions: String,
  sideEffects: [String],
  contraindications: [String],
  interactions: [String],
  refillsRemaining: {
    type: Number,
    default: 0
  },
  totalRefills: {
    type: Number,
    default: 0
  },
  pharmacy: {
    name: String,
    address: String,
    phone: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'discontinued', 'paused'],
    default: 'active'
  },
  adherence: [{
    date: Date,
    taken: Boolean,
    time: String,
    notes: String
  }],
  reminders: [{
    time: String, // "08:00", "14:00", etc.
    enabled: {
      type: Boolean,
      default: true
    }
  }],
  notes: String
}, {
  timestamps: true
});

// Indexes
MedicationSchema.index({ userId: 1 });
MedicationSchema.index({ prescribedBy: 1 });
MedicationSchema.index({ status: 1 });
MedicationSchema.index({ startDate: 1 });

module.exports = mongoose.models.Medication || mongoose.model('Medication', MedicationSchema);