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
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      console.log('Auth check - Token:', !!token);
      console.log('Auth check - User:', !!storedUser);

      if (token && storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsSignedIn(true);
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
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsSignedIn(true);
      console.log('User logged in successfully');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsSignedIn(false);
      router.push('/login');
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