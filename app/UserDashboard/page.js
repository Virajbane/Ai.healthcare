"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Import the wrapper component for gradual migration
import HealthcareWrapper from '@/components/HealthcareWrapper';
import Header from '@/components/Header';

export default function UserDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [useUnifiedDashboard, setUseUnifiedDashboard] = useState(false); // Toggle for new features
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      console.log("Checking authentication...");
      
      // Ensure we're on the client side
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log("Token found:", !!token);
        console.log("User data found:", !!userData);
        
        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsAuthenticated(true);
            console.log("User authenticated:", parsedUser.email, "Role:", parsedUser.role);
            
            // Check if user has opted into new dashboard features
            const unifiedPreference = localStorage.getItem('useUnifiedDashboard');
            if (unifiedPreference === 'true') {
              setUseUnifiedDashboard(true);
            }
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            // Clear corrupted data and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
            router.push('/');
            return;
          }
        } else {
          console.log("No authentication found, redirecting to home");
          setIsAuthenticated(false);
          setUser(null);
          router.push('/');
          return;
        }
      } catch (error) {
        console.error("Authentication check error:", error);
        setIsAuthenticated(false);
        setUser(null);
        router.push('/');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const toggleUnifiedDashboard = () => {
    const newValue = !useUnifiedDashboard;
    setUseUnifiedDashboard(newValue);
    localStorage.setItem('useUnifiedDashboard', newValue.toString());
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

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      {/* Feature Toggle for Enhanced Dashboard */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleUnifiedDashboard}
          className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
        >
          {useUnifiedDashboard ? 'Classic View' : 'Enhanced View'}
        </button>
      </div>

      {/* Dashboard Content */}
      <HealthcareWrapper 
        user={user} 
        useUnified={useUnifiedDashboard}
        forceDashboardType="patient"
      />
    </>
  );
}