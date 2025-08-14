import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { users } from '../data/mockData';
import '../styles/Messages.css';

const MessagesTable = ({ messages = [], onSelectMessage, user }) => {
  const currentUserEmail = user ? user.email : '';
  const [activeBox, setActiveBox] = useState('inbox');
  const [messageList, setMessageList] = useState([]);
  const [senders, setSenders] = useState({});

  // Fetch all messages for the current user
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        // Fetch both received and sent messages
        const [receivedResponse, sentResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/notifications/received', {
            headers: { 'x-auth-token': token }
          }),
          axios.get('http://localhost:5000/api/notifications/sent', {
            headers: { 'x-auth-token': token }
          })
        ]);

        // Combine and sort messages by date
        const allMessages = [
          ...(receivedResponse.data || []).map(m => ({ ...m, type: 'received' })),
          ...(sentResponse.data || []).map(m => ({ ...m, type: 'sent' }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        setMessageList(allMessages);
        
        // Extract unique sender emails for display names
        const uniqueSenders = {};
        allMessages.forEach(msg => {
          if (msg.from && !uniqueSenders[msg.from]) {
            uniqueSenders[msg.from] = msg.from.split('@')[0];
          }
        });
        setSenders(uniqueSenders);
      } catch (error) {
        console.error('Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      }
    };

    fetchMessages();
  }, [currentUserEmail]);

  // Filter messages based on active tab
  const userMessages = activeBox === 'inbox' 
    ? (Array.isArray(messageList) ? messageList : []).filter(msg => msg.to === currentUserEmail)
    : (Array.isArray(messageList) ? messageList : []).filter(msg => msg.from === currentUserEmail);

  // Format date to show time if today, or date if older
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // Older than today - show date
    return date.toLocaleDateString();
  };

  // Get display name for a message
  const getDisplayName = (email, isInbox) => {
    if (isInbox) {
      return senders[email] || email || 'System';
    }
    // For sent messages, show recipient's email
    return email || 'Unknown Recipient';
  };

  return (
    <div className="details">
      <div className="recentOrders">
        <div className="cardHeader">
          <h2>Messages</h2>
          <div className="message-nav">
            <button 
              className={`message-tab ${activeBox === 'inbox' ? 'active' : ''}`}
              onClick={() => setActiveBox('inbox')}
            >
              <span className="tab-icon">📥</span>
              <span>Inbox</span>
              {messageList.some(m => !m.read && m.to === currentUserEmail) && (
                <span className="unread-badge">
                  {messageList.filter(m => !m.read && m.to === currentUserEmail).length}
                </span>
              )}
            </button>
            <button 
              className={`message-tab ${activeBox === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveBox('sent')}
            >
              <span className="tab-icon">📤</span>
              <span>Sent</span>
            </button>
          </div>
        </div>
        <div className="message-list-container">
          <table className="message-table">
            <thead>
              <tr>
                <th>{activeBox === 'inbox' ? 'From' : 'To'}</th>
                <th>Subject</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {userMessages.length > 0 ? (
                userMessages.map(msg => (
                  <tr 
                    key={msg.id} 
                    className={`message-row ${!msg.read && activeBox === 'inbox' ? 'unread' : ''}`}
                    onClick={() => onSelectMessage(msg.id)}
                  >
                    <td className="message-sender">
                      {getDisplayName(activeBox === 'inbox' ? msg.from : msg.to, activeBox === 'inbox')}
                    </td>
                    <td className="message-subject">
                      <span className="subject-text">{msg.subject || '(No subject)'}</span>
                      {activeBox === 'sent' && msg.recipientCount > 1 && (
                        <span className="recipient-count">({msg.recipientCount})</span>
                      )}
                    </td>
                    <td className="message-date" title={new Date(msg.date).toLocaleString()}>
                      {formatDate(msg.date)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-messages">
                    <div className="empty-state">
                      <span className="empty-icon">
                        {activeBox === 'inbox' ? '📭' : '📤'}
                      </span>
                      <p>No {activeBox === 'inbox' ? 'inbox' : 'sent'} messages found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MessagesTable;