import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { messages as mockMessages, users } from '../data/mockData';

const ComposeMessage = ({ user }) => {
  const navigate = useNavigate();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Only super-admin can compose
  if (user.role !== 'super-admin') {
    navigate('/dashboard/messages');
    return null;
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!to || !subject.trim() || !body.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    const newMessage = {
      id: mockMessages.length + 1,
      from: user.email,
      to,
      subject,
      body,
      timestamp: new Date().toISOString(),
      read: false,
    };

    mockMessages.push(newMessage);
    alert('Message sent!');
    navigate('/dashboard/messages');
  };

  const adminUsers = Object.entries(users).filter(([email, u]) => u.role === 'admin');

  return (
    <div className="compose-container">
      <h2>Compose New Message</h2>
      <form onSubmit={handleSend} className="compose-form">
        <select value={to} onChange={(e) => setTo(e.target.value)} required>
          <option value="">Select a recipient...</option>
          {adminUsers.map(([email, admin]) => (
            <option key={email} value={email}>{admin.name}</option>
          ))}
        </select>
        <input 
          type="text" 
          placeholder="Subject" 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
          required
        />
        <textarea 
          placeholder="Message body..." 
          value={body} 
          onChange={(e) => setBody(e.target.value)} 
          rows="10"
          required
        />
        <div className="form-actions">
          <button type="button" onClick={() => navigate('/dashboard/messages')}>Cancel</button>
          <button type="submit">Send</button>
        </div>
      </form>
    </div>
  );
};

export default ComposeMessage;
