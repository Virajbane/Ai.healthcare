"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ChatbotInterface from "@/components/chatbot";

export default function AIChatbotPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => router.push('/UserDashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm text-white rounded-lg hover:bg-gray-700/80 transition-all duration-300 border border-gray-600/30"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
      
      <ChatbotInterface />
    </div>
  );
} 