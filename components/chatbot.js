"use client"
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Brain,
  User,
  Plus,
  PanelLeft,
  PanelLeftClose,
  Heart,
  Shield,
  Activity,
  MessageCircle,
  AlertTriangle,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const ChatbotInterface = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI healthcare assistant. How can I help you today?",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "") return;

    const userMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.");
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

      const requestBody = {
        contents: [
          {
            parts: [
              { 
                text: `You are a helpful healthcare assistant. Please provide clear, well-structured responses about health topics. Keep your response concise but informative.

User question: ${currentMessage}

Please provide:
1. A brief, clear explanation
2. Main symptoms (if relevant)
3. Simple treatment or management steps
4. When to see a doctor
5. Prevention tips (if applicable)

Keep it simple and practical. Avoid overly technical language.` 
              }
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 1500,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response generated from API");
      }

      if (data.candidates[0].finishReason === "SAFETY") {
        throw new Error("Response was blocked due to safety filters");
      }

      const generatedText = data.candidates[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error("No text content in API response");
      }

      const formattedContent = formatHealthResponse(generatedText);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: formattedContent,
          timestamp: new Date(),
        },
      ]);

    } catch (error) {
      console.error("Error fetching response:", error);
      
      let errorMessage = "I'm sorry, I encountered an issue. ";
      
      if (error.message.includes("API key")) {
        errorMessage += "Please check your API configuration.";
      } else if (error.message.includes("safety")) {
        errorMessage += "Your question couldn't be processed due to content policies. Please rephrase your question.";
      } else {
        errorMessage += "Please try again in a moment.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: {
            type: 'error',
            message: errorMessage
          },
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatHealthResponse = (text) => {
    // Split text into paragraphs and clean up
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    
    const sections = [];
    let currentSection = { title: "Information", content: [] };
    
    paragraphs.forEach(paragraph => {
      const cleanPara = paragraph.trim();
      
      // Check if it's a header/title
      if (cleanPara.match(/^\d+\.|\*\*.*\*\*|^[A-Z][^.]*:$/) || 
          cleanPara.toLowerCase().includes('symptom') ||
          cleanPara.toLowerCase().includes('treatment') ||
          cleanPara.toLowerCase().includes('prevention') ||
          cleanPara.toLowerCase().includes('when to see') ||
          cleanPara.toLowerCase().includes('seek medical')) {
        
        // Save current section if it has content
        if (currentSection.content.length > 0) {
          sections.push(currentSection);
        }
        
        // Start new section
        const title = cleanPara.replace(/^\d+\.|\*\*|\*$/g, '').replace(/:/g, '').trim();
        currentSection = { 
          title: title.charAt(0).toUpperCase() + title.slice(1), 
          content: [] 
        };
      } else {
        // Add to current section
        currentSection.content.push(cleanPara);
      }
    });
    
    // Add final section
    if (currentSection.content.length > 0) {
      sections.push(currentSection);
    }
    
    // If no sections were created, put everything in one section
    if (sections.length === 0) {
      sections.push({
        title: "Health Information",
        content: paragraphs
      });
    }
    
    return {
      type: 'simple_structured',
      sections: sections
    };
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const quickActions = [
    { icon: Heart, label: "Symptoms", color: "text-red-400" },
    { icon: Shield, label: "Prevention", color: "text-green-400" },
    { icon: Activity, label: "Wellness", color: "text-blue-400" },
    { icon: Brain, label: "Mental Health", color: "text-purple-400" },
  ];

  const renderMessage = (message, index) => {
    const content = message.content;

    // Handle error messages
    if (content?.type === 'error') {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-200">{content.message}</p>
          </div>
        </div>
      );
    }

    // Handle simple text messages
    if (typeof content === 'string') {
      return (
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      );
    }

    // Handle simple structured responses
    if (content?.type === 'simple_structured') {
      return (
        <div className="space-y-4">
          {content.sections.map((section, idx) => (
            <div key={idx} className="bg-gray-800/30 backdrop-blur-sm border border-gray-600/20 rounded-lg p-4">
              {section.title !== "Information" && (
                <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  {section.title}
                </h4>
              )}
              <div className="space-y-2">
                {section.content.map((item, itemIdx) => (
                  <p key={itemIdx} className="text-gray-300 leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-blue-200 text-sm">Always consult healthcare professionals for personalized medical advice.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="prose prose-invert max-w-none">
        <p className="text-gray-300 leading-relaxed">Unable to display this content properly.</p>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarVisible && (
          <motion.div
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-80 bg-black/40 backdrop-blur-xl border-r border-gray-700/50 flex-shrink-0 overflow-y-auto relative z-20"
          >
            <div className="p-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-3 py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-blue-500/25 mt-20"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">New Consultation</span>
                <Sparkles className="w-4 h-4 ml-auto" />
              </motion.button>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-400 mb-4 px-2">Quick Topics</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-4 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-600/20 hover:border-gray-500/50 transition-all duration-300 text-center group"
                        onClick={() => setInputMessage(`Tell me about ${action.label.toLowerCase()}`)}
                      >
                        <IconComponent className={`w-6 h-6 mx-auto mb-2 ${action.color} group-hover:scale-110 transition-transform duration-200`} />
                        <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <div className="relative z-30 p-6 flex items-center justify-between backdrop-blur-xl bg-black/20 border-b border-gray-700/30">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={toggleSidebar}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-gray-500/50 rounded-xl transition-colors"
            >
              {sidebarVisible ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeft className="w-5 h-5" />
              )}
            </motion.button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                HealthAI Assistant
              </h1>
              <p className="text-sm text-gray-400">Simple, clear health information</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700'
                }`}>
                  {message.role === 'assistant' ? (
                    <Brain className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-white text-sm">
                      {message.role === 'assistant' ? 'HealthAI' : 'You'}
                    </span>
                  </div>
                  
                  <div className={`rounded-xl p-4 ${
                    message.role === 'user' 
                      ? 'bg-blue-600/20 border border-blue-500/30 ml-8' 
                      : 'bg-gray-800/30 backdrop-blur-sm border border-gray-600/20'
                  }`}>
                    {renderMessage(message, index)}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Loading Animation */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-600/20 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                        />
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-blue-400 rounded-full"
                        />
                      </div>
                      <span className="text-gray-400 text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="relative z-30 p-6 backdrop-blur-xl bg-black/20 border-t border-gray-700/30">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={sendMessage} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me about symptoms, treatments, or health topics..."
                  className="w-full py-4 px-6 pr-16 bg-gray-800/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || inputMessage.trim() === ""}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl flex items-center justify-center transition-all duration-300"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              </div>
            </form>

            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                "Common cold treatment",
                "Headache remedies",
                "Healthy diet tips",
                "Stress management",
                "Exercise benefits",
              ].map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setInputMessage(suggestion)}
                  className="px-3 py-2 text-sm bg-gray-800/30 backdrop-blur-sm border border-gray-600/20 rounded-full hover:border-blue-500/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-300"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                <Shield className="w-3 h-3" />
                This AI provides general health information. Always consult healthcare professionals for medical advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotInterface;