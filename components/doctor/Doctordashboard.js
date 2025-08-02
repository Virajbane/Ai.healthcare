import { useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // ✅ Your backend socket URL

export default function DoctorDashboard({ user }) {
  useEffect(() => {
    if (user) {
      socket.emit("register", {
        userId: user.id,
        name: user.name,
        role: "doctor",
        specialty: user.specialty || "General Practice"
      });
    }

    socket.on("online_users", (data) => {
      console.log("Online Users:", data);
    });

    return () => {
      socket.disconnect(); // clean up
    };
  }, [user]);

  return (
    <div>
      <h1>Welcome Dr. {user?.name}</h1>
      {/* your UI */}
    </div>
  );
}
