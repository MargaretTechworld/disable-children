import React from 'react';
import Modal from './Modal';
import './DeleteConfirmationModal.css';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, childName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
      <div className="delete-confirmation-content">
        <p>Are you sure you want to delete the record for <strong>{childName}</strong>?</p>
        <p>This action cannot be undone.</p>
        <div className="delete-confirmation-actions">
          <button onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button onClick={onConfirm} className="delete-button">
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
