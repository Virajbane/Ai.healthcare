// app/UserDashboard/page.js
"use client";

import React from 'react';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import HealthcareDashboard from '@/components/Healthcar';
import Header from '@/components/Header';

export default function UserDashboard() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return <>
  <Header/>
  <HealthcareDashboard />
  </>;
}