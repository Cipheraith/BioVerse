import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Heart, 
  Brain, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Copy,
  Download,
  RefreshCw,
  Settings,
  Trash2
} from "lucide-react";
import { useSocket } from "./SocketContext";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'luma';
  timestamp: Date;
  type?: 'text' | 'diagnosis' | 'emergency' | 'info';
  metadata?: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    diagnosis?: string;
    recommendations?: string[];
    confidence?: number;
  };
}

const LumaChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m Luma, your AI health assistant powered by Llama 3.2. I can help you with medical questions, symptom analysis, health education, and more. How can I assist you today?',
      sender: 'luma',
      timestamp: new Date(),
      type: 'info'
    }
  ]);
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [typingIndicator, setTypingIndicator] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { socket } = useSocket();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate unique message ID
  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Handle sending messages
const handleSendMessage = async () => {
    if (!query.trim() || loading) return;

    const userMessage: Message = {
      id: generateMessageId(),
      text: query.trim(),
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    // Add user message and clear input
    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery('');
    setLoading(true);
    setTypingIndicator(true);

    try {
        // Use the BioVerse backend API which handles Ollama integration
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/luma/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            query: currentQuery
          }),
        });

      const data = await response.json();
      
      if (response.ok) {
        const responseText = typeof data.response === 'string' 
          ? data.response 
          : data.response?.explanation || data.message || 'I received your message but couldn\'t process it properly.';
          
        const lumaMessage: Message = {
          id: generateMessageId(),
          text: responseText,
          sender: 'luma',
          timestamp: new Date(),
          type: data.type || 'text',
          metadata: {
            severity: data.response?.severity,
            diagnosis: data.response?.primaryDiagnosis,
            recommendations: data.response?.recommendations,
            confidence: data.confidence
          }
        };
        
        setMessages(prev => [...prev, lumaMessage]);

        // Handle emergency alerts
        if (
          data.type === "symptom" &&
          data.response?.severity &&
          ["high", "critical"].includes(data.response.severity)
        ) {
          if (socket) {
            socket.emit("emergency:alert", {
              patientId: patientId,
              location: "Unknown",
              severity: data.response.severity,
              symptoms: currentQuery,
              diagnosis: data.response.primaryDiagnosis,
            });
            
            const alertMessage: Message = {
              id: generateMessageId(),
              text: `🚨 Emergency alert sent to health workers! Please seek immediate medical attention.`,
              sender: 'luma',
              timestamp: new Date(),
              type: 'emergency'
            };
            setMessages(prev => [...prev, alertMessage]);
          }
        }
      } else {
        const errorMessage: Message = {
          id: generateMessageId(),
          text: `I apologize, but I encountered an error: ${data.message || "Something went wrong. Please try again."}`,
          sender: 'luma',
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: generateMessageId(),
        text: `I'm sorry, I'm having trouble connecting right now. Please check your internet connection and try again.`,
        sender: 'luma',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTypingIndicator(false);
    }
  };

  // Handle voice input (Web Speech API)
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Copy message to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Clear conversation
  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        text: 'Conversation cleared. How can I help you today?',
        sender: 'luma',
        timestamp: new Date(),
        type: 'info'
      }
    ]);
  };

  // Message component
  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === 'user';
    const iconMap = {
      diagnosis: Brain,
      emergency: AlertTriangle,
      info: CheckCircle,
      text: Bot
    };
    const Icon = iconMap[message.type || 'text'];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''} mb-6`}
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' 
            : message.type === 'emergency'
              ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse-glow'
              : 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white'
        }`}>
          {isUser ? <User size={20} /> : <Icon size={20} />}
        </div>
        
        <div className={`flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl ${
          isUser ? 'text-right' : ''
        }`}>
          <div className={`group relative inline-block ${
            isUser
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl rounded-br-md'
              : message.type === 'emergency'
                ? 'bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 text-red-100 rounded-2xl rounded-bl-md'
                : 'bg-dark-card border border-dark-border text-dark-text rounded-2xl rounded-bl-md'
          } p-4 shadow-lg hover-lift`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
            
            {/* Metadata for medical responses */}
            {message.metadata && (
              <div className="mt-3 pt-3 border-t border-white/20">
                {message.metadata.diagnosis && (
                  <p className="text-xs opacity-90">
                    <strong>Diagnosis:</strong> {message.metadata.diagnosis}
                  </p>
                )}
                {message.metadata.severity && (
                  <p className={`text-xs mt-1 font-medium ${
                    message.metadata.severity === 'critical' ? 'text-red-300' :
                    message.metadata.severity === 'high' ? 'text-orange-300' :
                    message.metadata.severity === 'medium' ? 'text-yellow-300' :
                    'text-green-300'
                  }`}>
                    Severity: {message.metadata.severity.toUpperCase()}
                  </p>
                )}
                {message.metadata.recommendations && (
                  <div className="mt-2">
                    <p className="text-xs font-medium mb-1">Recommendations:</p>
                    <ul className="text-xs space-y-1 opacity-90">
                      {message.metadata.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <CheckCircle size={12} className="text-green-400" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Copy button */}
            <button
              onClick={() => copyToClipboard(message.text)}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10"
              title="Copy message"
            >
              <Copy size={12} />
            </button>
          </div>
          
          <div className={`flex items-center space-x-2 mt-1 text-xs text-dark-muted ${
            isUser ? 'justify-end' : 'justify-start'
          }`}>
            <Clock size={12} />
            <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {message.metadata?.confidence && (
              <span className="text-primary-400">• {Math.round(message.metadata.confidence * 100)}% confident</span>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-screen max-w-4xl mx-auto bg-dark-background"
    >
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between p-4 border-b border-dark-border bg-dark-card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-secondary-500 to-primary-500 rounded-full flex items-center justify-center animate-pulse-glow">
              <Brain size={24} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-dark-card animate-ping" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-dark-text animate-gradient bg-clip-text">
              Luma AI Assistant
            </h1>
            <p className="text-sm text-dark-muted flex items-center space-x-1">
              <Sparkles size={12} className="text-secondary-400" />
              <span>Powered by Llama 3.2 via Ollama</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearConversation}
            className="p-2 rounded-lg bg-dark-input hover:bg-red-500/20 text-dark-muted hover:text-red-400 transition-all hover-lift"
            title="Clear conversation"
          >
            <Trash2 size={18} />
          </button>
          <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
            Online
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        
        {/* Typing indicator */}
        {typingIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-start space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            <div className="bg-dark-card border border-dark-border rounded-2xl rounded-bl-md p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                <div className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <motion.div 
        className="p-4 border-t border-dark-border bg-dark-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Luma anything about health, symptoms, medications..."
              className="w-full p-4 pr-12 bg-dark-input border border-dark-border rounded-2xl text-dark-text placeholder-dark-muted resize-none focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all hover-lift"
              rows={1}
              style={{
                minHeight: '52px',
                maxHeight: '120px',
                height: 'auto'
              }}
              disabled={loading}
            />
            {/* Voice input button */}
            <button
              onClick={handleVoiceInput}
              disabled={loading}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse-glow' 
                  : 'bg-dark-border text-dark-muted hover:bg-secondary-500/20 hover:text-secondary-400'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={loading || !query.trim()}
            className="p-4 bg-gradient-to-r from-secondary-500 to-primary-500 text-white rounded-2xl hover:from-secondary-600 hover:to-primary-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary-300 disabled:opacity-50 disabled:cursor-not-allowed hover-lift animate-pulse-glow"
            title="Send message"
          >
            {loading ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            "What are the symptoms of malaria?",
            "Tell me about contraception",
            "How to prevent HIV?",
            "Maternal health tips"
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setQuery(suggestion)}
              className="px-3 py-2 text-xs bg-dark-input hover:bg-secondary-500/20 text-dark-muted hover:text-secondary-400 rounded-lg transition-all hover-lift"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LumaChatbot;
