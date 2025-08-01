"use client"
import React, { useState, useEffect } from 'react';
import { determineUserType } from '../lib/api';

// Import existing components
import HealthcareDashboard from './Healthcar';
import DoctorDashboard from './DoctorDash';

// Import new unified dashboard
import UnifiedDashboard from './UnifiedDashboard';

const HealthcareWrapper = ({ 
  user, 
  useUnified = false, // Flag to gradually migrate to unified dashboard
  forceDashboardType = null // 'patient', 'doctor', or null for auto-detect
}) => {
  const [detectedUserType, setDetectedUserType] = useState(null);

  useEffect(() => {
    if (user) {
      const userType = forceDashboardType || determineUserType(user);
      setDetectedUserType(userType);
    }
  }, [user, forceDashboardType]);

  // If unified dashboard is enabled, use the new system
  if (useUnified) {
    return (
      <UnifiedDashboard 
        initialUser={user} 
        userType={detectedUserType} 
      />
    );
  }

  // Otherwise, use the existing dashboards
  if (detectedUserType === 'doctor') {
    return <DoctorDashboard user={user} />;
  } else {
    return <HealthcareDashboard user={user} />;
  }
};

export default HealthcareWrapper;