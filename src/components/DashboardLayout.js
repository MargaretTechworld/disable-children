import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Cards from './Cards';
import ChildrensTable from './ChildrensTable';
import Help from './Help';
import MessagesTable from './MessagesTable';
import Settings from './Settings';
import ChildForm from './ChildForm';
import MessageDetail from './MessageDetail';
import ManageChildrenView from './ManageChildrenView';
import { messages as initialMessages } from '../data/mockData'; 

const DashboardLayout = ({ user, theme, setTheme }) => {
  const [sidebarActive, setSidebarActive] = useState(false);
  const [activeView, setActiveView] = useState('Dashboard');
  const [messages, setMessages] = useState(initialMessages);
  const [selectedMessageId, setSelectedMessageId] = useState(null);

  const toggleSidebar = () => {
    setSidebarActive(!sidebarActive);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setSelectedMessageId(null); // Reset message view when changing main view
  };

  const handleSelectMessage = (messageId) => {
    // Mark the message as read when selected
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    );
    setMessages(updatedMessages);
    setSelectedMessageId(messageId);
  };

  const handleSendReply = (reply) => {
    setMessages(prevMessages => [...prevMessages, reply]);
    setSelectedMessageId(null); // Go back to inbox after replying
  };

  const renderContent = () => {
    if (selectedMessageId) {
      const message = messages.find(m => m.id === selectedMessageId);
      return <MessageDetail message={message} onBack={() => setSelectedMessageId(null)} onReply={handleSendReply} user={user} />;
    }

    switch (activeView) {
      case 'Dashboard':
        return (
          <>
            <Cards />
            <div className="details">
              <ChildrensTable />
            </div>
          </>
        );
      case 'Manage Children':
        return <ManageChildrenView />;
      case 'Messages':
        return (
          <MessagesTable 
            messages={messages} 
            onSelectMessage={handleSelectMessage} 
            user={user}
          />
        );
      case 'Help':
        return <Help />;
      case 'Settings':
        return <Settings user={user} theme={theme} setTheme={setTheme} />;
      case 'Add Child':
        return <ChildForm />;
      default:
        return (
          <>
            <Cards />
            <div className="details">
              <ChildrensTable />
            </div>
          </>
        );
    }
  };

  return (
    <div className="container">
      <Sidebar active={sidebarActive} activeView={activeView} handleViewChange={handleViewChange} />
      <div className={`main ${sidebarActive ? 'active' : ''}`}>
        <Topbar toggleSidebar={toggleSidebar} />
        {renderContent()}
      </div>
    </div>
  );
};

export default DashboardLayout;