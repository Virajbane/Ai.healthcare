"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
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

  if (!isLoaded) return <div className="text-center pt-24">Loading...</div>;

  return (
    <div className="pt-24 px-4">
      <Header />
      {showBot ? <ChatbotInterface /> : <UserChat />}
      
    </div>
  );
}
