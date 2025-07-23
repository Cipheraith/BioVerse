import React, { useState } from 'react';

const LumaChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'luma' }[]>([]);
  const [input, setInput] = useState('');

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      // Here you would typically send the input to a backend AI service
      // For now, let's just add a placeholder response
      setTimeout(() => {
        setMessages(prevMessages => [...prevMessages, { text: 'Hello! How can I help you today?', sender: 'luma' }]);
      }, 500);
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none"
      >
        {/* Placeholder for Chat Icon */}
        💬
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold">Luma AI Assistance</h3>
            <button onClick={toggleChat} className="text-white hover:text-gray-200 focus:outline-none">
              ✖️
            </button>
          </div>

          {/* Message Area */}
          <div className="flex-grow p-3 overflow-y-auto flex flex-col space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg max-w-[80%] ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white self-end'
                    : 'bg-gray-200 text-gray-800 self-start'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              className="flex-grow px-3 py-2 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSend(); }}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors focus:outline-none"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LumaChatbot;
