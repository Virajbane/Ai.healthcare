"use client";

import React, { useState } from "react";
import ChatbotInterface from "@/components/HealthcareChatbot";
import Header from "@/components/Header";
import VitalsMonitoring from "@/components/Vitals";

function Userpage() {
  const [viewVitals, setViewVitals] = useState(false); // State to toggle views

  return (
    <div className="h-screen flex flex-col">
      {/* Only show the Header if we're not in the Vitals section */}
      {!viewVitals && <Header setViewVitals={setViewVitals} />}

      {/* Main Content */}
      <div className={`flex flex-1 ${viewVitals ? "grid grid-cols-5 gap-4" : ""} p-4`}>
        {/* Left Sidebar - Only visible when Vitals is active */}
        {viewVitals && (
          <div className="col-span-1 bg-gray-900 p-4 rounded-lg shadow-md">
            <ul>
              <li 
                className="cursor-pointer text-lg font-bold hover:text-blue-600"
                onClick={() => setViewVitals(false)} // Back to Chatbot
              >
                🔙 Home (Chatbot)
              </li>
            </ul>
          </div>
        )}

        {/* Right Section - Show either Chatbot or VitalsComponent */}
        <div className={`bg-gray-900 p-4 rounded-lg shadow-md ${viewVitals ? "col-span-4" : "w-full"}`}>
          {viewVitals ? <VitalsMonitoring /> : <ChatbotInterface />}
        </div>
      </div>
    </div>
  );
}

export default Userpage;
