# Integrated Healthcare Dashboard

This repository contains a unified healthcare dashboard that supports both patient and doctor user types with real-time communication and modular component architecture.

## 🏗️ Architecture

### Unified Dashboard Approach
- **Single Entry Point**: `UnifiedDashboard` component automatically detects user type and renders appropriate interface
- **Shared Components**: Common UI elements (sidebar, header, modals) are reused across user types
- **Modular Design**: Each user type has its own dashboard component with smaller, focused sub-components
- **Real-time Updates**: Built-in support for real-time notifications and data synchronization

### Component Structure
```
components/
├── UnifiedDashboard.jsx          # Main dashboard component
├── shared/                       # Shared components
│   ├── Sidebar.jsx              # Navigation sidebar
│   ├── DashboardHeader.jsx      # Header with notifications
│   ├── LoadingSpinner.jsx       # Loading states
│   ├── ErrorDisplay.jsx         # Error handling
│   └── AppointmentModal.jsx     # Appointment management modal
├── patient/                     # Patient-specific components
│   ├── PatientDashboard.jsx     # Patient dashboard container
│   ├── PatientOverview.jsx      # Dashboard overview
│   ├── PatientAppointments.jsx  # Appointment management
│   ├── PatientMedications.jsx   # Medication tracking
│   ├── PatientLabReports.jsx    # Lab report viewing
│   ├── PatientPersonalInfo.jsx  # Personal information
│   ├── PatientSettings.jsx      # Settings and preferences
│   └── AIHealthAssistant.jsx    # AI health assistant
└── doctor/                      # Doctor-specific components
    └── DoctorDashboard.jsx      # Doctor dashboard with core features
```

### API Layer
```
utils/
└── api.js                       # Centralized API utilities
    ├── authApi                  # Authentication
    ├── appointmentApi           # Appointment management
    ├── healthApi                # Health metrics
    ├── medicationApi            # Medication tracking
    ├── labReportApi             # Lab reports
    ├── patientApi               # Patient management
    ├── notificationApi          # Real-time notifications
    └── Utility functions        # Date formatting, status colors, etc.
```

## 🚀 Features

### Patient Features
- **Health Metrics Dashboard**: Real-time health data visualization
- **Appointment Management**: Schedule, view, and manage appointments
- **Medication Tracking**: Monitor medication schedules and adherence
- **Lab Reports**: Upload and view medical test results
- **Personal Health Record**: Comprehensive medical information
- **AI Health Assistant**: Personalized health insights and recommendations
- **Settings & Privacy**: User preferences and data control

### Doctor Features
- **Practice Overview**: Statistics and key metrics
- **Appointment Approvals**: Review and approve patient appointment requests
- **Patient Management**: View and manage patient records
- **Lab Report Review**: Analyze and comment on patient lab results
- **Real-time Notifications**: Instant updates on critical patient status
- **Analytics Dashboard**: Practice performance insights

### Shared Features
- **Real-time Communication**: Instant updates between patients and doctors
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Modern glassmorphism design
- **Accessibility**: Built with accessibility best practices
- **Performance Optimized**: Lazy loading and efficient state management

## 📱 User Type Detection

The system automatically determines user type based on:
1. `user.role` field in user data
2. `user.userType` field
3. Email domain (e.g., `@hospital.com` for doctors)
4. Manual override via props

```javascript
const determineUserType = (userData) => {
  if (userData.role === 'doctor' || userData.userType === 'doctor') {
    return 'doctor';
  }
  if (userData.role === 'patient' || userData.userType === 'patient') {
    return 'patient';
  }
  // Fallback: email domain check
  return userData.email?.includes('@hospital.') ? 'doctor' : 'patient';
};
```

## 🔄 Real-time Communication

### Appointment Flow
1. **Patient** schedules appointment → Status: `pending`
2. **Doctor** receives notification for approval
3. **Doctor** approves/rejects → **Patient** gets real-time update
4. Both users see updated appointment status instantly

### Notification System
- Real-time updates via WebSocket/Server-Sent Events
- Fallback polling mechanism (30-second intervals)
- Unread notification badges
- Type-specific notification handling

```javascript
// Real-time subscription
const unsubscribe = subscribeToUpdates(userId, userType, (notifications) => {
  setNotifications(notifications.notifications || []);
  setUnreadCount(notifications.notifications?.filter(n => !n.read).length || 0);
});
```

## 🛠️ Usage

### Basic Implementation
```javascript
import UnifiedDashboard from '../components/UnifiedDashboard';

// Automatic user type detection
<UnifiedDashboard />

// With specific user data
<UnifiedDashboard 
  initialUser={userData} 
  userType="patient" 
/>
```

### Custom Implementation
```javascript
// For specific user types
import PatientDashboard from '../components/patient/PatientDashboard';
import DoctorDashboard from '../components/doctor/DoctorDashboard';

const MyCustomDashboard = ({ user }) => {
  const userType = determineUserType(user);
  
  return userType === 'doctor' ? (
    <DoctorDashboard user={user} />
  ) : (
    <PatientDashboard user={user} />
  );
};
```

## 🔧 API Integration

### Setup Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### API Endpoints Expected
```
GET    /api/auth/current-user
GET    /api/appointments?userId={id}&role={role}
GET    /api/appointments/upcoming?userId={id}&role={role}&limit={limit}
GET    /api/appointments/pending?userId={id}
POST   /api/appointments
PUT    /api/appointments/{id}
PUT    /api/appointments/{id}/approve
PUT    /api/appointments/{id}/reject
DELETE /api/appointments/{id}

GET    /api/health-metrics?userId={id}
PUT    /api/health-metrics

GET    /api/medications?userId={id}
POST   /api/medications
PUT    /api/medications/{id}
DELETE /api/medications/{id}

GET    /api/lab-reports?userId={id}
GET    /api/lab-reports?doctorId={id}
POST   /api/lab-reports
PUT    /api/lab-reports/{id}

GET    /api/patients?doctorId={id}
GET    /api/patients/{id}
PUT    /api/patients/{id}

GET    /api/notifications?userId={id}
POST   /api/notifications
PUT    /api/notifications/{id}/read
```

## 🎨 Styling

### Design System
- **Color Palette**: Gradient-based with glassmorphism effects
- **Typography**: Clean, modern font hierarchy
- **Animations**: Smooth transitions and micro-interactions
- **Layout**: Responsive grid system with mobile-first approach

### Theme Configuration
```css
/* Primary Colors */
--blue: from-blue-400 to-blue-600
--green: from-green-400 to-green-600
--purple: from-purple-400 to-purple-600
--red: from-red-400 to-red-600

/* Glass Effects */
--glass-bg: bg-white/5 backdrop-blur-lg
--glass-border: border border-white/10
--glass-hover: hover:bg-white/10
```

## 🔒 Security Features

- **Input Validation**: All forms include client-side validation
- **Error Handling**: Graceful error states with retry mechanisms
- **Data Privacy**: Patient data access controls
- **Authentication**: Secure user session management

## 📊 Performance Optimizations

- **Lazy Loading**: Components load only when needed
- **Efficient Re-renders**: Optimized React hooks and state management
- **API Caching**: Smart caching of frequently accessed data
- **Bundle Splitting**: Separate bundles for patient/doctor features

## 🧪 Testing Strategy

### Component Testing
```javascript
// Test user type detection
test('should render patient dashboard for patient user', () => {
  const patientUser = { role: 'patient', email: 'patient@example.com' };
  render(<UnifiedDashboard initialUser={patientUser} />);
  expect(screen.getByText('Health Metrics')).toBeInTheDocument();
});

// Test real-time updates
test('should update appointments in real-time', async () => {
  // Mock WebSocket connection
  // Trigger appointment update
  // Verify UI reflects changes
});
```

## 🚀 Deployment

### Build Process
```bash
npm run build
npm run start
```

### Environment Setup
```bash
# Development
npm run dev

# Production
npm run build && npm run start
```

## 🔄 Migration from Separate Dashboards

### Step 1: Replace Components
```javascript
// Old approach
import HealthcareDashboard from './HealthcareDashboard';
import DoctorDashboard from './DoctorDashboard';

// New approach
import UnifiedDashboard from './components/UnifiedDashboard';
```

### Step 2: Update API Calls
```javascript
// Migrate existing API calls to shared API utilities
import { appointmentApi, healthApi } from './utils/api';
```

### Step 3: Configure Real-time Updates
```javascript
// Add real-time subscription
useEffect(() => {
  const unsubscribe = subscribeToUpdates(userId, userType, handleUpdate);
  return unsubscribe;
}, [userId, userType]);
```

## 🤝 Contributing

### Development Guidelines
1. Follow the modular component structure
2. Use shared utilities from `utils/api.js`
3. Implement proper loading and error states
4. Add proper TypeScript types (if using TypeScript)
5. Test both patient and doctor workflows

### Adding New Features
1. Create feature-specific components in appropriate directories
2. Update the main dashboard components to include new features
3. Add API endpoints to the shared API utilities
4. Implement real-time updates if applicable

## 📝 License

This integrated healthcare dashboard is designed for educational and development purposes. Ensure compliance with healthcare data regulations (HIPAA, GDPR) in production environments.

---

## 🎯 Key Benefits of Integration

1. **Reduced Code Duplication**: Shared components and utilities
2. **Consistent User Experience**: Unified design system across user types
3. **Real-time Communication**: Seamless patient-doctor interactions
4. **Maintainability**: Modular architecture for easy updates
5. **Scalability**: Easy to add new user types or features
6. **Performance**: Optimized loading and rendering strategies

The integrated solution provides a robust foundation for healthcare applications while maintaining flexibility for customization and extension.