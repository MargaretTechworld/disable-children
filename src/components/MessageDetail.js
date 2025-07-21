import React, { useState } from 'react';
import { users } from '../data/mockData';

const MessageDetail = ({ message, onBack, onReply, user }) => {
  const [reply, setReply] = useState('');

  const handleReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;

    const newReply = {
      id: Date.now(), // Use a more unique ID
      from: user.email,
      to: message.from,
      subject: `Re: ${message.subject}`,
      body: reply,
      timestamp: new Date().toISOString(),
      read: false,
    };

    onReply(newReply);
    setReply('');
  };

  if (!message) {
    return <div>Message not found.</div>;
  }

  return (
    <div className="message-detail-container" style={{padding: '2rem'}}>
      <button onClick={onBack}>&larr; Back to Inbox</button>
      <div className="message-detail-header">
        <h3>{message.subject}</h3>
        <div className="message-meta">
          <strong>From:</strong> {users[message.from]?.name || 'Unknown'}<br />
          <strong>To:</strong> {users[message.to]?.name || 'Unknown'}<br />
          <strong>Date:</strong> {new Date(message.timestamp).toLocaleString()}
        </div>
      </div>
      <div className="message-body">
        <p>{message.body}</p>
      </div>

      <form onSubmit={handleReply} className="reply-form">
        <h4>Reply</h4>
        <textarea 
          value={reply} 
          onChange={(e) => setReply(e.target.value)} 
          placeholder="Type your reply..."
          rows="5"
        />
        <button type="submit">Send Reply</button>
      </form>
    </div>
  );
};

export default MessageDetail;
