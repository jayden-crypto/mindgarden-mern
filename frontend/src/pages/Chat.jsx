import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertTriangle, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

const Chat = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showEmergencyResources, setShowEmergencyResources] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Welcome message
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: `Hello ${user?.name}! I'm your AI wellness companion. I'm here to listen, support, and provide guidance whenever you need it. How are you feeling today?`,
        timestamp: new Date()
      }
    ])
  }, [user])

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/chat/message', {
        message: inputMessage.trim()
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data?.response || "I'm sorry, I couldn't process your message. Please try again.",
        timestamp: new Date(),
        isEmergency: response.data.isEmergency,
        resources: response.data.resources
      }

      setMessages(prev => [...prev, botMessage])

      if (response.data.isEmergency) {
        setShowEmergencyResources(true)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble responding right now. If you're in crisis, please reach out to emergency services at 911 or the suicide prevention lifeline at 988.",
        timestamp: new Date(),
        isEmergency: true
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            AI Wellness Assistant
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Chat with our AI-powered wellness companion for support and guidance
          </p>
        </div>

        {/* Emergency Resources Banner */}
        {showEmergencyResources && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-medium text-red-800 mb-2">🆘 Immediate Help Available</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <a 
                    href="tel:988" 
                    className="flex items-center space-x-2 p-2 bg-white rounded border border-red-200 hover:border-red-300 transition-colors duration-200"
                  >
                    <Phone className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="font-medium text-red-800">Suicide Prevention</div>
                      <div className="text-red-600">Call 988</div>
                    </div>
                  </a>
                  <a 
                    href="tel:911" 
                    className="flex items-center space-x-2 p-2 bg-white rounded border border-red-200 hover:border-red-300 transition-colors duration-200"
                  >
                    <Phone className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="font-medium text-red-800">Emergency</div>
                      <div className="text-red-600">Call 911</div>
                    </div>
                  </a>
                  <a 
                    href="sms:741741" 
                    className="flex items-center space-x-2 p-2 bg-white rounded border border-red-200 hover:border-red-300 transition-colors duration-200"
                  >
                    <Phone className="w-4 h-4 text-red-600" />
                    <div>
                      <div className="font-medium text-red-800">Crisis Text</div>
                      <div className="text-red-600">Text 741741</div>
                    </div>
                  </a>
                </div>
                <button
                  onClick={() => setShowEmergencyResources(false)}
                  className="mt-3 text-sm text-red-700 hover:text-red-800 font-medium"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-soft overflow-hidden">
          {/* Messages */}
          <div className="h-96 md:h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-br from-primary-500 to-secondary-500' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>

                {/* Message */}
                <div className={`flex-1 max-w-xs md:max-w-md ${
                  message.type === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`inline-block p-3 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : message.isEmergency
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                      : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className={`text-xs text-neutral-500 dark:text-neutral-400 mt-1 ${
                    message.type === 'user' ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-neutral-100 dark:bg-neutral-700 rounded-2xl p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-neutral-200 dark:border-neutral-700 p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 input-field"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Reminder</p>
              <p>
                This AI assistant provides supportive guidance but is not a substitute for professional mental health care. 
                If you're experiencing severe distress or having thoughts of self-harm, please reach out to a mental health 
                professional or emergency services immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setInputMessage("I'm feeling anxious and need some coping strategies")}
            className="p-4 bg-white rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left"
          >
            <div className="font-medium text-neutral-800 mb-1">Anxiety Help</div>
            <div className="text-sm text-neutral-600">Get coping strategies for anxiety</div>
          </button>
          
          <button
            onClick={() => setInputMessage("I'm feeling overwhelmed with my studies and need advice")}
            className="p-4 bg-white rounded-lg border border-neutral-200 hover:border-secondary-300 hover:bg-secondary-50 transition-all duration-200 text-left"
          >
            <div className="font-medium text-neutral-800 mb-1">Academic Stress</div>
            <div className="text-sm text-neutral-600">Manage study-related stress</div>
          </button>
          
          <button
            onClick={() => setInputMessage("I need some motivation and positive encouragement")}
            className="p-4 bg-white rounded-lg border border-neutral-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left"
          >
            <div className="font-medium text-neutral-800 mb-1">Motivation</div>
            <div className="text-sm text-neutral-600">Get encouragement and support</div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
