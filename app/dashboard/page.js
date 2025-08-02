'use client';

import React, { useEffect, useState } from 'react';
import UnifiedDashboard from '@/components/UnifiedDashbaord';
import { getCurrentUser } from '@/utils/api';
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
        
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          console.log('No user found, redirecting to login');
          router.push('/login');
          return;
        }
        
        setUser(currentUser);
        
        // Initialize socket connection after user is loaded
        const socket = initializeSocket(currentUser.id);
        
        console.log('User loaded successfully:', currentUser.name);
        
      } catch (err) {
        console.error('Error loading user:', err);
        setError(err.message || 'Failed to load user');
        
        // Only redirect to login if it's an auth error
        if (err.message === 'Authentication required' || err.message === 'Failed to fetch') {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Cleanup socket on unmount
    return () => {
      disconnectSocket();
    };
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the server. Please make sure the backend is running.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return null; // Will redirect to login
  }

  return <UnifiedDashboard user={user} />;
};

export default DashboardPage;