import React, { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft, Users, Circle, Search, Phone, Video, MoreVertical } from "lucide-react";

// Mock authentication system - replace with your actual Clerk authentication
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate authentication loading
    setTimeout(() => {
      // You can switch between doctor and user by changing the role here
      setUser({
        id: "doctor-1", // Change to "user-123" to test user view
        firstName: "Viraj",
        lastName: "Bane",
        publicMetadata: { role: "doctor" } // Change to "user" to test user view
      });
      setIsLoaded(true);
    }, 1000);
  }, []);

  return { user, isLoaded };
};

// Centralized message store to simulate real-time communication
const messageStore = {
  messages: {},
  listeners: [],
  
  addMessage(message) {
    const { from, to } = message;
    const conversationId = [from, to].sort().join('-');
    
    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    
    this.messages[conversationId].push({
      ...message,
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString()
    });
    
    // Notify all listeners
    this.listeners.forEach(listener => listener(message));
  },
  
  getMessages(user1, user2) {
    const conversationId = [user1, user2].sort().join('-');
    return this.messages[conversationId] || [];
  },
  
  addListener(callback) {
    this.listeners.push(callback);
  },
  
  removeListener(callback) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }
};

// Mock socket implementation with proper bidirectional communication
const useSocket = (user) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());

  useEffect(() => {
    if (!user) return;

    const mockSocket = {
      emit: (event, data) => {
        console.log(`Socket emit: ${event}`, data);
        if (event === "register") {
          setIsConnected(true);
        } else if (event === "send_message") {
          // Add message to store
          messageStore.addMessage(data);
        }
      },
      on: (event, callback) => {
        console.log(`Socket listening for: ${event}`);
        
        if (event === "receive_message") {
          const listener = (message) => {
            // Only call callback if this user is the recipient
            if (message.to === user.id) {
              callback(message);
            }
          };
          messageStore.addListener(listener);
          
          // Store the listener for cleanup
          callback._listener = listener;
        }
      },
      off: (event, callback) => {
        console.log(`Socket off: ${event}`);
        if (event === "receive_message" && callback._listener) {
          messageStore.removeListener(callback._listener);
        }
      }
    };

    setSocket(mockSocket);
    setIsConnected(true);

    // Mock online users based on current user role
    if (user.publicMetadata?.role === "user") {
      // If user is a patient, show available doctors
      setOnlineUsers(new Map([
        ["doctor-1", { name: "Dr. Viraj Bane", role: "doctor", specialty: "Cardiologist", status: "online" }],
        ["doctor-2", { name: "Dr. Sarah Johnson", role: "doctor", specialty: "Dermatologist", status: "online" }],
        ["doctor-3", { name: "Dr. Michael Chen", role: "doctor", specialty: "Neurologist", status: "away" }]
      ]));
    } else {
      // If user is a doctor, show available patients
      setOnlineUsers(new Map([
        ["user-123", { name: "John Doe", role: "user", status: "online" }],
        ["user-456", { name: "Jane Smith", role: "user", status: "online" }]
      ]));
    }

    return () => {
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  return { socket, isConnected, onlineUsers };
};

// Doctor Console Component
const DoctorConsole = ({ user, socket, isConnected }) => {
  const [allMessages, setAllMessages] = useState({});
  const [input, setInput] = useState("");
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !user?.id) return;

    const doctorData = {
      userId: user.id,
      name: user.firstName && user.lastName 
        ? `Dr. ${user.firstName} ${user.lastName}` 
        : `Dr. ${user.firstName || 'Doctor'}`,
      role: "doctor"
    };

    socket.emit("register", doctorData);

    const handleReceive = (data) => {
      if (data.from !== user.id) {
        const patientId = data.from;
        
        // Add patient to list if not exists
        setPatients(prev => {
          const exists = prev.find(p => p.id === patientId);
          if (!exists) {
            return [...prev, {
              id: patientId,
              name: data.senderName || `Patient ${patientId.slice(-4)}`,
              role: data.senderRole || "user",
              lastMessage: data.message,
              timestamp: data.timestamp || new Date().toISOString(),
              status: "online"
            }];
          } else {
            return prev.map(p => 
              p.id === patientId 
                ? { ...p, lastMessage: data.message, timestamp: data.timestamp || new Date().toISOString() }
                : p
            );
          }
        });

        // Add message to conversation
        setAllMessages(prev => ({
          ...prev,
          [patientId]: [
            ...(prev[patientId] || []),
            {
              id: Date.now() + Math.random(),
              senderId: patientId,
              text: data.message,
              senderRole: data.senderRole || "user",
              timestamp: data.timestamp || new Date().toISOString(),
            },
          ],
        }));

        // Update unread count
        if (!selectedPatient || selectedPatient.id !== patientId) {
          setUnreadCounts(prev => ({
            ...prev,
            [patientId]: (prev[patientId] || 0) + 1
          }));
        }
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket, user, selectedPatient]);

  // Load existing messages when a patient is selected
  useEffect(() => {
    if (selectedPatient && user) {
      const existingMessages = messageStore.getMessages(user.id, selectedPatient.id);
      const formattedMessages = existingMessages.map(msg => ({
        id: msg.id,
        senderId: msg.from,
        text: msg.message,
        senderRole: msg.senderRole,
        timestamp: msg.timestamp
      }));
      
      setAllMessages(prev => ({
        ...prev,
        [selectedPatient.id]: formattedMessages
      }));
    }
  }, [selectedPatient, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, selectedPatient]);

  const sendMessage = () => {
    if (!input.trim() || !selectedPatient || !socket) return;

    const messageData = {
      from: user.id,
      to: selectedPatient.id,
      message: input,
      senderRole: "doctor",
      senderName: user.firstName && user.lastName 
        ? `Dr. ${user.firstName} ${user.lastName}` 
        : `Dr. ${user.firstName || 'Doctor'}`
    };

    socket.emit("send_message", messageData);

    // Add message to local state
    setAllMessages(prev => ({
      ...prev,
      [selectedPatient.id]: [
        ...(prev[selectedPatient.id] || []),
        {
          id: Date.now() + Math.random(),
          senderId: user.id,
          text: input,
          senderRole: "doctor",
          timestamp: new Date().toISOString(),
        },
      ],
    }));

    // Update patient's last message
    setPatients(prev => prev.map(p => 
      p.id === selectedPatient.id 
        ? { ...p, lastMessage: input, timestamp: new Date().toISOString() }
        : p
    ));

    setInput("");
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatLastSeen = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  if (!selectedPatient) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-full max-w-md bg-white border-r border-gray-200">
          <div className="p-4 bg-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6" />
                <div>
                  <h1 className="text-xl font-semibold">Doctor Console</h1>
                  <p className="text-sm text-blue-100">
                    {user.firstName && user.lastName 
                      ? `Dr. ${user.firstName} ${user.lastName}` 
                      : `Dr. ${user.firstName || 'Doctor'}`}
                  </p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            </div>
            <p className="text-blue-100 text-sm mt-2">
              {patients.length} {patients.length === 1 ? 'patient' : 'patients'} available
            </p>
          </div>

          <div className="overflow-y-auto h-full">
            {patients.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No patients yet</p>
                <p className="text-sm">Patients will appear here when they message you</p>
              </div>
            ) : (
              patients.map((patient) => (
                <div
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatient(patient);
                    setUnreadCounts(prev => ({ ...prev, [patient.id]: 0 }));
                  }}
                  className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {patient.name}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatLastSeen(patient.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {patient.lastMessage}
                      </p>
                      {unreadCounts[patient.id] > 0 && (
                        <div className="flex items-center mt-1">
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {unreadCounts[patient.id]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedPatient(null)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {selectedPatient.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{selectedPatient.name}</h2>
              <div className="flex items-center space-x-1">
                <Circle className="h-2 w-2 text-green-500 fill-current" />
                <span className="text-sm text-gray-500">Online</span>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Patient ID: {selectedPatient.id.slice(-8)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {(allMessages[selectedPatient.id] || []).map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-white p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={`Message ${selectedPatient.name}...`}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!isConnected}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !isConnected}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Send className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Patient Console Component
const PatientConsole = ({ user, socket, isConnected, onlineUsers }) => {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !user?.id) return;

    socket.emit("register", {
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      role: "user"
    });

    const handleReceive = (data) => {
      console.log('Received message:', data);
      const doctorId = data.from;
      
      setMessages(prev => ({
        ...prev,
        [doctorId]: [
          ...(prev[doctorId] || []),
          {
            id: Date.now() + Math.random(),
            senderId: doctorId,
            text: data.message,
            timestamp: data.timestamp || new Date().toISOString(),
            senderRole: data.senderRole || "doctor"
          }
        ]
      }));
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket, user]);

  // Load existing messages when a doctor is selected
  useEffect(() => {
    if (selectedDoctor && user) {
      const existingMessages = messageStore.getMessages(user.id, selectedDoctor.id);
      const formattedMessages = existingMessages.map(msg => ({
        id: msg.id,
        senderId: msg.from,
        text: msg.message,
        timestamp: msg.timestamp,
        senderRole: msg.senderRole
      }));
      
      setMessages(prev => ({
        ...prev,
        [selectedDoctor.id]: formattedMessages
      }));
    }
  }, [selectedDoctor, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedDoctor]);

  const sendMessage = () => {
    if (!input.trim() || !selectedDoctor || !socket) return;

    const messageData = {
      from: user.id,
      to: selectedDoctor.id,
      message: input,
      senderRole: 'user',
      senderName: `${user.firstName} ${user.lastName}`
    };

    socket.emit('send_message', messageData);

    const newMessage = {
      id: Date.now() + Math.random(),
      senderId: user.id,
      text: input,
      timestamp: new Date().toISOString(),
      senderRole: "user"
    };

    setMessages(prev => ({
      ...prev,
      [selectedDoctor.id]: [...(prev[selectedDoctor.id] || []), newMessage]
    }));

    setInput("");
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const availableDoctors = Array.from(onlineUsers.entries())
    .filter(([id, profile]) => profile.role === "doctor")
    .map(([id, profile]) => ({
      id,
      name: profile.name,
      specialty: profile.specialty || "General Practice",
      status: profile.status || "online",
      lastSeen: profile.status === "online" ? "Online" : "Last seen recently"
    }))
    .filter(doctor =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (!selectedDoctor) {
    return (
      <div className="flex h-screen bg-gray-900 text-white">
        <div className="w-full max-w-md bg-gray-800 border-r border-gray-700">
          <div className="p-4 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-semibold">Select a Doctor</h1>
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={isConnected ? 'Connected' : 'Disconnected'} />
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors or specialties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-y-auto">
            {availableDoctors.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No doctors available</p>
                <p className="text-sm">Doctors will appear here when they're online</p>
              </div>
            ) : (
              availableDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  onClick={() => setSelectedDoctor(doctor)}
                  className="p-4 hover:bg-gray-700 cursor-pointer border-b border-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {doctor.name.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(doctor.status)}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{doctor.name}</h3>
                      <p className="text-sm text-blue-400">{doctor.specialty}</p>
                      <p className="text-xs text-gray-400">{doctor.lastSeen}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <div className="flex-1 flex flex-col">
        <div className="bg-gray-800 p-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="relative">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedDoctor.name.charAt(0).toUpperCase()}
              </div>
              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 ${getStatusColor(selectedDoctor.status)}`} />
            </div>
            <div>
              <h2 className="font-semibold">{selectedDoctor.name}</h2>
              <p className="text-sm text-blue-400">{selectedDoctor.specialty}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                 title={isConnected ? 'Connected' : 'Disconnected'} />
            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
              <Video className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-full transition-colors">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900">
          {(messages[selectedDoctor.id] || []).map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs mt-1 opacity-70">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="bg-gray-800 p-4 border-t border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`Type a message to ${selectedDoctor.name}...`}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none resize-none min-h-[40px] max-h-32"
                rows="1"
                disabled={!isConnected}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !isConnected}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          {!isConnected && (
            <p className="text-red-400 text-sm mt-2">Disconnected from server</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function IntegratedChatSystem() {
  const { user, isLoaded } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket(user);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const userRole = user?.publicMetadata?.role;

  if (userRole === "doctor") {
    return (
      <DoctorConsole 
        user={user} 
        socket={socket} 
        isConnected={isConnected}
      />
    );
  }

  return (
    <PatientConsole 
      user={user} 
      socket={socket} 
      isConnected={isConnected}
      onlineUsers={onlineUsers}
    />
  );
}