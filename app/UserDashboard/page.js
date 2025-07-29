"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import HealthcareDashboard from '@/components/Healthcar';
import Header from '@/components/Header';

export default function UserDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
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
      }
      
      setIsLoading(false);
    };

    // Small delay to ensure localStorage is available and prevent hydration issues
    const timeoutId = setTimeout(checkAuth, 100);
    
    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  // Show redirecting message while authentication is being processed
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Redirecting...</span>
        </div>
      </div>
    );
  }

  // Render the authenticated dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Header />
      <div className="pt-20"> {/* Add padding to account for fixed header */}
        <HealthcareDashboard user={user} />
      </div>
    </div>
  );
}