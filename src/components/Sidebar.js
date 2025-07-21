import React from 'react';
import { IonIcon } from '@ionic/react';
import {
  homeOutline,
  peopleOutline,
  chatbubbleOutline,
  helpOutline,
  settingsOutline,
  logOutOutline,
  add,
} from 'ionicons/icons';

const navItems = [
  { icon: homeOutline, title: 'Dashboard' },
  { icon: add, title: 'Add Child' },
  { icon: peopleOutline, title: 'Manage Children' },
  { icon: chatbubbleOutline, title: 'Messages' },
  { icon: helpOutline, title: 'Help' },
  { icon: settingsOutline, title: 'Settings' },
  { icon: logOutOutline, title: 'Sign Out' },
];

const Sidebar = ({ active, activeView, handleViewChange }) => (
  <div className={`navigation ${active ? 'active' : ''}`}>
    <ul>
      <li>
        <a href="#">
          <span className="icon"><IonIcon icon={peopleOutline} /></span>
          <span className="title">Children's with Disability</span>
        </a>
      </li>
      {navItems.map((item, index) => (
        <li key={index} className={activeView === item.title ? 'hovered' : ''}>
          <a href="#" onClick={() => handleViewChange(item.title)}>
            <span className="icon"><IonIcon icon={item.icon} /></span>
            <span className="title">{item.title}</span>
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default Sidebar;