"use client";

import React, { useEffect } from "react";
import { Activity, Brain } from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import SignIn from "./SignIn";

const Header = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isSignedIn && pathname === "/") {
      // Only redirect to UserDashboard if user is on homepage
      router.push("/UserDashboard");
    }
  }, [isSignedIn, router, pathname]);

  const handleLogoClick = () => {
    if (isSignedIn) {
      router.push("/UserDashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex justify-center w-full pb-3 fixed top-0 z-50 px-4 pt-4">
      <header className="w-10/12 border-2 border-slate-500 bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm shadow-md rounded-[50px]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 
            className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform duration-300 ease-in-out"
            onClick={handleLogoClick}
          >
            HealthAI
          </h1>

          <nav className="flex items-center space-x-6">
            <ul className="flex items-center space-x-4">
              {/* ✅ Doctors Button (redirects to Userpage with chat) */}
              <li
                className="cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out group"
                onClick={() => router.push("/Userpage")}
              >
                <div className="flex flex-col items-center">
                  <Activity className="w-8 h-8 text-teal-500 group-hover:text-teal-700" />
                  <span className="text-xs text-gray-600 group-hover:text-teal-700">
                    Doctors
                  </span>
                </div>
              </li>

              {/* ✅ AI Diagnosis Button (redirects to chatbot only) */}
              <li
                className="cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out group"
                onClick={() => router.push("/Userpage?chat=bot")}
              >
                <div className="flex flex-col items-center">
                  <Brain className="w-8 h-8 text-blue-500 group-hover:text-blue-700" />
                  <span className="text-xs text-gray-600 group-hover:text-blue-700">
                    AI Diagnosis
                  </span>
                </div>
              </li>
            </ul>

            {!isSignedIn && (
              <SignIn forceRedirectUrl="/UserDashboard" />
            )}
            {isSignedIn && <UserButton />}
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Header;