'use client';

import React, { useEffect, useState } from 'react';
import UnifiedDashboard from '@/components/UnifiedDashbaord';
import { getCurrentUser, isAuthenticated, getCachedUser } from '@/utils/api';
import { initializeSocket, disconnectSocket } from '@/lib/socket';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Dashboard: Starting user load');
        
        // 🐛 DEBUG: Check what isAuthenticated() is actually checking
        console.log('🔍 DEBUG - localStorage:', localStorage.getItem('sessionToken'));
        console.log('🔍 DEBUG - cookies:', document.cookie);
        console.log('🔍 DEBUG - isAuthenticated result:', isAuthenticated());
        
        // ✅ TEMPORARILY COMMENT OUT the immediate redirect to debug
        const authCheck = isAuthenticated();
        if (!authCheck) {
          console.log('❌ No authentication data found');
          // TEMP: Don't redirect immediately, let's see what getCurrentUser() returns
          console.log('🔍 DEBUG - Continuing to check server anyway...');
        }
        
        // ✅ First, use cached data for instant loading
        const cachedUser = getCachedUser();
        if (cachedUser) {
          console.log('⚡ Using cached user data for instant load');
          setUser(cachedUser);
          setLoading(false);
        }
        
        // ✅ Then validate with server in background
        try {
          console.log('🔍 DEBUG - Calling getCurrentUser()...');
          const currentUser = await getCurrentUser();
          console.log('🔍 DEBUG - getCurrentUser result:', currentUser);
          
          if (!currentUser) {
            console.log('❌ Server validation failed - redirecting to login');
            router.push('/login');
            return;
          }
          
          // Update with fresh data from server
          setUser(currentUser);
          
          // Initialize socket connection after user is confirmed
          try {
            const socket = initializeSocket(currentUser.id);
            console.log('🔌 Socket initialized for user:', currentUser.id);
          } catch (socketError) {
            console.warn('⚠️ Socket initialization failed:', socketError);
            // Don't block dashboard loading for socket issues
          }
          
          console.log('✅ User authenticated successfully:', currentUser.email);
          
        } catch (serverError) {
          console.error('❌ Server validation error:', serverError);
          
          // If we have cached data but server fails, show cached data with warning
          if (cachedUser) {
            console.log('⚠️ Using cached data despite server error');
            setError('Limited connectivity - some features may not work');
          } else {
            // No cached data and server fails - redirect to login
            console.log('❌ No cached data and server error - redirecting to login');
            router.push('/login');
            return;
          }
        }
        
      } catch (err) {
        console.error('💥 Dashboard load error:', err);
        setError(err.message || 'Failed to load dashboard');
        
        // For auth errors, redirect to login
        if (err.message === 'Authentication required') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Cleanup socket on unmount
    return () => {
      try {
        disconnectSocket();
        console.log('🔌 Socket disconnected on unmount');
      } catch (error) {
        console.warn('Socket disconnect error:', error);
      }
    };
  }, [router]);

  // ✅ Improved loading state
  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Authenticating user session</p>
        </div>
      </div>
    );
  }

  // ✅ Improved error state with retry
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => router.push('/login')} 
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Show dashboard with optional connectivity warning
  if (user) {
    return (
      <div>
        {/* Show connectivity warning if there's an error but we have cached data */}
        {error && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm">⚠️ {error}</p>
              </div>
            </div>
          </div>
        )}
        
        <UnifiedDashboard user={user} />
      </div>
    );
  }

  // Fallback - should not reach here
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">🔍 DEBUG: No user data available</p>
        <button 
          onClick={() => router.push('/login')} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;