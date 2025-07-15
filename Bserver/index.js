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
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = new Map(); // Maps userId to socketId and user info
let userProfiles = new Map(); // Maps userId to user profile info
let messageHistory = new Map(); // Store message history per conversation

io.on("connection", (socket) => {
  console.log("👤 New socket connected:", socket.id);
  
  // Handle user registration
  socket.on("register", (userData) => {
    const { userId, name, role, specialty } = userData;
    
    // Store both socket ID and user info
    onlineUsers.set(userId, {
      socketId: socket.id,
      name,
      role,
      specialty: specialty || "General Practice",
      status: "online",
      lastSeen: new Date().toISOString()
    });
    
    userProfiles.set(userId, { name, role, specialty });
    
    console.log(`✅ Registered ${role}: ${name} (${userId})`);
    
    // Broadcast updated user list to all clients
    const usersList = Array.from(onlineUsers.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      role: info.role,
      specialty: info.specialty,
      status: info.status,
      lastSeen: info.lastSeen
    }));
    
    io.emit("users_updated", { onlineUsers: usersList });
    
    // Send current online users to the newly connected user
    socket.emit("online_users", { onlineUsers: usersList });
  });
  
  // Handle message sending
  socket.on("send_message", ({ from, to, message, senderRole, senderName }) => {
    const recipient = onlineUsers.get(to);
    const sender = onlineUsers.get(from);
    
    const messageData = {
      from,
      to,
      message,
      senderRole: senderRole || sender?.role || "user",
      senderName: senderName || sender?.name || "Unknown",
      timestamp: new Date().toISOString()
    };
    
    // Store message in history
    const conversationId = [from, to].sort().join("-");
    if (!messageHistory.has(conversationId)) {
      messageHistory.set(conversationId, []);
    }
    messageHistory.get(conversationId).push(messageData);
    
    if (recipient && recipient.socketId) {
      io.to(recipient.socketId).emit("receive_message", messageData);
      console.log(`📨 Message sent from ${sender?.name || from} to ${recipient?.name || to}: ${message}`);
    } else {
      console.log(`❌ User ${to} not online`);
      // Store message for later delivery when user comes online
    }
    
    // Also send confirmation back to sender
    socket.emit("message_sent", messageData);
  });
  
  // Handle getting online users
  socket.on("get_online_users", () => {
    const usersList = Array.from(onlineUsers.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      role: info.role,
      specialty: info.specialty,
      status: info.status,
      lastSeen: info.lastSeen
    }));
    
    socket.emit("online_users", { onlineUsers: usersList });
  });
  
  // Handle getting message history
  socket.on("get_message_history", ({ userId1, userId2 }) => {
    const conversationId = [userId1, userId2].sort().join("-");
    const history = messageHistory.get(conversationId) || [];
    socket.emit("message_history", { conversationId, messages: history });
  });
  
  // Handle status updates
  socket.on("update_status", ({ userId, status }) => {
    const user = onlineUsers.get(userId);
    if (user) {
      user.status = status;
      user.lastSeen = new Date().toISOString();
      
      // Broadcast status update
      const usersList = Array.from(onlineUsers.entries()).map(([id, info]) => ({
        id,
        name: info.name,
        role: info.role,
        specialty: info.specialty,
        status: info.status,
        lastSeen: info.lastSeen
      }));
      
      io.emit("users_updated", { onlineUsers: usersList });
    }
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
    
    // Find and remove user from online users
    for (const [userId, userInfo] of onlineUsers.entries()) {
      if (userInfo.socketId === socket.id) {
        // Update status to offline instead of removing
        userInfo.status = "offline";
        userInfo.lastSeen = new Date().toISOString();
        
        console.log(`👋 User ${userInfo.name} went offline`);
        
        // Broadcast updated user list
        const usersList = Array.from(onlineUsers.entries()).map(([id, info]) => ({
          id,
          name: info.name,
          role: info.role,
          specialty: info.specialty,
          status: info.status,
          lastSeen: info.lastSeen
        }));
        
        io.emit("users_updated", { onlineUsers: usersList });
        break;
      }
    }
  });
  
  // Handle typing indicators
  socket.on("typing_start", ({ from, to }) => {
    const recipient = onlineUsers.get(to);
    if (recipient && recipient.socketId) {
      io.to(recipient.socketId).emit("user_typing", { userId: from, typing: true });
    }
  });
  
  socket.on("typing_stop", ({ from, to }) => {
    const recipient = onlineUsers.get(to);
    if (recipient && recipient.socketId) {
      io.to(recipient.socketId).emit("user_typing", { userId: from, typing: false });
    }
  });
});

// API endpoints
app.get("/api/users", (req, res) => {
  const usersList = Array.from(onlineUsers.entries()).map(([id, info]) => ({
    id,
    name: info.name,
    role: info.role,
    specialty: info.specialty,
    status: info.status,
    lastSeen: info.lastSeen
  }));
  
  res.json({ users: usersList });
});

app.get("/api/messages/:userId1/:userId2", (req, res) => {
  const { userId1, userId2 } = req.params;
  const conversationId = [userId1, userId2].sort().join("-");
  const messages = messageHistory.get(conversationId) || [];
  
  res.json({ messages });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    onlineUsers: onlineUsers.size,
    totalConversations: messageHistory.size
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Socket.IO server ready for connections`);
});

// Cleanup function
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };