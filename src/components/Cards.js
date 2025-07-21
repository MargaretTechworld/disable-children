import React from 'react';
import { IonIcon } from '@ionic/react';
import {  peopleOutline, cashOutline, add} from 'ionicons/icons';


const stats = [
  { number: 'Add', label: 'New Child', icon: add },
  { number: '80', label: 'Total Children', icon:  peopleOutline,},
  { number: '284', label: 'Male', icon:  peopleOutline },
  { number: '284', label: 'Female', icon: peopleOutline  },
];

const Cards = () => (
  <div className="cardBox">
    {stats.map((item, i) => (
      <div className="card" key={i}>
        <div>
          <div className="numbers">{item.number}</div>
          <div className="cardName">{item.label}</div>
        </div>
        <div className="iconBx">
          <IonIcon icon={item.icon} />
        </div>
      </div>
    ))}
  </div>
);

export default Cards;