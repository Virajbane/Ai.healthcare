"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/components/Header";
import ChatbotInterface from "@/components/chatbot";
import UserChat from "@/components/Userchat";

export default function UserPage() {
  const searchParams = useSearchParams();
  const showBot = searchParams.get("chat") === "bot";
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = user.publicMetadata?.role;

    // 🚀 Redirect doctor to /doctor
    if (role === "doctor") {
      router.replace("/Doctor");
    }
  }, [user, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="pt-16"> {/* Add padding-top to account for fixed header */}
        {showBot ? <ChatbotInterface /> : <UserChat />}
      </main>
    </div>
  );
}