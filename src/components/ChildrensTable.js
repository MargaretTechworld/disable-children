import React from 'react';
import { IonIcon } from '@ionic/react';
import { eyeOutline, createOutline, trashOutline } from 'ionicons/icons';

const childrenData = [
  {
    firstName: 'John',
    lastName: 'Doe',
    gender: 'Male',
    disabilityType: 'Autism Spectrum Disorder',
    parentsContact: 'john.doe@example.com',
    severity: 'Moderate'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    gender: 'Female',
    disabilityType: 'Cerebral Palsy',
    parentsContact: 'jane.smith@example.com',
    severity: 'Severe'
  },
  {
    firstName: 'Mike',
    lastName: 'Johnson',
    gender: 'Male',
    disabilityType: 'Down Syndrome',
    parentsContact: 'mike.johnson@example.com',
    severity: 'Mild'
  },
  {
    firstName: 'Emily',
    lastName: 'Davis',
    gender: 'Female',
    disabilityType: 'Speech Impairment',
    parentsContact: 'emily.davis@example.com',
    severity: 'Moderate'
  },
  {
    firstName: 'Sarah',
    lastName: 'Brown',
    gender: 'Female',
    disabilityType: 'Visual Impairment',
    parentsContact: 'sarah.brown@example.com',
    severity: 'Severe'
  },
  {
    firstName: 'Alex',
    lastName: 'Wilson',
    gender: 'Non-binary',
    disabilityType: 'Hearing Impairment',
    parentsContact: 'alex.wilson@example.com',
    severity: 'Mild'
  }
];

const ChildrensTable = ({ children }) => {
  const dataToDisplay = children || childrenData;

  return (
    <div className="recentOrders">
      <div className="cardHeader">
        <h2>Children with Disabilities</h2>
        <a href="#" className="btn">View All</a>
      </div>
      <table>
        <thead>
          <tr>
            <td>First Name</td>
            <td>Last Name</td>
            <td>Gender</td>
            <td>Disability Type</td>
            <td>Parent's Contact</td>
            <td>Severity</td>
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          {dataToDisplay.map((child, idx) => (
            <tr key={idx}>
              <td>{child.firstName}</td>
              <td>{child.lastName}</td>
              <td>{child.gender}</td>
              <td>{child.disabilityType}</td>
              <td>{child.parentsContact}</td>
              <td>{child.severity}</td>
              <td className="actions">
                <a href="#"><IonIcon icon={eyeOutline} /></a>
                <a href="#"><IonIcon icon={createOutline} /></a>
                <a href="#"><IonIcon icon={trashOutline} /></a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChildrensTable;