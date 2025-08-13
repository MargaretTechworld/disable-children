import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IonIcon } from '@ionic/react';
import { eyeOutline, createOutline, trashOutline } from 'ionicons/icons';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import EditChildModal from './EditChildModal';
import ViewChildModal from './ViewChildModal';

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
};

const thStyle = {
  backgroundColor: '#f2f2f2',
  padding: '12px',
  border: '1px solid #ddd',
  textAlign: 'left',
};

const tdStyle = {
  padding: '12px',
  border: '1px solid #ddd',
};

const actionIconStyle = {
  cursor: 'pointer',
  margin: '0 5px',
  fontSize: '18px',
};

const ChildList = () => {
  const [children, setChildren] = useState([]);
  const [error, setError] = useState('');
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { 
          headers: { 'x-auth-token': token },
          params: { limit: 10 } // Limit to 10 most recent
        };
        const res = await axios.get('http://localhost:5000/api/children', config);
        setChildren(res.data);
      } catch (err) {
        setError('Failed to fetch children. Please make sure the backend server is running.');
        console.error(err);
      }
    };

    fetchChildren();
  }, []);

  const handleCloseModals = () => {
    setDeleteModalOpen(false);
    setEditModalOpen(false);
    setViewModalOpen(false);
    setSelectedChild(null);
  };

  const handleViewClick = (child) => {
    setSelectedChild(child);
    setViewModalOpen(true);
  };

  const handleEditClick = (child) => {
    setSelectedChild(child);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (child) => {
    setSelectedChild(child);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedChild) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      await axios.delete(`http://localhost:5000/api/children/${selectedChild.id}`, config);
      setChildren(children.filter(child => child.id !== selectedChild.id));
      handleCloseModals();
    } catch (err) {
      setError('Failed to delete child record.');
      console.error(err);
    }
  };

  const handleConfirmUpdate = async (updatedData) => {
    if (!selectedChild) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.put(`http://localhost:5000/api/children/${selectedChild.id}`, updatedData, config);
      setChildren(children.map(c => (c.id === selectedChild.id ? res.data : c)));
      handleCloseModals();
    } catch (err) {
      setError('Failed to update child record.');
      console.error(err);
    }
  };

  const handleEditFromView = (child) => {
    handleCloseModals();
    handleEditClick(child);
  };

  const handleDeleteFromView = (child) => {
    handleCloseModals();
    handleDeleteClick(child);
  };

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Recent Children</h2>
      {children.length === 0 ? (
        <p>No children have been registered yet.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Gender</th>
              <th style={thStyle}>Parent</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {children.map((child) => (
              <tr key={child.id}>
                <td style={tdStyle}>{child.childFirstName} {child.childLastName}</td>
                <td style={tdStyle}>{child.gender}</td>
                <td style={tdStyle}>{child.parentFirstName} {child.parentLastName}</td>
                <td style={tdStyle}>{child.email}</td>
                <td style={tdStyle}>
                  <IonIcon icon={eyeOutline} style={actionIconStyle} title="View" onClick={() => handleViewClick(child)} />
                  <IonIcon icon={createOutline} style={actionIconStyle} title="Edit" onClick={() => handleEditClick(child)} />
                  <IonIcon 
                    icon={trashOutline} 
                    style={actionIconStyle} 
                    title="Delete" 
                    onClick={() => handleDeleteClick(child)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <DeleteConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={handleCloseModals}
        onConfirm={handleConfirmDelete}
        childName={selectedChild ? `${selectedChild.childFirstName} ${selectedChild.childLastName}` : ''}
      />
      <EditChildModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseModals}
        onUpdate={handleConfirmUpdate}
        child={selectedChild}
      />
      <ViewChildModal 
        isOpen={isViewModalOpen}
        onClose={handleCloseModals}
        child={selectedChild}
        onEdit={handleEditFromView}
        onDelete={handleDeleteFromView}
      />
    </div>
  );
};

export default ChildList;
