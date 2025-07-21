import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Inbox from './Inbox';
import MessageDetail from './MessageDetail';
import ComposeMessage from './ComposeMessage';
import '../styles/Messages.css';

const MessagesLayout = ({ user }) => {
  return (
    <div className="messages-layout">
      <Routes>
        <Route index element={<Inbox user={user} />} />
        <Route path="compose" element={<ComposeMessage user={user} />} />
        <Route path=":messageId" element={<MessageDetail user={user} />} />
      </Routes>
    </div>
  );
};

export default MessagesLayout;
