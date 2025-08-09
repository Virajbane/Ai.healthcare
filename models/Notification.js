// models/Notification.js
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'appointment', 'medication', 'lab-result', 'reminder'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  action: {
    type: String, // 'view_appointment', 'take_medication', etc.
    data: mongoose.Schema.Types.Mixed // Additional data for the action
  },
  relatedEntity: {
    type: {
      type: String,
      enum: ['Appointment', 'Medication', 'LabReport', 'User']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  scheduled: {
    sendAt: Date,
    sent: { type: Boolean, default: false },
    sentAt: Date
  },
  channels: [{
    type: String,
    enum: ['app', 'email', 'sms', 'push'],
    delivered: { type: Boolean, default: false },
    deliveredAt: Date,
    error: String
  }],
  metadata: {
    category: String,
    tags: [String],
    source: String,
    campaignId: String
  }
}, {
  timestamps: true
});

// Indexes
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ priority: 1 });
NotificationSchema.index({ 'scheduled.sendAt': 1, 'scheduled.sent': 1 });

module.exports = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);