"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import HomePage from '@/components/Home';

export default function RootPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      console.log("Checking authentication on root page...");
      
      try {
        // Check for session token
        const sessionToken = typeof window !== 'undefined' ? localStorage.getItem('sessionToken') : null;
        
        if (sessionToken) {
          console.log("Session token found, validating with database...");
          
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
            console.log("Session validated, user role:", sessionData.user.role);
            
            setIsAuthenticated(true);
            setUser(sessionData.user);
            
            // Redirect based on user role
            if (sessionData.user.role === 'doctor') {
              router.push('/DoctorDashboard');
            } else {
              router.push('/UserDashboard');
            }
          } else {
            console.log("Session validation failed, clearing local data");
            // Clear invalid session data
            localStorage.removeItem('sessionToken');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          console.log("No session token found, user is not authenticated");
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setIsLoading(false);
    };

    // Ensure we're on the client side
    if (typeof window !== 'undefined') {
      // Small delay to ensure localStorage is available
      setTimeout(checkAuthAndRedirect, 100);
    } else {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If authenticated, show loading while redirecting
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to dashboard...</div>
      </div>
    );
  }

  // If not authenticated, show home page
  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <HomePage />
    </>
  );
}