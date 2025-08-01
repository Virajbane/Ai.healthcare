import React, { useState, useEffect } from 'react';
import UnifiedDashboard from '../components/UnifiedDashboard';
import { authApi } from '../utils/api';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      if (userData) {
        setUser(userData);
        // Determine user type based on userData
        const type = userData.role || (userData.email?.includes('@hospital.') ? 'doctor' : 'patient');
        setUserType(type);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <UnifiedDashboard 
      initialUser={user} 
      userType={userType} 
    />
  );
};

export default DashboardPage;