import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './EditChildModal.css';

const EditChildModal = ({ isOpen, onClose, onUpdate, child }) => {
  const [formData, setFormData] = useState({});
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    if (child) {
      // Format dates for the input fields
      const formattedChild = {
        ...child,
        dob: child.dob ? new Date(child.dob).toISOString().split('T')[0] : '',
        date: child.date ? new Date(child.date).toISOString().split('T')[0] : ''
      };
      setFormData(formattedChild);
    } else {
      setFormData({});
    }
  }, [child]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const renderSection = () => {
    switch(activeSection) {
      case 'basic':
        return (
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" name="childFirstName" value={formData.childFirstName || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Middle Name</label>
                <input type="text" name="childMiddleName" value={formData.childMiddleName || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" name="childLastName" value={formData.childLastName || ''} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth *</label>
                <input type="date" name="dob" value={formData.dob || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select name="gender" value={formData.gender || ''} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="form-group full-width">
              <label>Address</label>
              <input type="text" name="address" value={formData.address || ''} onChange={handleChange} />
            </div>
          </div>
        );

      case 'disability':
        return (
          <div className="form-section">
            <h3>Disability Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Disability Type *</label>
                <input type="text" name="disabilityType" value={formData.disabilityType || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Severity</label>
                <select name="disabilitySeverity" value={formData.disabilitySeverity || ''} onChange={handleChange}>
                  <option value="">Select Severity</option>
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>
            </div>
            <div className="form-group full-width">
              <label>Special Needs</label>
              <textarea name="specialNeeds" value={formData.specialNeeds || ''} onChange={handleChange} rows="3" />
            </div>
          </div>
        );

      case 'parent':
        return (
          <div className="form-section">
            <h3>Parent/Guardian Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" name="parentFirstName" value={formData.parentFirstName || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" name="parentLastName" value={formData.parentLastName || ''} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Relationship to Child *</label>
                <input type="text" name="relationship" value={formData.relationship || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Contact Number *</label>
                <input type="tel" name="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="form-group full-width">
              <label>Email Address *</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
            </div>
          </div>
        );

      case 'medical':
        return (
          <div className="form-section">
            <h3>Medical Information</h3>
            <div className="form-group">
              <label>Primary Care Provider</label>
              <input type="text" name="primaryCareProvider" value={formData.primaryCareProvider || ''} onChange={handleChange} />
            </div>
            
            <div className="form-group">
              <label>Medical Conditions</label>
              <textarea name="medicalConditions" value={formData.medicalConditions || ''} onChange={handleChange} rows="2" />
            </div>
            
            <div className="form-group">
              <label>Medications</label>
              <textarea name="medications" value={formData.medications || ''} onChange={handleChange} rows="2" />
            </div>
            
            <div className="form-group">
              <label>Allergies</label>
              <textarea name="allergies" value={formData.allergies || ''} onChange={handleChange} rows="2" />
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="form-section">
            <h3>Educational Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>School</label>
                <input type="text" name="school" value={formData.school || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Grade</label>
                <input type="text" name="grade" value={formData.grade || ''} onChange={handleChange} />
              </div>
            </div>
            
            <div className="form-group">
              <label>IEP (Individualized Education Program)</label>
              <textarea name="iep" value={formData.iep || ''} onChange={handleChange} rows="2" />
            </div>
          </div>
        );

      case 'emergency':
        return (
          <div className="form-section">
            <h3>Emergency Contacts</h3>
            <div className="form-group">
              <label>Primary Emergency Contact Name</label>
              <input type="text" name="emergencyContactName" value={formData.emergencyContactName || ''} onChange={handleChange} />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Primary Emergency Phone</label>
                <input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Alternate Emergency Contact</label>
                <input type="text" name="alternateEmergencyContact" value={formData.alternateEmergencyContact || ''} onChange={handleChange} />
              </div>
            </div>
            
            <div className="form-group">
              <label>Preferred Communication Method</label>
              <select name="communicationMethod" value={formData.communicationMethod || ''} onChange={handleChange}>
                <option value="">Select Method</option>
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Child Record" className="edit-child-modal">
      <form onSubmit={handleSubmit} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        maxHeight: '80vh',
        overflow: 'hidden'
      }}>
        <div className="form-navigation">
          <button type="button" className={activeSection === 'basic' ? 'active' : ''} onClick={() => setActiveSection('basic')}>
            Basic Info
          </button>
          <button type="button" className={activeSection === 'disability' ? 'active' : ''} onClick={() => setActiveSection('disability')}>
            Disability
          </button>
          <button type="button" className={activeSection === 'parent' ? 'active' : ''} onClick={() => setActiveSection('parent')}>
            Parent Info
          </button>
          <button type="button" className={activeSection === 'medical' ? 'active' : ''} onClick={() => setActiveSection('medical')}>
            Medical
          </button>
          <button type="button" className={activeSection === 'education' ? 'active' : ''} onClick={() => setActiveSection('education')}>
            Education
          </button>
          <button type="button" className={activeSection === 'emergency' ? 'active' : ''} onClick={() => setActiveSection('emergency')}>
            Emergency
          </button>
        </div>
        
        <div style={{
          flex: '1 1 auto',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '0 20px 20px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#adb5bd #f1f3f5',
          minHeight: '200px' // Ensure minimum height for scroll
        }}>
          {renderSection()}
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn btn-cancel">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Update Record
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditChildModal;
