"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Brain, ChevronDown, ChevronUp, User, CornerDownLeft, Plus, PanelLeft, PanelLeftClose, Zap, LayoutGrid, History, Settings } from "lucide-react";

const ChatbotInterface = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI healthcare assistant. How can I help you today? You can ask about symptoms, medication information, or general health advice."
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const messagesEndRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState("HealthAI Pro");
  const [showModelSelector, setShowModelSelector] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    // Add user message
    const userMessage = { role: "user", content: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponses = [
        "Based on your symptoms, it could be a mild respiratory infection. I recommend rest and increased fluid intake. Would you like me to provide more specific self-care recommendations?",
        "Your vital signs are within normal range. Would you like me to schedule a follow-up with your doctor, or would you prefer I analyze your recent sleep pattern data first?",
        "I've analyzed your recent test results and everything looks good. Continue with your current medication regimen. Your cholesterol levels have improved by 15% since your last check-up.",
        "It's important to monitor these symptoms. I can set up a virtual consultation with a specialist or provide you with a preliminary assessment based on your medical history. What would you prefer?"
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      setMessages((prev) => [...prev, { role: "assistant", content: randomResponse }]);
      setIsLoading(false);
    }, 1500);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleModelSelector = () => {
    setShowModelSelector(!showModelSelector);
  };

  const selectModel = (model) => {
    setSelectedModel(model);
    setShowModelSelector(false);
  };

  const models = [
    { id: "pro", name: "HealthAI Pro", description: "Advanced diagnosis & personalized advice" },
    { id: "specialist", name: "Specialist GPT", description: "Domain-specific medical expertise" },
    { id: "monitor", name: "Vital Monitor", description: "Real-time health data analysis" }
  ];

  const chatCategories = [
    { name: "Recent Diagnoses", chats: ["Headache Assessment", "Sleep Analysis", "Allergy Screening"] },
    { name: "Medication Reviews", chats: ["Antihypertensive Meds", "Supplement Plan", "Drug Interactions"] },
    { name: "Health Planning", chats: ["Diet Consultation", "Exercise Regimen", "Stress Management"] }
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Main chat area - positioned below header with pt-24 to account for header height */}
      <div className="flex flex-1 pt-24 bg-gray-900 text-white overflow-hidden">
        {/* Sidebar */}
        <motion.div 
          className="h-full bg-gray-900 border-r border-gray-700 flex-shrink-0 overflow-y-auto"
          initial={{ width: sidebarVisible ? 280 : 0 }}
          animate={{ width: sidebarVisible ? 280 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-3">
            <button className="w-full flex items-center gap-2 py-3 px-4 bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg hover:opacity-90 transition-opacity mb-4">
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>

            <div className="relative mb-4">
              <button 
                onClick={toggleModelSelector}
                className="w-full flex items-center justify-between py-2 px-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-teal-400" />
                  <span>{selectedModel}</span>
                </div>
                {showModelSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showModelSelector && (
                <div className="absolute w-full mt-1 bg-gray-800 rounded-lg border border-gray-700 shadow-lg z-10">
                  {models.map(model => (
                    <button
                      key={model.id}
                      className="w-full px-4 py-2 text-left hover:bg-gray-700 flex flex-col"
                      onClick={() => selectModel(model.name)}
                    >
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-gray-400">{model.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-3 space-y-6">
            {chatCategories.map((category, idx) => (
              <div key={idx}>
                <h3 className="text-xs uppercase text-gray-400 px-3 mb-2">{category.name}</h3>
                <div className="space-y-1">
                  {category.chats.map((chat, index) => (
                    <button 
                      key={index}
                      className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded-lg flex items-center gap-2 text-sm"
                    >
                      <Brain className="w-4 h-4 text-teal-500" />
                      {chat}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-4 left-3 right-3">
            <div className="flex justify-between px-2">
              <button className="p-2 hover:bg-gray-800 rounded-lg">
                <History className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg">
                <LayoutGrid className="w-5 h-5 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-lg">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Chat container */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Toggle sidebar button */}
          <div className="p-4 flex items-center border-b border-gray-800">
            <button 
              onClick={toggleSidebar}
              className="p-1 hover:bg-gray-800 rounded-md mr-3"
            >
              {sidebarVisible ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
            </button>
            <div className="flex-1">
              <h2 className="font-medium truncate">Current Consultation</h2>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900 to-black">
            <div className="max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`py-5 ${message.role === "assistant" ? "border-b border-gray-800" : ""}`}
                >
                  <div className="px-6 max-w-3xl mx-auto flex gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      {message.role === "assistant" ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center">
                          <Brain className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">
                        {message.role === "assistant" ? "HealthAI Assistant" : "You"}
                      </p>
                      <div className="prose prose-invert max-w-none">
                        <p>{message.content}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-5 border-b border-gray-800"
                >
                  <div className="px-6 max-w-3xl mx-auto flex gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center">
                        <Brain className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1">HealthAI Assistant</p>
                      <div className="flex items-center gap-1">
                        <motion.div 
                          className="w-2 h-2 bg-teal-400 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-blue-400 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                        />
                        <motion.div 
                          className="w-2 h-2 bg-teal-400 rounded-full"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <div className="bg-gray-900 border-t border-gray-800 p-4">
            <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative">
              <input
                type="text"
                placeholder="Describe your symptoms or ask a health question..."
                className="w-full p-4 pr-24 bg-gray-800 rounded-xl border border-gray-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 text-white placeholder-gray-400"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
              />
              <div className="absolute right-3 top-3 flex items-center gap-2 text-gray-400">
                <button
                  type="submit"
                  className={`p-1.5 rounded-lg ${inputMessage.trim() ? 'bg-gradient-to-r from-teal-500 to-blue-600 text-white' : 'bg-gray-700'} transition-colors`}
                  disabled={!inputMessage.trim()}
                >
                  {inputMessage.trim() ? <Send className="w-5 h-5" /> : <CornerDownLeft className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                HealthAI provides general health information, not medical advice. Always consult healthcare professionals for medical decisions.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotInterface;