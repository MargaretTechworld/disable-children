import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { messages as mockMessages, users } from '../data/mockData';

const Inbox = ({ user }) => {
  const [userMessages, setUserMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Filter messages where the user is the recipient
    const filtered = mockMessages.filter(msg => msg.to === user.email);
    setUserMessages(filtered);
  }, [user.email]);

  return (
    <div className="inbox-container">
      <div className="inbox-header">
        <h2>Inbox</h2>
        {user.role === 'super-admin' && (
          <button onClick={() => navigate('/dashboard/messages/compose')}>Compose</button>
        )}
      </div>
      <ul className="message-list">
        {userMessages.length > 0 ? (
          userMessages.map(msg => (
            <li key={msg.id} className={msg.read ? 'read' : 'unread'}>
              <Link to={`/dashboard/messages/${msg.id}`}>
                <div className="message-sender">{users[msg.from]?.name || 'Unknown Sender'}</div>
                <div className="message-subject">{msg.subject}</div>
                <div className="message-timestamp">{new Date(msg.timestamp).toLocaleString()}</div>
              </Link>
            </li>
          ))
        ) : (
          <p>No messages found.</p>
        )}
      </ul>
    </div>
  );
};

export default Inbox;
