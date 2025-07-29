"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import HomePage from '@/components/Home';

// Mock HomePage component for demonstration


export default function RootPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      console.log("Checking authentication on root page...");
      
      // Check for authentication data
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      
      if (token && user) {
        console.log("User is authenticated, redirecting to dashboard...");
        setIsAuthenticated(true);
        router.push('/UserDashboard');
      } else {
        console.log("User is not authenticated, staying on home page");
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    // Ensure we're on the client side and localStorage is available
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
      <Header/>
      <HomePage/>
    </>
  );
}