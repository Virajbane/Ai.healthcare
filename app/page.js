// app/page.js (Your root home page)
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomePage from '@/components/Home'; // Your existing home page component
import Header from '@/components/Header';

export default function RootPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      console.log("Checking authentication on root page...");
      
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        console.log("User is authenticated, redirecting to dashboard...");
        setIsAuthenticated(true);
        router.replace('/UserDashboard');
      } else {
        console.log("User is not authenticated, staying on home page");
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    // Small delay to ensure localStorage is available
    setTimeout(checkAuthAndRedirect, 100);
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
  return 
  <>
  <Header/>
  <HomePage />
  </>;
}