// models/labReport.js
import mongoose from 'mongoose';

const LabReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: String,
  testType: String,
  category: {
    type: String,
    enum: ['blood', 'urine', 'imaging', 'biopsy', 'other'],
    default: 'blood'
  },
  testDate: { type: Date, default: Date.now },
  reportDate: Date,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'reviewed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  results: {
    summary: String,
    details: [{
      parameter: String,
      value: String,
      unit: String,
      referenceRange: String,
      status: { type: String, enum: ['normal', 'high', 'low', 'critical'] }
    }],
    conclusions: String,
    recommendations: String
  },
  attachments: [{
    filename: String,
    fileUrl: String,
    fileType: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String
}, {
  timestamps: true
});

// Index for faster queries
LabReportSchema.index({ doctorId: 1 });
LabReportSchema.index({ patientId: 1 });
LabReportSchema.index({ status: 1 });
LabReportSchema.index({ priority: 1 });
LabReportSchema.index({ testDate: -1 });

export default mongoose.models.LabReport || mongoose.model('LabReport', LabReportSchema);