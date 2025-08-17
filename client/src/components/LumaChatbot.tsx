import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  text: string;
  sender: 'user' | 'luma';
  timestamp: Date;
}

const LumaChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Hello! I\'m Luma, your AI health assistant powered by Llama 3.2. How can I help you today?',
      sender: 'luma',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const userMessage: Message = {
        text: input.trim(),
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setIsLoading(true);

      try {
        // Call Luma API connected to Llama 3.2 via Ollama
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/luma/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: userMessage.text })
        });

        if (response.ok) {
          const data = await response.json();
          const lumaMessage: Message = {
            text: data.response || data.message || 'I\'m sorry, I couldn\'t process that request.',
            sender: 'luma',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, lumaMessage]);
        } else {
          throw new Error('Failed to get response');
        }
      } catch (error) {
        console.error('Error calling Luma API:', error);
        const errorMessage: Message = {
          text: 'I\'m sorry, I\'m having trouble connecting right now. Please try again later.',
          sender: 'luma',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
<button
        onClick={toggleChat}
        className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-300 animate-pulse-glow animate-bounce-in"
      >
        <MessageCircle size={24} className="animate-gradient" />
      </button>

      {/* Chat Window */}
      {isOpen && (
<div className="fixed bottom-24 sm:bottom-20 right-3 sm:right-6 w-[92vw] max-w-md sm:w-96 h-[70vh] sm:h-[500px] bg-dark-card border border-dark-border rounded-2xl shadow-2xl flex flex-col backdrop-blur-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-secondary-500 to-primary-500 text-white p-4 rounded-t-2xl flex justify-between items-center animate-pulse-glow">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-bounce-in">
                🤖
              </div>
              <div className="animate-gradient">
                <h3 className="text-lg font-bold">Luma AI</h3>
                <p className="text-xs opacity-80">Powered by Llama 3.2</p>
              </div>
            </div>
            <button 
              onClick={toggleChat} 
              className="text-white hover:text-gray-200 focus:outline-none hover:bg-white/20 rounded-full p-1 transition-colors animate-bounce"
            >
              <X size={20} />
            </button>
          </div>

          {/* Message Area */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col space-y-3 bg-dark-background/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg'
                      : 'bg-dark-card border border-dark-border text-dark-text shadow-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-xs mt-1 opacity-70 ${
                    msg.sender === 'user' ? 'text-white/70' : 'text-dark-muted'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-dark-card border border-dark-border text-dark-text p-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-dark-border bg-dark-card/50">
            <div className="flex space-x-2">
              <input
                type="text"
                className="flex-grow px-4 py-3 rounded-xl bg-dark-input border border-dark-border text-dark-text placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Ask Luma anything about health..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !isLoading) handleSend(); }}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white p-3 rounded-xl hover:from-primary-600 hover:to-secondary-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LumaChatbot;
