import React, { useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';

const ChatBotPage: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { sender: 'user', text: input }]);
      setInput('');

      // Simulate bot response
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'This is a bot response!' }]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-6 py-4 text-white bg-blue-600 shadow-md">
        <h1 className="flex items-center text-xl font-bold">
          <MessageCircle className="w-6 h-6 mr-2" /> ChatBot
        </h1>
      </header>

      {/* Chat Area */}
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg shadow-md text-white ${
                  message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-300 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex items-center p-4 bg-white border-t">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          className="flex items-center px-4 py-2 ml-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          onClick={handleSendMessage}
        >
          <Send className="w-5 h-5 mr-1" /> Send
        </button>
      </div>
    </div>
  );
};

export default ChatBotPage;