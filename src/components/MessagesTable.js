import React, { useState } from 'react';
import { users } from '../data/mockData';
import '../styles/Messages.css';

const MessagesTable = ({ messages, onSelectMessage, user }) => {
  // In a real app, the user object would be passed down properly.
  // For now, we'll assume a default user if it's not provided.
  const currentUserEmail = user ? user.email : '';
  const [activeBox, setActiveBox] = useState('inbox'); // 'inbox' or 'sent'

  const userMessages = activeBox === 'inbox' 
    ? messages.filter(msg => msg.to === currentUserEmail)
    : messages.filter(msg => msg.from === currentUserEmail);

  return (
    <div className="details">
      <div className="recentOrders">
        <div className="cardHeader">
          <h2>Messages</h2>
          <div className="message-nav">
            <button 
              className={activeBox === 'inbox' ? 'active' : ''} 
              onClick={() => setActiveBox('inbox')}
            >
              Inbox
            </button>
            <button 
              className={activeBox === 'sent' ? 'active' : ''} 
              onClick={() => setActiveBox('sent')}
            >
              Sent
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <td>{activeBox === 'inbox' ? 'From' : 'To'}</td>
              <td>Subject</td>
              <td>Date</td>
            </tr>
          </thead>
          <tbody>
            {userMessages.length > 0 ? (
              userMessages.map(msg => (
                <tr 
                  key={msg.id} 
                  onClick={() => onSelectMessage(msg.id)} 
                  style={{ cursor: 'pointer', fontWeight: msg.read ? 'normal' : 'bold' }}
                >
                  <td>{activeBox === 'inbox' ? users[msg.from]?.name || 'Unknown Sender' : users[msg.to]?.name || 'Unknown Recipient'}</td>
                  <td>{msg.subject}</td>
                  <td>{new Date(msg.timestamp).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No messages found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MessagesTable;