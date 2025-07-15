"use client";

import React, { useEffect } from "react";
import { Activity, Brain, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCustomAuth } from "../hooks/useCustomAuth"; // ⬅️ use your hook
import Link from "next/link";

const Header = () => {
  const { user, isSignedIn, logout } = useCustomAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isSignedIn && pathname === "/") {
      router.push("/UserDashboard");
    }
  }, [isSignedIn, router, pathname]);

  const handleLogoClick = () => {
    router.push(isSignedIn ? "/UserDashboard" : "/");
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
              <li onClick={() => router.push("/Userpage")} className="cursor-pointer group">
                <div className="flex flex-col items-center">
                  <Activity className="w-8 h-8 text-teal-500 group-hover:text-teal-700" />
                  <span className="text-xs text-gray-600 group-hover:text-teal-700">Doctors</span>
                </div>
              </li>
              <li onClick={() => router.push("/Userpage?chat=bot")} className="cursor-pointer group">
                <div className="flex flex-col items-center">
                  <Brain className="w-8 h-8 text-blue-500 group-hover:text-blue-700" />
                  <span className="text-xs text-gray-600 group-hover:text-blue-700">AI Diagnosis</span>
                </div>
              </li>
            </ul>

            {!isSignedIn ? (
              <Link href="/signup">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
                  Sign In
                </button>
              </Link>
            ) : (
              <button
                onClick={logout}
                className="flex items-center text-sm text-white bg-red-500 px-4 py-2 rounded-full hover:bg-red-600 transition"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Header;
