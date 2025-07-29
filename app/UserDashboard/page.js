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
      
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log("Token found:", !!token);
      console.log("User data found:", !!userData);
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
          console.log("User authenticated:", parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          // Clear invalid data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/');
        }
      } else {
        console.log("No authentication found, redirecting to login");
        router.push('/');
      }
      setIsLoading(false);
    };

    // Small delay to ensure localStorage is available
    setTimeout(checkAuth, 100);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to login...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <HealthcareDashboard />
    </>
  );
}