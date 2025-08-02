"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import HomePage from '@/components/Home';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      console.log("Checking authentication on root page...");

      try {
        const sessionToken =
          typeof window !== 'undefined'
            ? localStorage.getItem('sessionToken')
            : null;

        if (sessionToken) {
          console.log("Session token found, validating with database...");

          const response = await fetch('/api/auth/validate-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionToken }),
          });

          if (response.ok) {
            const sessionData = await response.json();
            console.log("Session validated, user:", sessionData.user);

            setIsAuthenticated(true);
            setUser(sessionData.user);

            // Redirect to unified dashboard
            router.push('/dashboard');
          } else {
            console.log("Session validation failed, clearing local data");
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

    if (typeof window !== 'undefined') {
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

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <Header isAuthenticated={isAuthenticated} user={user} />
      <HomePage />
    </>
  );
}
