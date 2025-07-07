"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import socket from "@/libs/socket";

export default function DoctorChat() {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const currentChatUserIdRef = useRef(""); // Keeps track of the active patient

  const role = user?.publicMetadata?.role; // should be "doctor"

  // Register socket and listen for messages
  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    socket.emit("register", user.id);

    const handleReceive = (data) => {
      // Only accept messages not sent by the doctor themselves
      if (data.from !== user.id) {
        // Set the user the doctor is chatting with
        if (!currentChatUserIdRef.current) {
          currentChatUserIdRef.current = data.from;
        }

        setMessages((prev) => [
          ...prev,
          {
            senderId: data.from,
            text: data.message,
            senderRole: data.senderRole || "user", // safest way to get sender role
          },
        ]);
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [isLoaded, user]);

  // Doctor sends a message
  const sendMessage = () => {
    if (!input.trim() || !currentChatUserIdRef.current) return;

    socket.emit("send_message", {
      from: user.id,
      to: currentChatUserIdRef.current,
      message: input,
      senderRole: role, // "doctor"
    });

    setMessages((prev) => [
      ...prev,
      {
        senderId: user.id,
        text: input,
        senderRole: role,
      },
    ]);

    setInput("");
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="p-4 border rounded mt-20 max-w-xl mx-auto">
      <h3 className="text-lg font-bold mb-3">Doctor Chat Console</h3>
      <div className="mb-3 h-40 overflow-y-auto border p-2 rounded bg-gray-50">
        {messages.map((m, i) => (
          <p key={i} className="text-sm">
            <b>{m.senderId === user.id ? "Me" : m.senderRole || "User"}:</b> {m.text}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message"
          className="flex-grow border p-2 rounded"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}
