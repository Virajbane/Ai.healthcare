// models/LabReport.js
const mongoose = require('mongoose');

const LabReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportId: {
    type: String,
    unique: true,
    required: true
  },
  testDate: {
    type: Date,
    required: true
  },
  reportDate: {
    type: Date,
    default: Date.now
  },
  laboratory: {
    name: String,
    address: String,
    phone: String,
    email: String,
    license: String
  },
  testType: {
    type: String,
    required: true,
    enum: [
      'Complete Blood Count',
      'Basic Metabolic Panel',
      'Lipid Panel',
      'Liver Function Test',
      'Kidney Function Test',
      'Thyroid Function Test',
      'Diabetes Panel',
      'Cardiac Markers',
      'Urinalysis',
      'Stool Analysis',
      'Cultures',
      'Imaging',
      'Biopsy',
      'Other'
    ]
  },
  category: {
    type: String,
    enum: ['Hematology', 'Chemistry', 'Microbiology', 'Immunology', 'Pathology', 'Radiology'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'reviewed', 'abnormal'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  results: [{
    testName: { type: String, required: true },
    value: mongoose.Schema.Types.Mixed, // Can be number, string, or object
    unit: String,
    referenceRange: {
      min: mongoose.Schema.Types.Mixed,
      max: mongoose.Schema.Types.Mixed,
      text: String // For non-numeric ranges like "Negative", "Present/Absent"
    },
    flag: {
      type: String,
      enum: ['Normal', 'High', 'Low', 'Critical High', 'Critical Low', 'Abnormal', 'Positive', 'Negative'],
      default: 'Normal'
    },
    notes: String
  }],
  summary: {
    overallStatus: {
      type: String,
      enum: ['Normal', 'Abnormal', 'Critical', 'Requires Follow-up'],
      default: 'Normal'
    },
    keyFindings: [String],
    recommendations: [String]
  },
  interpretation: {
    findings: String,
    clinicalSignificance: String,
    recommendations: String,
    followUpRequired: Boolean,
    followUpDate: Date
  },
  technician: {
    name: String,
    id: String,
    signature: String
  },
  pathologist: {
    name: String,
    id: String,
    signature: String,
    reviewDate: Date
  },
  attachments: [{
    filename: String,
    url: String,
    type: { type: String, enum: ['image', 'pdf', 'document'] },
    uploadDate: { type: Date, default: Date.now }
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: String,
    comment: String,
    timestamp: { type: Date, default: Date.now }
  }],
  reviewed: {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date,
    comments: String
  },
  shared: [{
    sharedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedDate: { type: Date, default: Date.now },
    permissions: {
      type: String,
      enum: ['view', 'comment', 'full'],
      default: 'view'
    }
  }]
}, {
  timestamps: true
});

// Indexes
LabReportSchema.index({ patientId: 1, testDate: -1 });
LabReportSchema.index({ doctorId: 1 });
LabReportSchema.index({ reportId: 1 });
LabReportSchema.index({ status: 1 });
LabReportSchema.index({ testType: 1 });
LabReportSchema.index({ category: 1 });

// Generate unique report ID
LabReportSchema.pre('save', async function(next) {
  if (!this.reportId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Find the count of reports for today
    const todayStart = new Date(year, date.getMonth(), date.getDate());
    const todayEnd = new Date(year, date.getMonth(), date.getDate() + 1);
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    this.reportId = `LAB${year}${month}${day}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.models.LabReport || mongoose.model('LabReport', LabReportSchema);