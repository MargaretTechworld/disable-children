import React from 'react';
import { IonIcon } from '@ionic/react';
import { menuOutline, searchOutline } from 'ionicons/icons';

const Topbar = ({ toggleSidebar }) => (
  <div className="topbar">
    <div className="toggle" onClick={toggleSidebar}>
      <IonIcon icon={menuOutline} />
    </div>
    <div className="search">
      <label>
        <input type="text" placeholder="Search here" />
        <IonIcon icon={searchOutline} />
      </label>
    </div>
    <div className="user">
      <img src="assets/imgs/customer01.jpg" alt="user" />
    </div>
  </div>
);

export default Topbar;