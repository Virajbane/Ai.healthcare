// server/index.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

let onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("👤 New socket connected:", socket.id);

  socket.on("register", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`✅ Registered user ${userId}`);
  });

socket.on("send_message", ({ from, to, message, senderRole }) => {
  const toSocket = onlineUsers.get(to);
  if (toSocket) {
    io.to(toSocket).emit("receive_message", {
      from,
      message,
      senderRole, // 👈 Optional, but helpful
    });
  }
});


  socket.on("disconnect", () => {
    [...onlineUsers.entries()].forEach(([uid, sid]) => {
      if (sid === socket.id) onlineUsers.delete(uid);
    });
    console.log("❌ Disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("🚀 Server running on http://localhost:3001");
});
