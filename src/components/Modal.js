import React from 'react';
import './Modal.css';
import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';

const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} className="modal-close-button">
            <IonIcon icon={closeOutline} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
