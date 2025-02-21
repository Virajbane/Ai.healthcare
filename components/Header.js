"use client";

import React, { useEffect } from "react";
import { Activity, Brain } from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import SignIn from "./SignIn";

const Header = ({ setViewVitals, viewVitals }) => {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push("/Userpage");
    }
  }, [isSignedIn, router]);

  return (
    <div className="flex justify-center w-full pb-3 fixed top-0 z-50 px-4 pt-4">
      <header className="w-10/12 border-2 border-slate-500 bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm shadow-md rounded-[50px]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Company Name */}
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            HealthAI
          </h1>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <ul className="flex items-center space-x-4">
              <li
                className={`cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out group ${
                  viewVitals ? "pointer-events-none opacity-50" : ""
                }`}
                onClick={() => setViewVitals(true)} // Switch to Vitals view
              >
                <div className="flex flex-col items-center">
                  <Activity className="w-8 h-8 text-teal-500 group-hover:text-teal-700" />
                  <span className="text-xs text-gray-600 group-hover:text-teal-700">
                    Vitals
                  </span>
                </div>
              </li>
              <li
                className="cursor-pointer hover:scale-110 transition-transform duration-300 ease-in-out group"
                onClick={() => alert("AI Diagnosis Selected")} // Placeholder for AI Diagnosis
              >
                <div className="flex flex-col items-center">
                  <Brain className="w-8 h-8 text-blue-500 group-hover:text-blue-700" />
                  <span className="text-xs text-gray-600 group-hover:text-blue-700">
                    AI Diagnosis
                  </span>
                </div>
              </li>
            </ul>

            {/* Conditionally render SignIn */}
            {!isSignedIn && <SignIn forceRedirectUrl="/Userpage" />}

            {/* User Menu */}
            {isSignedIn && <UserButton />}
          </nav>
        </div>
      </header>
    </div>
  );
};

export default Header;
