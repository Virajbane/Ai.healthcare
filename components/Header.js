"use client";

import React from "react";
import { Activity, Brain, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Header = ({ isAuthenticated = false, user = null }) => {
  const router = useRouter();

  const handleLogoClick = () => {
    if (isAuthenticated && user) {
      // Redirect based on user role
      if (user.role === 'doctor') {
        router.push("/DoctorDashboard");
      } else {
        router.push("/UserDashboard");
      }
    } else {
      router.push("/");
    }
  };

  const handleLogout = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      
      if (sessionToken) {
        // Call logout API to deactivate session in database
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
      
      // Redirect to home page
      router.push('/');
      
      // Refresh the page to reset auth state
      window.location.reload();
      
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, clear local data and redirect
      localStorage.removeItem('sessionToken');
      localStorage.removeItem('user');
      router.push('/');
      window.location.reload();
    }
  };

  const handleNavigateToUserpage = () => {
    if (isAuthenticated) {
      router.push("/Userpage");
    } else {
      // If not authenticated, redirect to sign up page
      router.push("/signup");
    }
  };

  const handleNavigateToAIChat = () => {
    if (isAuthenticated) {
      router.push("/Userpage?chat=bot");
    } else {
      // If not authenticated, redirect to sign up page
      router.push("/signup");
    }
  };

  return (
    <div className="flex justify-center w-full pb-3 fixed top-0 z-50 px-4 pt-4">
      <header className="w-10/12 border-2 border-slate-500 bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm shadow-md rounded-[50px]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 
            className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
            onClick={handleLogoClick}
          >
            HealthAI
          </h1>

          <nav className="flex items-center space-x-6">
            <ul className="flex items-center space-x-4">
              <li onClick={handleNavigateToUserpage} className="cursor-pointer group">
                <div className="flex flex-col items-center">
                  <Activity className="w-8 h-8 text-teal-500 group-hover:text-teal-700" />
                  <span className="text-xs text-gray-600 group-hover:text-teal-700">Doctors</span>
                </div>
              </li>
              <li onClick={handleNavigateToAIChat} className="cursor-pointer group">
                <div className="flex flex-col items-center">
                  <Brain className="w-8 h-8 text-blue-500 group-hover:text-blue-700" />
                  <span className="text-xs text-gray-600 group-hover:text-blue-700">AI Diagnosis</span>
                </div>
              </li>
            </ul>

            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-full hover:bg-teal-700 transition text-sm">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition text-sm">
                    Sign Up
                  </button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300">
                  Welcome, {user?.firstName || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-sm text-white bg-red-500 px-4 py-2 rounded-full hover:bg-red-600 transition"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Header;