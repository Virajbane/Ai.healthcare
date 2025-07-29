// hooks/useCustomAuth.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useCustomAuth() {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Auth check - Token:', !!token);
      console.log('Auth check - User:', !!storedUser);

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsSignedIn(true);
          console.log('User authenticated:', userData.email);
        } catch (parseError) {
          console.error('Error parsing user data:', parseError);
          // Clear corrupted data
          localStorage.removeItem('token');
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

  const login = (token, userData) => {
    try {
      if (typeof window === 'undefined') {
        console.error('Cannot store auth data on server side');
        return false;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsSignedIn(true);
      console.log('User logged in successfully:', userData.email);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Also clear the cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict';
      }
      setUser(null);
      setIsSignedIn(false);
      router.push('/');
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshAuth = () => {
    checkAuthStatus();
  };

  return {
    user,
    isSignedIn,
    isLoading,
    login,
    logout,
    refreshAuth
  };
}