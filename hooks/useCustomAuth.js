"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useCustomAuth = () => {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        
        if (authToken) {
          // Validate token with backend using JWT
          const response = await fetch('http://localhost:5000/api/auth/current-user', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (response.ok) {
            const userData = await response.json();
            console.log('Auth check successful:', userData);
            
            setUser(userData);
            setIsSignedIn(true);
            
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(userData));
            
          } else {
            console.log('Auth check failed:', response.status);
            // Invalid token, clear data
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsSignedIn(false);
          }
        } else {
          console.log('No auth token found');
          setUser(null);
          setIsSignedIn(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Clear data on error
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsSignedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      
      if (authToken) {
        // Call logout API
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });
      }
      
      // Clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Update state
      setUser(null);
      setIsSignedIn(false);
      
      // Redirect to login
      router.push('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if API fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsSignedIn(false);
      router.push('/login');
    }
  };

  const refreshAuth = async () => {
    const authToken = localStorage.getItem('authToken');
    
    if (authToken) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/current-user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsSignedIn(true);
          localStorage.setItem('user', JSON.stringify(userData));
          return userData;
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setUser(null);
          setIsSignedIn(false);
          return null;
        }
      } catch (error) {
        console.error('Refresh auth error:', error);
        return null;
      }
    }
    return null;
  };

  return {
    user,
    isSignedIn,
    isLoading,
    logout,
    refreshAuth
  };
};