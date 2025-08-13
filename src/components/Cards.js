import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IonIcon } from '@ionic/react';
import { peopleOutline, add } from 'ionicons/icons';
import "../styles/Cards.css"

const Cards = () => {
  const [stats, setStats] = useState({
    total: 0,
    male: 0,
    female: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        const config = { headers: { 'x-auth-token': token } };
        const response = await axios.get('http://localhost:5000/api/children', config);
        const children = response.data;

        const maleCount = children.filter(child => child.gender && child.gender.toLowerCase() === 'male').length;
        const femaleCount = children.filter(child => child.gender && child.gender.toLowerCase() === 'female').length;

        setStats({
          total: children.length,
          male: maleCount,
          female: femaleCount,
        });
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cardData = [
    { number: 'Add', label: 'New Child', icon: add, view: 'Add Child' },
    { number: loading ? '...' : stats.total, label: 'Total Children', icon: peopleOutline },
    { number: loading ? '...' : stats.male, label: 'Male', icon: peopleOutline },
    { number: loading ? '...' : stats.female, label: 'Female', icon: peopleOutline },
  ];

  return (
    <div className="cardBox">
      {cardData.map((item, i) => (
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
};

export default Cards;