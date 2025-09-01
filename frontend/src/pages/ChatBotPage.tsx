import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Bot, User, Trash2, Sun, MapPin, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import aiChatbotService, { ChatMessage, WeatherData, LocationData, WikipediaData } from '../services/aiChatbotService';
import LocationMap from '../components/chatbot/LocationMap';

const ChatBotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      sender: 'bot',
      text: `👋 Hello! I'm your AI travel assistant. I can help you with:

🌤️ **Weather Information** - Ask about weather in any city
📍 **Location Details** - Get attractions and places to visit
📚 **Wikipedia Facts** - Learn about destinations and landmarks
💬 **Travel Advice** - General travel tips and recommendations

Try asking me something like:
• "What's the weather like in Paris?"
• "Tell me about the attractions in Tokyo"
• "What is the Eiffel Tower?"
• "Give me travel tips for Italy"`,
      timestamp: new Date(),
      type: 'text',
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (input.trim() && !isLoading) {
      setIsLoading(true);
      setIsTyping(true);

      try {
        const newMessages = await aiChatbotService.processMessage(input.trim());
        setMessages(prev => [...prev, ...newMessages]);
        setInput('');
      } catch (error) {
        console.error('Error processing message:', error);
        const errorMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: 'bot',
          text: 'I apologize, but I encountered an error. Please try again.',
          timestamp: new Date(),
          type: 'error',
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    aiChatbotService.clearConversation();
    setMessages([]);
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      sender: 'bot',
      text: `👋 Hello! I'm your AI travel assistant. I can help you with:

🌤️ **Weather Information** - Ask about weather in any city
📍 **Location Details** - Get attractions and places to visit
📚 **Wikipedia Facts** - Learn about destinations and landmarks
💬 **Travel Advice** - General travel tips and recommendations

Try asking me something like:
• "What's the weather like in Paris?"
• "Tell me about the attractions in Tokyo"
• "What is the Eiffel Tower?"
• "Give me travel tips for Italy"`,
      timestamp: new Date(),
      type: 'text',
    };
    setMessages([welcomeMessage]);
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.sender === 'user';
    const isBot = message.sender === 'bot';

    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start gap-3 max-w-4xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}>
            {isUser ? (
              <User className="w-5 h-5 text-white" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>

          {/* Message Content */}
          <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-4 py-3 rounded-2xl shadow-sm max-w-2xl ${
              isUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-800 border border-gray-100'
            }`}>
              {/* Special message types */}
              {isBot && message.type === 'weather' && message.data && (
                <WeatherMessage data={message.data} />
              )}
              {isBot && message.type === 'location' && message.data && (
                <LocationMessage data={message.data} />
              )}
              {isBot && message.type === 'wikipedia' && message.data && (
                <WikipediaMessage data={message.data} />
              )}
              
              {/* Regular text */}
              <div className="whitespace-pre-wrap">{message.text}</div>
            </div>
            
            {/* Timestamp */}
            <div className={`text-xs text-gray-500 mt-2 ${isUser ? 'text-right' : 'text-left'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Travel Assistant</h1>
                <p className="text-sm text-gray-600">Powered by AI & Real-time Data</p>
              </div>
            </div>
            
            <button
              onClick={clearConversation}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              Clear Chat
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Messages Area */}
          <div className="h-[600px] overflow-y-auto p-6 bg-gray-50">
            <div className="space-y-4">
              {messages.map(renderMessage)}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about weather, locations, attractions, or any travel question..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={1}
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                  }}
                />
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Send
              </button>
            </div>
            
            {/* Quick Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setInput('What\'s the weather like in Paris?')}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200"
              >
                <Sun className="w-3 h-3 inline mr-1" />
                Weather
              </button>
              <button
                onClick={() => setInput('Tell me about attractions in Tokyo')}
                className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors duration-200"
              >
                <MapPin className="w-3 h-3 inline mr-1" />
                Attractions
              </button>
              <button
                onClick={() => setInput('What is the Eiffel Tower?')}
                className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors duration-200"
              >
                <BookOpen className="w-3 h-3 inline mr-1" />
                Learn
              </button>
              <button
                onClick={() => setInput('Give me travel tips for Italy')}
                className="px-3 py-1 text-xs bg-pink-100 text-pink-700 rounded-full hover:bg-pink-200 transition-colors duration-200"
              >
                <Sparkles className="w-3 h-3 inline mr-1" />
                Tips
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Weather Message Component
const WeatherMessage: React.FC<{ data: WeatherData }> = ({ data }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-lg font-semibold">
      <span className="text-2xl">{data.icon}</span>
      Weather in {data.location}
    </div>
    
    {/* Interactive Map */}
    <LocationMap
      latitude={data.coordinates?.lat || 0}
      longitude={data.coordinates?.lon || 0}
      locationName={data.location}
      country="Unknown"
    />
    
    <div className="grid grid-cols-2 gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Temperature:</span>
        <span className="font-semibold">{data.temperature}°C</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Conditions:</span>
        <span className="font-semibold capitalize">{data.description}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Humidity:</span>
        <span className="font-semibold">{data.humidity}%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-600">Wind:</span>
        <span className="font-semibold">{data.windSpeed} km/h</span>
      </div>
    </div>
  </div>
);

// Location Message Component
const LocationMessage: React.FC<{ data: LocationData }> = ({ data }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 text-lg font-semibold">
      <MapPin className="w-6 h-6 text-red-500" />
      {data.name}, {data.country}
    </div>
    
    {/* Interactive Map */}
    <LocationMap
      latitude={data.coordinates.lat}
      longitude={data.coordinates.lon}
      locationName={data.name}
      country={data.country}
    />
    
    <div>
      <div className="font-semibold text-gray-800 mb-2">Top Attractions:</div>
      <div className="space-y-1">
        {data.attractions.slice(0, 5).map((attr, index) => (
          <div key={index} className="text-sm">
            • <span className="font-medium">{attr.name}</span>
            <span className="text-gray-500 ml-2">({attr.type})</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Wikipedia Message Component
const WikipediaMessage: React.FC<{ data: WikipediaData }> = ({ data }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-lg font-semibold">
      <BookOpen className="w-6 h-6 text-blue-500" />
      {data.title}
    </div>
    <div className="text-sm text-gray-700 leading-relaxed">
      {data.extract}
    </div>
    {data.image && (
      <img 
        src={data.image} 
        alt={data.title}
        className="w-full h-32 object-cover rounded-lg"
      />
    )}
    <div className="text-sm">
      <a 
        href={data.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        Read more on Wikipedia →
      </a>
    </div>
  </div>
);

export default ChatBotPage;