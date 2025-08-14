import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { IonIcon } from '@ionic/react';
import { send, close } from 'ionicons/icons';
import './ChatWidget.css';

const ChatWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Use useMemo for initial messages to prevent recreation on re-renders
  const initialMessages = React.useMemo(() => [
    { 
      id: 'welcome',
      sender: { 
        id: 'system',
        firstName: 'System',
        role: 'system'
      }, 
      text: 'Welcome to the admin support chat! How can we help you today?',
      timestamp: new Date(),
      status: 'sent'
    },
  ], []);
  
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const chatboxRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingEmit = useRef(0);

  // Memoize socket handlers to prevent recreation on re-renders
  const socketHandlers = useRef({});

  useEffect(() => {
    // Only initialize socket if user is authenticated and has the right role
    if (!user || !['admin', 'super_admin'].includes(user.role)) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }

    // Initialize socket connection with auth token
    const socket = io('http://localhost:5000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'], // Force WebSocket transport only
    });
    
    socketRef.current = socket;

    // Define handlers once
    if (!socketHandlers.current.initialized) {
      socketHandlers.current = {
        initialized: true,
        onConnect: () => {
        },
        onConnectError: (err) => {
          console.error('Socket connection error:', err.message);
        },
        onMessage: (message) => {
          setMessages(prev => {
            // Create a unique ID for the message if it doesn't have one
            const messageWithId = {
              ...message,
              id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              status: 'sent'
            };
            
            // Prevent duplicate messages
            if (!prev.some(m => m.id === messageWithId.id || 
                (m.sender.id === messageWithId.sender.id && 
                 m.text === messageWithId.text && 
                 Math.abs(new Date(m.timestamp) - new Date(messageWithId.timestamp)) < 1000))) {
              return [...prev, messageWithId];
            }
            return prev;
          });
        },
        onReconnectAttempt: (attempt) => {
        },
        onReconnectError: (error) => {
          console.error('Reconnection error:', error);
        },
        onTyping: (data) => {
          if (data.userId !== user.id) {
            setTypingUser(data.userName);
            setIsTyping(true);
            
            typingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
              setTypingUser(null);
            }, 2000);
          }
        }
      };
    }

    // Set up event listeners
    const { 
      onConnect, 
      onConnectError, 
      onMessage, 
      onReconnectAttempt, 
      onReconnectError,
      onTyping
    } = socketHandlers.current;

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('chat message', onMessage);
    socket.on('reconnect_attempt', onReconnectAttempt);
    socket.on('reconnect_error', onReconnectError);
    socket.on('typing', onTyping);

    // Clean up the connection when the component unmounts
    return () => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onConnectError);
      socket.off('chat message', onMessage);
      socket.off('reconnect_attempt', onReconnectAttempt);
      socket.off('reconnect_error', onReconnectError);
      socket.off('typing', onTyping);
      
      if (socket.connected) {
        socket.disconnect();
      }
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [user]);

  useEffect(() => {
    // Scroll to the bottom of the chatbox when new messages are added
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = useCallback(() => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    // Focus input when opening chat
    if (newState && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Wait for animation to complete
    }
  }, [isOpen]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    const messageText = newMessage.trim();
    if (messageText === '' || !socketRef.current?.connected) {
      console.error('Cannot send message - socket not connected');
      return;
    }

    // Generate a unique ID for the message
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date();
    
    const userMessage = {
      id: messageId,
      text: messageText,
      sender: {
        id: user.id,
        firstName: user.firstName,
        role: user.role,
      },
      timestamp,
      status: 'sending'
    };
    
    // Optimistic UI update
    setNewMessage('');
    setMessages(prev => [...prev, userMessage]);
    
    // Clear any typing indicators
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Send the message to the server with a timeout
    const sendTimeout = setTimeout(() => {
      console.error('Message send timeout');
      setMessages(prev => prev.map(m => 
        m.id === messageId && m.status === 'sending'
          ? { ...m, status: 'failed' }
          : m
      ));
    }, 10000); // 10 second timeout

    try {
      // Send just the message text as a string
      socketRef.current.emit('chat message', messageText, (acknowledgement) => {
        clearTimeout(sendTimeout);
        
        setMessages(prev => prev.map(m => {
          if (m.id !== messageId) return m;
          
          if (acknowledgement?.status === 'error') {
            console.error('Failed to send message:', acknowledgement.message);
            return { ...m, status: 'failed' };
          } else if (acknowledgement?.messageId) {
            // Server might have assigned a different ID
            return { ...m, id: acknowledgement.messageId, status: 'sent' };
          }
          return { ...m, status: 'sent' };
        }));
      });
    } catch (error) {
      console.error('Error sending message:', error);
      clearTimeout(sendTimeout);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, status: 'failed' } : m
      ));
    }
  }, [newMessage, user]);

  // Throttle typing indicator to reduce server load
  
  const handleKeyDown = useCallback((e) => {
    // Send message on Enter (but allow Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    } else {
      const now = Date.now();
      // Only emit typing event every 2 seconds to reduce load
      if (socketRef.current?.connected && now - lastTypingEmit.current > 2000) {
        socketRef.current.emit('typing', {
          userId: user.id,
          userName: user.firstName || 'Someone'
        });
        lastTypingEmit.current = now;
      }
      
      // Set a timeout to stop showing typing indicator after 3 seconds of inactivity
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      } else {
        setIsTyping(true);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        typingTimeoutRef.current = null;
      }, 3000);
    }
  }, [handleSendMessage, user]);

  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages, typingUser]);

  // Listen for typing indicators
  useEffect(() => {
    if (!socketRef.current) return;

    const handleTyping = (typingData) => {
      if (typingData.userId !== user.id) {
        setTypingUser(typingData.firstName);
        setIsTyping(true);
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        // Hide typing indicator after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          setTypingUser(null);
        }, 3000);
      }
    };

    socketRef.current.on('user typing', handleTyping);
    
    return () => {
      if (socketRef.current) {
        socketRef.current.off('user typing', handleTyping);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messages, user.id, handleSendMessage]);

  const messageList = messages.map((msg) => {
    const isUserMessage = msg.sender.id === user.id;
    return (
      <div key={msg.id} className={`chat-message ${isUserMessage ? 'user' : 'bot'}`}>
        {!isUserMessage && (
          <div className="message-sender">
            {msg.sender.firstName || 'Support'}
          </div>
        )}
        <p>{msg.text}</p>
        <div className="timestamp">
          {formatTimestamp(msg.timestamp)}
        </div>
        {isUserMessage && msg.status === 'sending' && (
          <div className="message-status">Sending...</div>
        )}
        {isUserMessage && msg.status === 'failed' && (
          <div className="message-status error">
            Failed to send. <button onClick={() => handleSendMessage({ preventDefault: () => {} })}>Retry</button>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="chat-widget">
    <div 
      className={`chat-icon ${isOpen ? 'open' : ''}`} 
      onClick={toggleChat}
      title={isOpen ? 'Close chat' : 'Open chat'}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && toggleChat()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      {!isOpen && messages.some(m => m.status === 'unread') && (
        <span className="unread-badge" aria-label="Unread messages"></span>
      )}
    </div>

    <div className={`chat-window ${isOpen ? 'visible' : ''}`}>
      <div className="chat-header">
        <div className="chat-header-content">
          <h3>Support Chat</h3>
          <p>{user.role === 'super_admin' ? 'Admin' : 'Support Team'}</p>
        </div>
        <button 
          onClick={toggleChat} 
          className="close-btn" 
          aria-label="Close chat"
          type="button"
        >
          <IonIcon icon={close} />
        </button>
      </div>
      
      <div className="chat-box" ref={chatboxRef}>
        {messageList}
        
        {isTyping && typingUser && (
          <div className="chat-message bot">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
              <div className="typing-text">{typingUser} is typing...</div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="chat-input-container">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="chat-input"
          ref={inputRef}
          disabled={!socketRef.current?.connected}
          aria-label="Type a message"
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!newMessage.trim() || !socketRef.current?.connected}
          aria-label="Send message"
        >
          <IonIcon icon={send} />
        </button>
      </form>
    </div>
  </div>
);

};

export default ChatWidget;
