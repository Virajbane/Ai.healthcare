


const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: ['.env', '.env.local'] });

// Import models
const User = require('./models/user');
const Appointment = require('./models/Appointment'); // You'll need to create this
const HealthMetrics = require('./models/HealthMetrics'); // You'll need to create this
const Medication = require('./models/Medication'); // You'll need to create this
const LabReport = require('./models/LabReport'); // You'll need to create this
const Notification = require('./models/Notification'); // You'll need to create this

const app = express();
const server = http.createServer(app);

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🍃 MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

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

// JWT Middleware for protected routes
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

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
app.get('/api/auth/current-user', authenticateToken, async (req, res) => {
  try {
    // User is already attached by authenticateToken middleware
    const user = req.user;
    
    console.log(`Current user requested: ${user.fullName} (${user.role})`);
    
    // Return user without sensitive information
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      ...(user.role === 'doctor' && user.doctorInfo && { doctorInfo: user.doctorInfo }),
      ...(user.role === 'patient' && user.patientInfo && { patientInfo: user.patientInfo }),
      preferences: user.preferences,
      lastLogin: user.lastLogin
    };
    
    res.json(userResponse);
  } catch (error) {
    console.error('getCurrentUser error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Login attempt for: ${email}`);
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Please check your email and password'
      });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        error: 'Account locked',
        message: 'Account is temporarily locked due to too many failed login attempts'
      });
    }
    
    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ 
        error: 'Account inactive',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Please check your email and password'
      });
    }
    
    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }
    
    // Update last login
    await User.findByIdAndUpdate(user._id, { 
      lastLogin: new Date() 
    });
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Prepare user response (without sensitive data)
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      address: user.address,
      profilePicture: user.profilePicture,
      isVerified: user.isVerified,
      ...(user.role === 'doctor' && user.doctorInfo && { doctorInfo: user.doctorInfo }),
      ...(user.role === 'patient' && user.patientInfo && { patientInfo: user.patientInfo }),
      preferences: user.preferences,
      lastLogin: new Date()
    };
    
    res.json({ 
      success: true,
      user: userResponse, 
      token,
      message: 'Login successful'
    });
    
    console.log(`✅ Login successful for: ${user.fullName} (${user.role})`);
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/logout', authenticateToken, async (req, res) => {
  try {
    // You could implement token blacklisting here if needed
    res.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Registration Route (for creating test users)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, ...otherData } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }
    
    // Create new user
    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role,
      ...otherData
    };
    
    const user = new User(userData);
    await user.save();
    
    console.log(`✅ New ${role} registered: ${firstName} ${lastName}`);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health Metrics Routes
app.get('/api/health-metrics', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Try to find existing metrics, or create default ones
    let metrics = await HealthMetrics.findOne({ userId }).sort({ createdAt: -1 });
    
    if (!metrics) {
      // Create default metrics for demonstration
      metrics = {
        heartRate: Math.floor(Math.random() * 40) + 60,
        bloodPressure: '120/80',
        temperature: (Math.random() * 2 + 97).toFixed(1),
        weight: Math.floor(Math.random() * 50) + 50,
        height: Math.floor(Math.random() * 30) + 150,
        lastUpdated: new Date().toISOString()
      };
    }
    
    res.json(metrics);
  } catch (error) {
    console.error('Health metrics fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Patients Routes (for doctors to view their patients)
app.get('/api/patients', authenticateToken, async (req, res) => {
  try {
    // Only doctors can access this route
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }
    
    const patients = await User.find({ 
      role: 'patient',
      isActive: true 
    }).select('-password -verificationToken -passwordResetToken');
    
    res.json(patients);
  } catch (error) {
    console.error('Patients fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/patients/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Only doctors can access patient details
    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }
    
    const patient = await User.findOne({ 
      _id: id, 
      role: 'patient' 
    }).select('-password -verificationToken -passwordResetToken');
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Patient fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Doctors Routes (for patients to find doctors)
app.get('/api/doctors', authenticateToken, async (req, res) => {
  try {
    const { specialty, search } = req.query;
    
    let query = { 
      role: 'doctor',
      isActive: true 
    };
    
    if (specialty) {
      query['doctorInfo.specialty'] = specialty;
    }
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { 'doctorInfo.specialty': { $regex: search, $options: 'i' } }
      ];
    }
    
    const doctors = await User.find(query)
      .select('-password -verificationToken -passwordResetToken')
      .sort({ 'doctorInfo.rating.average': -1 });
    
    res.json(doctors);
  } catch (error) {
    console.error('Doctors fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notifications Routes
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // If you have Notification model, use it. Otherwise, create default notification
    let notifications;
    
    try {
      notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    } catch (modelError) {
      // If Notification model doesn't exist, return default
      notifications = [
        {
          id: '1',
          title: 'Welcome to AI Healthcare!',
          message: `Welcome ${req.user.fullName}! Your health journey starts here. Track your medications, appointments, and health metrics.`,
          type: 'info',
          read: false,
          createdAt: new Date().toISOString()
        }
      ];
    }
    
    res.json(notifications);
  } catch (error) {
    console.error('Notifications fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Test route to create sample users (remove in production)
app.post('/api/auth/create-test-users', async (req, res) => {
  try {
    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      return res.json({ message: 'Test users already exist' });
    }
    
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'patient',
        phone: '+1234567890',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        address: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        patientInfo: {
          emergencyContact: {
            name: 'Jane Doe',
            relationship: 'Wife',
            phone: '+1234567899',
            email: 'jane@example.com'
          },
          bloodType: 'O+',
          allergies: ['Penicillin'],
          chronicConditions: []
        },
        isActive: true,
        isVerified: true
      },
      {
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        email: 'dr.smith@example.com',
        password: 'password123',
        role: 'doctor',
        phone: '+1987654321',
        gender: 'female',
        address: {
          street: '456 Medical Center Dr',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400002',
          country: 'India'
        },
        doctorInfo: {
          specialty: 'Cardiology',
          licenseNumber: 'MH12345',
          experience: 10,
          qualification: ['MBBS', 'MD - Cardiology'],
          hospital: 'City General Hospital',
          department: 'Cardiology',
          consultationFee: 1000,
          availableHours: {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '09:00', end: '13:00', available: true },
            sunday: { start: '', end: '', available: false }
          },
          rating: {
            average: 4.5,
            count: 25
          },
          bio: 'Experienced cardiologist with 10+ years of practice.'
        },
        isActive: true,
        isVerified: true
      },
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        password: 'password123',
        role: 'patient',
        phone: '+1555123456',
        dateOfBirth: new Date('1985-08-22'),
        gender: 'female',
        address: {
          street: '789 Oak Avenue',
          city: 'Pune',
          state: 'Maharashtra',
          zipCode: '411001',
          country: 'India'
        },
        patientInfo: {
          emergencyContact: {
            name: 'Bob Johnson',
            relationship: 'Husband',
            phone: '+1555123457',
            email: 'bob@example.com'
          },
          bloodType: 'A+',
          allergies: [],
          chronicConditions: ['Hypertension']
        },
        isActive: true,
        isVerified: true
      }
    ];
    
    // Create users
    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created test user: ${userData.firstName} ${userData.lastName} (${userData.role})`);
    }
    
    res.json({ 
      success: true,
      message: 'Test users created successfully',
      users: testUsers.map(u => ({ 
        email: u.email, 
        role: u.role, 
        name: `${u.firstName} ${u.lastName}` 
      }))
    });
    
  } catch (error) {
    console.error('Create test users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  console.log(`🧪 Create test users: POST http://localhost:${PORT}/api/auth/create-test-users`);
});

module.exports = app;