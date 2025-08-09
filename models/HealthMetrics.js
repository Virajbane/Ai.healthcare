// models/HealthMetrics.js
const mongoose = require('mongoose');

const HealthMetricsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  },
  vitals: {
    heartRate: {
      value: Number,
      unit: { type: String, default: 'bpm' },
      timestamp: { type: Date, default: Date.now }
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      unit: { type: String, default: 'mmHg' },
      timestamp: { type: Date, default: Date.now }
    },
    temperature: {
      value: Number,
      unit: { type: String, enum: ['F', 'C'], default: 'F' },
      timestamp: { type: Date, default: Date.now }
    },
    respiratoryRate: {
      value: Number,
      unit: { type: String, default: 'breaths/min' },
      timestamp: { type: Date, default: Date.now }
    },
    oxygenSaturation: {
      value: Number,
      unit: { type: String, default: '%' },
      timestamp: { type: Date, default: Date.now }
    }
  },
  measurements: {
    weight: {
      value: Number,
      unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
      timestamp: { type: Date, default: Date.now }
    },
    height: {
      value: Number,
      unit: { type: String, enum: ['cm', 'inches'], default: 'cm' },
      timestamp: { type: Date, default: Date.now }
    },
    bmi: {
      value: Number,
      category: { type: String, enum: ['underweight', 'normal', 'overweight', 'obese'] },
      timestamp: { type: Date, default: Date.now }
    }
  },
  labValues: {
    bloodSugar: {
      value: Number,
      unit: { type: String, default: 'mg/dL' },
      testType: { type: String, enum: ['fasting', 'random', 'post-meal'], default: 'random' },
      timestamp: { type: Date, default: Date.now }
    },
    cholesterol: {
      total: Number,
      hdl: Number,
      ldl: Number,
      triglycerides: Number,
      unit: { type: String, default: 'mg/dL' },
      timestamp: { type: Date, default: Date.now }
    },
    hemoglobin: {
      value: Number,
      unit: { type: String, default: 'g/dL' },
      timestamp: { type: Date, default: Date.now }
    }
  },
  symptoms: [{
    name: String,
    severity: { type: Number, min: 1, max: 10 },
    duration: String,
    notes: String
  }],
  medications: [{
    name: String,
    dosage: String,
    time: String,
    taken: Boolean
  }],
  lifestyle: {
    sleepHours: Number,
    exerciseMinutes: Number,
    stressLevel: { type: Number, min: 1, max: 10 },
    mood: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] }
  },
  notes: String,
  alerts: [{
    type: { type: String, enum: ['high', 'low', 'critical', 'abnormal'] },
    message: String,
    resolved: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Indexes
HealthMetricsSchema.index({ userId: 1, date: -1 });
HealthMetricsSchema.index({ recordedBy: 1 });
HealthMetricsSchema.index({ 'alerts.resolved': 1 });

// Calculate BMI automatically
HealthMetricsSchema.pre('save', function(next) {
  if (this.measurements.weight && this.measurements.height) {
    const weight = this.measurements.weight.value;
    const height = this.measurements.height.value;
    
    if (weight && height) {
      // Convert height to meters if in cm
      const heightInM = this.measurements.height.unit === 'cm' ? height / 100 : height * 0.0254;
      const weightInKg = this.measurements.weight.unit === 'lbs' ? weight * 0.453592 : weight;
      
      const bmi = weightInKg / (heightInM * heightInM);
      this.measurements.bmi.value = Math.round(bmi * 10) / 10;
      
      // Set BMI category
      if (bmi < 18.5) this.measurements.bmi.category = 'underweight';
      else if (bmi < 25) this.measurements.bmi.category = 'normal';
      else if (bmi < 30) this.measurements.bmi.category = 'overweight';
      else this.measurements.bmi.category = 'obese';
    }
  }
  next();
});

module.exports = mongoose.models.HealthMetrics || mongoose.model('HealthMetrics', HealthMetricsSchema);