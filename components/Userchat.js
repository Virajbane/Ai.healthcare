import { useState, useEffect } from "react";
import socket from "@/libs/socket";
import { useUser } from "@clerk/nextjs";

export default function UserChat() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const doctorId = process.env.NEXT_PUBLIC_DOCTOR_ID;
  const role = user?.publicMetadata?.role; // "user"

  useEffect(() => {
    if (!user?.id) return;

    socket.emit("register", user.id);

    const handleReceive = (data) => {
      if (data.from !== user.id) {
        setMessages((prev) => [
          ...prev,
          {
            senderId: data.from,
            text: data.message,
            senderRole: "doctor",
          },
        ]);
      }
    };

    socket.on("receive_message", handleReceive);
    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [user]);

  const sendMessage = () => {
    if (!input.trim()) return;

    socket.emit("send_message", {
  from: user.id,
  to: doctorId,
  message: input,
  senderRole: role, // either "user" or "doctor"
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

  return (
    <div className="p-4 border rounded">
      <h3>Chat with Doctor</h3>
      <div className="mb-2 h-40 overflow-y-auto">
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.senderId === user.id ? "me" : m.senderRole || "doctor"}:</b> {m.text}
          </p>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
