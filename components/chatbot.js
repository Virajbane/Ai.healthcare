
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
  Clock,
  Trash2,
  Edit3,
  Settings,
  Sun,
  Moon,
  Search,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

// Separate Sidebar Component
const Sidebar = ({ 
  visible, 
  onToggle, 
  onNewChat, 
  onLoadChat, 
  onQuickAction, 
  recentChats, 
  currentChatId, 
  darkMode, 
  onToggleDarkMode 
}) => {
  const quickActions = [
    { icon: Heart, label: "Symptoms", color: "text-red-400", query: "What are common symptoms I should watch for?" },
    { icon: Shield, label: "Prevention", color: "text-green-400", query: "How can I prevent common illnesses?" },
    { icon: Activity, label: "Wellness", color: "text-blue-400", query: "Give me daily wellness tips" },
    { icon: Brain, label: "Mental Health", color: "text-purple-400", query: "How can I improve my mental health?" },
  ];

  const handleChatAction = (chatId, action) => {
    if (action === 'edit') {
      console.log('Edit chat:', chatId);
    } else if (action === 'delete') {
      console.log('Delete chat:', chatId);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-[280px] flex-shrink-0 overflow-hidden relative z-20 bg-gray-900 border-r border-gray-800"
        >
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-3 mt-20 border-b border-gray-800">
              <motion.button
                onClick={onNewChat}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-medium transition-colors bg-white text-black hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
                <span>New chat</span>
              </motion.button>
            </div>

            {/* Quick Topics */}
            <div className="p-3 border-b border-gray-800">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-2 rounded-lg transition-colors text-center group bg-gray-800 hover:bg-gray-700"
                      onClick={() => onQuickAction(action.query)}
                    >
                      <IconComponent className={`w-4 h-4 mx-auto mb-1 ${action.color}`} />
                      <span className="text-xs text-gray-400 group-hover:text-gray-300">
                        {action.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Recent Chats */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-1">
                {recentChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group relative rounded-lg transition-colors ${
                      currentChatId === chat.id
                        ? 'bg-gray-800'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <motion.div
                      onClick={() => onLoadChat(chat.id)}
                      className="cursor-pointer p-3 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate text-gray-200 mb-1">
                            {chat.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {chat.date}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-gray-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChatAction(chat.id, 'edit');
                            }}
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button 
                            className="p-1 rounded hover:bg-gray-700 text-gray-500 hover:text-red-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChatAction(chat.id, 'delete');
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-3 border-t border-gray-800">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>HealthAI Assistant</span>
                <div className="flex gap-1">
                  <button 
                    onClick={onToggleDarkMode}
                    className="p-1.5 rounded hover:bg-gray-800"
                  >
                    {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>
                  <button className="p-1.5 rounded hover:bg-gray-800">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Main ChatbotInterface Component
const ChatbotInterface = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI healthcare assistant. I can help you with health information, symptoms, treatments, and wellness tips. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [recentChats, setRecentChats] = useState([
    { id: 1, title: "Fever symptoms and treatment", date: "Today" },
    { id: 2, title: "Headache remedies", date: "Yesterday" },
    { id: 3, title: "Healthy diet tips", date: "2 days ago" },
    { id: 4, title: "Exercise benefits", date: "1 week ago" },
  ]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Enhanced API call function
  const callGeminiAPI = async (message) => {
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("Missing Gemini API Key in environment variables");
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a healthcare AI assistant. Please provide helpful, accurate health information while emphasizing that users should consult healthcare professionals for medical advice. Format your response with proper paragraphs and bullet points where appropriate. User question: ${message}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
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
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed: ${response.status}\n${errorBody}`);
      }

      const data = await response.json();

      if (
        data.candidates &&
        data.candidates[0]?.content?.parts &&
        data.candidates[0].content.parts[0]?.text
      ) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Invalid response format from Gemini API");
      }

    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
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

    // Add to recent chats if it's a new conversation
    if (messages.length <= 1) {
      const newChat = {
        id: Date.now(),
        title: currentMessage.length > 40 ? currentMessage.substring(0, 40) + "..." : currentMessage,
        date: "Now",
      };
      setRecentChats(prev => [newChat, ...prev.slice(0, 9)]);
      setCurrentChatId(newChat.id);
    }

    try {
      // Try to call Gemini API
      const response = await callGeminiAPI(currentMessage);
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: new Date(),
        },
      ]);

    } catch (error) {
      console.error("Error fetching response:", error);
      
      // Fallback to mock response if API fails
      const mockResponse = generateMockHealthResponse(currentMessage);
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: mockResponse,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockHealthResponse = (question) => {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('fever')) {
      return `**Understanding Fever**

Fever is your body's natural response to fighting infections and illnesses. Here's what you need to know:

**What is considered a fever?**
• Adults: Temperature above 100.4°F (38°C)
• Children: Temperature above 100.4°F (38°C) rectally

**Common causes:**
• Viral infections (cold, flu)
• Bacterial infections
• Inflammatory conditions
• Certain medications
• Heat exhaustion

**When to seek medical attention:**
• Fever above 103°F (39.4°C)
• Fever lasting more than 3 days
• Severe symptoms like difficulty breathing
• Signs of dehydration
• Persistent vomiting

**Home care tips:**
• Stay hydrated with water, broths, or electrolyte solutions
• Rest and get plenty of sleep
• Use fever reducers like acetaminophen or ibuprofen as directed
• Dress lightly and keep room temperature comfortable
• Apply cool, damp cloths to forehead

**Important reminder:** This information is for educational purposes only. Always consult with healthcare professionals for personalized medical advice, especially for high fevers or concerning symptoms.`;
    }
    
    if (questionLower.includes('headache')) {
      return `**Headache Management Guide**

Headaches are one of the most common health complaints. Here's comprehensive information to help you understand and manage them:

**Types of headaches:**
• **Tension headaches** - Most common, feels like a tight band around head
• **Migraines** - Intense, often one-sided, may include nausea and light sensitivity
• **Cluster headaches** - Severe, occur in patterns or clusters
• **Sinus headaches** - Related to sinus pressure and congestion

**Immediate relief strategies:**
• Apply cold or warm compress to head or neck
• Practice relaxation techniques and deep breathing
• Gently massage temples, neck, and shoulders
• Rest in a quiet, dark room
• Stay hydrated with water

**Lifestyle modifications:**
• Maintain regular sleep schedule (7-9 hours nightly)
• Eat regular, balanced meals
• Limit caffeine and alcohol
• Manage stress through exercise or meditation
• Stay hydrated throughout the day

**When to see a healthcare provider:**
• Sudden, severe headache unlike any before
• Headache with fever, stiff neck, confusion
• Headaches that worsen despite treatment
• Frequent headaches interfering with daily life
• Headache after head injury

**Remember:** While occasional headaches are normal, persistent or severe headaches warrant professional medical evaluation for proper diagnosis and treatment.`;
    }

    // Default response for other questions
    return `Thank you for your health question. I'd be happy to provide information and guidance.

**How I can help:**
• Explain common symptoms and conditions
• Provide general health and wellness tips
• Discuss prevention strategies
• Share information about treatments and home remedies

**Please note:** The information I provide is for educational purposes only and should not replace professional medical advice. For specific health concerns, accurate diagnosis, or treatment recommendations, please consult with qualified healthcare professionals.

**To get the most helpful response:**
• Be specific about your symptoms or concerns
• Mention how long you've been experiencing issues
• Include any relevant medical history if comfortable
• Ask about prevention or general wellness topics

Is there a specific health topic or concern you'd like me to address?`;
  };

  const handleQuickAction = (query) => {
    setInputMessage(query);
  };

  const startNewChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your AI healthcare assistant. I can help you with health information, symptoms, treatments, and wellness tips. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
    setCurrentChatId(null);
  };

  const loadChat = (chatId) => {
    setCurrentChatId(chatId);
    // In a real app, you'd load the actual chat history here
    setMessages([
      {
        role: "assistant",
        content: "Previous conversation loaded. How can I continue helping you with your health questions?",
        timestamp: new Date(),
      },
    ]);
  };

  const formatMessage = (content) => {
    if (typeof content !== 'string') return content;

    // Split content into sections and format
    const sections = content.split('\n\n');
    
    return sections.map((section, index) => {
      // Handle headers (lines starting with **)
      if (section.includes('**')) {
        const parts = section.split('**');
        return (
          <div key={index} className="mb-4">
            {parts.map((part, partIndex) => {
              if (partIndex % 2 === 1) {
                // This is a header
                return (
                  <h3 key={partIndex} className="font-semibold text-white mb-3 text-lg">
                    {part}
                  </h3>
                );
              } else if (part.trim()) {
                // Regular text
                return (
                  <div key={partIndex} className="mb-2">
                    {formatTextWithBullets(part)}
                  </div>
                );
              }
              return null;
            })}
          </div>
        );
      } else {
        // Regular paragraph
        return (
          <div key={index} className="mb-4">
            {formatTextWithBullets(section)}
          </div>
        );
      }
    });
  };

  const formatTextWithBullets = (text) => {
    const lines = text.split('\n');
    const elements = [];
    let currentList = [];
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        // This is a bullet point
        currentList.push(
          <li key={index} className="mb-2 text-gray-300 leading-relaxed">
            {trimmedLine.substring(1).trim()}
          </li>
        );
      } else {
        // Not a bullet point
        if (currentList.length > 0) {
          // Flush current list
          elements.push(
            <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-2 mb-4 ml-2">
              {currentList}
            </ul>
          );
          currentList = [];
        }
        
        if (trimmedLine) {
          elements.push(
            <p key={index} className="text-gray-300 leading-relaxed mb-3">
              {trimmedLine}
            </p>
          );
        }
      }
    });
    
    // Flush any remaining list items
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-2 mb-4 ml-2">
          {currentList}
        </ul>
      );
    }
    
    return elements;
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(typeof content === 'string' ? content : JSON.stringify(content));
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <Sidebar
        visible={sidebarVisible}
        onToggle={() => setSidebarVisible(!sidebarVisible)}
        onNewChat={startNewChat}
        onLoadChat={loadChat}
        onQuickAction={handleQuickAction}
        recentChats={recentChats}
        currentChatId={currentChatId}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarVisible(!sidebarVisible)}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {sidebarVisible ? (
                <PanelLeftClose className="w-5 h-5 text-gray-400" />
              ) : (
                <PanelLeft className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <h1 className="text-lg font-semibold">HealthAI Assistant</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-400">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-8 ${message.role === 'user' ? 'ml-12' : ''}`}
              >
                <div className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'assistant'
                      ? 'bg-green-600'
                      : 'bg-blue-600'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Brain className="w-5 h-5 text-white" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="mb-2">
                      <span className="font-semibold text-white">
                        {message.role === 'assistant' ? 'HealthAI' : 'You'}
                      </span>
                    </div>
                    
                    <div className="prose prose-gray max-w-none">
                      {typeof message.content === 'string' ? (
                        <div className="space-y-2">
                          {formatMessage(message.content)}
                        </div>
                      ) : (
                        <p className="text-gray-300 leading-relaxed">
                          {JSON.stringify(message.content)}
                        </p>
                      )}
                    </div>

                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-2 mt-4 pt-2">
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="p-1.5 rounded hover:bg-gray-800 transition-colors"
                          title="Copy message"
                        >
                          <Copy className="w-4 h-4 text-gray-500 hover:text-gray-400" />
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-gray-800 transition-colors"
                          title="Good response"
                        >
                          <ThumbsUp className="w-4 h-4 text-gray-500 hover:text-gray-400" />
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-gray-800 transition-colors"
                          title="Poor response"
                        >
                          <ThumbsDown className="w-4 h-4 text-gray-500 hover:text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Loading Animation */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-8"
                >
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Brain className="w-5 h-5 text-white" />
                      </motion.div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <span className="font-semibold text-white">HealthAI</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                              className="w-2 h-2 bg-gray-500 rounded-full"
                            />
                          ))}
                        </div>
                        <span className="text-gray-500 text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="relative z-30 p-6 backdrop-blur-xl border-t bg-gray-900/80 border-gray-700/30">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={sendMessage} className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me about symptoms, treatments, or health topics..."
                  className="w-full py-4 px-6 pr-16 rounded-2xl text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300 bg-gray-800/60 backdrop-blur-sm border border-gray-600/30 text-white focus:border-blue-500/50"
                  disabled={isLoading}
                />
                <motion.button
                  type="submit"
                  disabled={isLoading || inputMessage.trim() === ""}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/25"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              </div>
            </form>
            
            {/* Quick suggestion pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                "Common cold symptoms",
                "Healthy diet tips",
                "Exercise benefits",
                "Stress management"
              ].map((suggestion, index) => (
                <motion.button
                  key={index}
                  onClick={() => setInputMessage(suggestion)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm rounded-full transition-all duration-300 bg-gray-800/50 border border-gray-600/30 hover:border-gray-500/50 hover:bg-gray-700/50 text-gray-300 hover:text-white"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotInterface;