// hooks/useCustomAuth.js
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
        const sessionToken = localStorage.getItem('sessionToken');
        
        if (sessionToken) {
          // Validate session with database
          const response = await fetch('/api/auth/validate-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionToken })
          });

          if (response.ok) {
            const sessionData = await response.json();
            setUser(sessionData.user);
            setIsSignedIn(true);
          } else {
            // Invalid session, clear data
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsSignedIn(false);
          }
        } else {
          setUser(null);
          setIsSignedIn(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
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
      const sessionToken = localStorage.getItem('sessionToken');
      
      if (sessionToken) {
        // Call logout API
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionToken })
        });
      }
      
      // Clear local storage
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      
      // Update state
      setUser(null);
      setIsSignedIn(false);
      
      // Redirect to home
      router.push('/');
      
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if API fails
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsSignedIn(false);
      router.push('/');
    }
  };

  const refreshAuth = async () => {
    const sessionToken = localStorage.getItem('sessionToken');
    
    if (sessionToken) {
      try {
        const response = await fetch('/api/auth/validate-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionToken })
        });

        if (response.ok) {
          const sessionData = await response.json();
          setUser(sessionData.user);
          setIsSignedIn(true);
          return sessionData.user;
        } else {
          localStorage.removeItem('sessionToken');
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