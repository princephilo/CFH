import React, { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiCpu } from 'react-icons/fi';
import API from '../../api/axios';
import ReactMarkdown from 'react-markdown';
import './AIChat.css';

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm the Circuit Fix Hub AI Assistant. I can help you diagnose circuit problems, suggest fixes, and explain electronic concepts. What can I help you with?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await API.post('/ai/chat', {
        message: input.trim(),
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.data.reply
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or post your question in the forum for community help!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={`chat-fab ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
        title="AI Assistant"
      >
        <FiCpu />
        <span className="fab-label">AI Help</span>
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <FiCpu className="chat-header-icon" />
              <div>
                <h4>AI Assistant</h4>
                <span className="chat-status">Online</span>
              </div>
            </div>
            <button className="chat-close" onClick={() => setIsOpen(false)}>
              <FiX />
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="message-avatar">
                    <FiCpu />
                  </div>
                )}
                <div className="message-bubble">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message assistant">
                <div className="message-avatar">
                  <FiCpu />
                </div>
                <div className="message-bubble typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your circuit problem..."
              disabled={loading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="chat-send-btn"
            >
              <FiSend />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIChat;