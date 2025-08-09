const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);


// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Mock Database (Replace with MongoDB later)
const mockUsers = {
  '1': { 
    id: '1', 
    name: 'John Doe', 
    email: 'john@example.com', 
    role: 'doctor',
    phone: '+1234567890',
    address: '123 Main St'
  },
  '2': { 
    id: '2', 
    name: 'Dr. Smith', 
    email: 'dr.smith@example.com', 
    role: 'doctor',
    specialty: 'Cardiology',
    phone: '+1987654321'
  }
};

const mockHealthMetrics = {};
const mockMedications = {};
const mockAppointments = [];
const mockLabReports = [];
const mockNotifications = {};

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });
  
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Authentication Routes
app.get('/api/auth/current-user', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    let userId = '1'; // Default user for testing
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // Extract user ID from mock token
      userId = token.replace('mock-token-', '') || '1';
    }
    
    const user = mockUsers[userId];
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    console.log(`Current user requested: ${user.name}`);
    res.json(user);
  } catch (error) {
    console.error('getCurrentUser error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Login attempt for: ${email}`);
    
    const user = Object.values(mockUsers).find(u => u.email === email);
    
    if (user && password === 'password') { // Mock password
      const token = `mock-token-${user.id}`;
      
      res.json({ 
        success: true,
        user, 
        token,
        message: 'Login successful'
      });
      
      console.log(`Login successful for: ${user.name}`);
    } else {
      res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Please check your email and password'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
});

// Health Metrics Routes
app.get('/api/health-metrics', (req, res) => {
  const { userId } = req.query;
  
  const metrics = mockHealthMetrics[userId] || {
    heartRate: Math.floor(Math.random() * 40) + 60, // 60-100
    bloodPressure: '120/80',
    temperature: (Math.random() * 2 + 97).toFixed(1), // 97-99°F
    weight: Math.floor(Math.random() * 50) + 50, // 50-100 kg
    height: Math.floor(Math.random() * 30) + 150, // 150-180 cm
    lastUpdated: new Date().toISOString()
  };
  
  res.json(metrics);
});

app.put('/api/health-metrics', (req, res) => {
  const { userId, metrics } = req.body;
  
  mockHealthMetrics[userId] = { 
    ...mockHealthMetrics[userId], 
    ...metrics,
    lastUpdated: new Date().toISOString()
  };
  
  // Emit real-time update
  io.to(`user_${userId}`).emit('health_metrics_updated', mockHealthMetrics[userId]);
  
  res.json(mockHealthMetrics[userId]);
});

// Medications Routes
app.get('/api/medications', (req, res) => {
  const { userId } = req.query;
  
  const medications = mockMedications[userId] || [
    {
      id: '1',
      name: 'Aspirin',
      dosage: '100mg',
      frequency: 'Once daily',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      instructions: 'Take with food',
      userId
    },
    {
      id: '2',
      name: 'Vitamin D',
      dosage: '1000IU',
      frequency: 'Once daily',
      startDate: '2024-01-01',
      instructions: 'Take in the morning',
      userId
    }
  ];
  
  res.json(medications);
});

app.post('/api/medications', (req, res) => {
  const medication = { 
    id: Date.now().toString(), 
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  const userId = req.body.userId;
  if (!mockMedications[userId]) mockMedications[userId] = [];
  mockMedications[userId].push(medication);
  
  // Emit real-time update
  io.to(`user_${userId}`).emit('medication_added', medication);
  
  res.json(medication);
});

app.put('/api/medications/:id', (req, res) => {
  const { id } = req.params;
  const userId = req.body.userId;
  
  if (mockMedications[userId]) {
    const index = mockMedications[userId].findIndex(m => m.id === id);
    if (index !== -1) {
      mockMedications[userId][index] = { 
        ...mockMedications[userId][index], 
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      
      // Emit real-time update
      io.to(`user_${userId}`).emit('medication_updated', mockMedications[userId][index]);
      
      res.json(mockMedications[userId][index]);
      return;
    }
  }
  
  res.status(404).json({ error: 'Medication not found' });
});

app.delete('/api/medications/:id', (req, res) => {
  const { id } = req.params;
  
  for (const userId in mockMedications) {
    const index = mockMedications[userId].findIndex(m => m.id === id);
    if (index !== -1) {
      const deleted = mockMedications[userId].splice(index, 1)[0];
      
      // Emit real-time update
      io.to(`user_${userId}`).emit('medication_deleted', { id });
      
      res.json({ message: 'Medication deleted', deleted });
      return;
    }
  }
  
  res.status(404).json({ error: 'Medication not found' });
});

// Appointments Routes
app.get('/api/appointments', (req, res) => {
  const { userId, role } = req.query;
  
  let appointments = mockAppointments;
  
  if (role === 'patient') {
    appointments = mockAppointments.filter(apt => apt.patientId === userId);
  } else if (role === 'doctor') {
    appointments = mockAppointments.filter(apt => apt.doctorId === userId);
  }
  
  res.json(appointments);
});

app.get('/api/appointments/upcoming', (req, res) => {
  const { userId, role, limit = 5 } = req.query;
  
  let appointments = mockAppointments;
  
  if (role === 'patient') {
    appointments = mockAppointments.filter(apt => apt.patientId === userId);
  } else if (role === 'doctor') {
    appointments = mockAppointments.filter(apt => apt.doctorId === userId);
  }
  
  const upcoming = appointments
    .filter(apt => new Date(apt.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, parseInt(limit));
    
  res.json(upcoming);
});

app.get('/api/appointments/pending', (req, res) => {
  const { userId } = req.query;
  
  const pending = mockAppointments.filter(apt => 
    apt.doctorId === userId && apt.status === 'pending'
  );
  
  res.json(pending);
});

app.post('/api/appointments', (req, res) => {
  const appointment = {
    id: Date.now().toString(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  mockAppointments.push(appointment);
  
  // Emit to doctor
  if (appointment.doctorId) {
    io.to(`user_${appointment.doctorId}`).emit('new_appointment', appointment);
  }
  
  res.json(appointment);
});

app.put('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const index = mockAppointments.findIndex(apt => apt.id === id);
  
  if (index !== -1) {
    mockAppointments[index] = { 
      ...mockAppointments[index], 
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const updated = mockAppointments[index];
    
    // Emit to both patient and doctor
    io.to(`user_${updated.patientId}`).emit('appointment_updated', updated);
    io.to(`user_${updated.doctorId}`).emit('appointment_updated', updated);
    
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

app.put('/api/appointments/:id/approve', (req, res) => {
  const { id } = req.params;
  const { doctorId } = req.body;
  
  const index = mockAppointments.findIndex(apt => apt.id === id);
  
  if (index !== -1) {
    mockAppointments[index].status = 'confirmed';
    mockAppointments[index].approvedBy = doctorId;
    mockAppointments[index].approvedAt = new Date().toISOString();
    
    const approved = mockAppointments[index];
    
    // Emit to patient
    io.to(`user_${approved.patientId}`).emit('appointment_approved', approved);
    
    res.json(approved);
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

app.put('/api/appointments/:id/reject', (req, res) => {
  const { id } = req.params;
  const { doctorId, reason } = req.body;
  
  const index = mockAppointments.findIndex(apt => apt.id === id);
  
  if (index !== -1) {
    mockAppointments[index].status = 'cancelled';
    mockAppointments[index].rejectedBy = doctorId;
    mockAppointments[index].rejectionReason = reason;
    mockAppointments[index].rejectedAt = new Date().toISOString();
    
    const rejected = mockAppointments[index];
    
    // Emit to patient
    io.to(`user_${rejected.patientId}`).emit('appointment_rejected', rejected);
    
    res.json(rejected);
  } else {
    res.status(404).json({ error: 'Appointment not found' });
  }
});

// Lab Reports Routes
app.get('/api/lab-reports', (req, res) => {
  const { userId, doctorId } = req.query;
  
  let reports = mockLabReports;
  
  if (doctorId) {
    reports = mockLabReports.filter(report => report.doctorId === doctorId);
  } else if (userId) {
    reports = mockLabReports.filter(report => report.patientId === userId);
  }
  
  res.json(reports);
});

app.post('/api/lab-reports', (req, res) => {
  const report = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  mockLabReports.push(report);
  
  // Emit to patient and doctor
  io.to(`user_${report.patientId}`).emit('new_lab_report', report);
  if (report.doctorId) {
    io.to(`user_${report.doctorId}`).emit('new_lab_report', report);
  }
  
  res.json(report);
});

// Patients Routes
app.get('/api/patients', (req, res) => {
  const { doctorId } = req.query;
  
  const patients = Object.values(mockUsers).filter(user => 
    user.role === 'patient'
  );
  
  res.json(patients);
});

app.get('/api/patients/:id', (req, res) => {
  const { id } = req.params;
  const patient = mockUsers[id];
  
  if (patient && patient.role === 'patient') {
    res.json(patient);
  } else {
    res.status(404).json({ error: 'Patient not found' });
  }
});

// Notifications Routes
app.get('/api/notifications', (req, res) => {
  const { userId } = req.query;
  
  const notifications = mockNotifications[userId] || [
    {
      id: '1',
      title: 'Welcome to AI Healthcare!',
      message: 'Your health journey starts here. Track your medications, appointments, and health metrics.',
      type: 'info',
      read: false,
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json(notifications);
});

app.put('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  
  // Mark notification as read in all users
  for (const userId in mockNotifications) {
    const notification = mockNotifications[userId].find(n => n.id === id);
    if (notification) {
      notification.read = true;
      res.json({ message: 'Notification marked as read' });
      return;
    }
  }
  
  res.status(404).json({ error: 'Notification not found' });
});

app.post('/api/notifications', (req, res) => {
  const notification = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    read: false
  };
  
  const userId = req.body.userId;
  if (!mockNotifications[userId]) mockNotifications[userId] = [];
  mockNotifications[userId].push(notification);
  
  // Emit socket notification
  io.to(`user_${userId}`).emit('notification', notification);
  
  res.json(notification);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🔌 Socket.IO server ready`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;