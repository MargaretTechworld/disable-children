import React, { useState } from 'react';
import axios from 'axios';
import { IonIcon } from '@ionic/react';
import { 
  personOutline, peopleOutline, medicalOutline, schoolOutline, 
  medkitOutline, warningOutline, documentTextOutline, checkmarkCircleOutline,
  arrowBackOutline, arrowForwardOutline
} from 'ionicons/icons';
import '../styles/ChildForm.css';

// Tab configuration
const TABS = [
  { id: 'child', label: 'Child Info', icon: personOutline },
  { id: 'parent', label: 'Parent/Guardian', icon: peopleOutline },
  { id: 'disability', label: 'Disability', icon: medicalOutline },
  { id: 'medical', label: 'Medical', icon: medkitOutline },
  { id: 'education', label: 'Education', icon: schoolOutline },
  { id: 'emergency', label: 'Emergency', icon: warningOutline },
  { id: 'additional', label: 'Additional', icon: documentTextOutline },
];

const ChildForm = () => {
  // Define disability types that match the backend
  const DISABILITY_TYPES = [
    { value: 'autism', label: 'Autism Spectrum Disorder' },
    { value: 'visual', label: 'Visual Impairment' },
    { value: 'hearing', label: 'Hearing Impairment' },
    { value: 'physical', label: 'Physical Disability' },
    { value: 'intellectual', label: 'Intellectual Disability' },
    { value: 'down-syndrome', label: 'Down Syndrome' },
    { value: 'other', label: 'Other (please specify)' }
  ];

  const initialFormData = {
    // Child's Information
    childFirstName: '',
    childMiddleName: '',
    childLastName: '',
    dob: '',
    gender: '',
    address: '',
    
    // Parent/Guardian Information
    parentFirstName: '',
    parentLastName: '',
    relationship: '',
    contactNumber: '',
    email: '',
    
    // Disability Information
    disabilityType: '',
    disabilityOther: '', // New field for 'Other' disability type
    disabilitySeverity: 'Mild',
    specialNeeds: '',
    
    // Medical Information
    primaryCareProvider: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    
    // Educational Information
    school: '',
    grade: '',
    iep: 'No',
    
    // Support Services
    therapies: '',
    otherSupport: '',
    
    // Emergency Information
    emergencyContactName: '',
    emergencyContactNumber: '',
    alternateEmergencyContact: '',
    
    // Additional Information
    communicationMethod: '',
    additionalNotes: '',
    parentSignature: '',
    date: new Date().toISOString().slice(0, 10),
  };

  const [activeTab, setActiveTab] = useState('child');
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtherDisability, setShowOtherDisability] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle disability type change - check if 'other' was selected
    if (name === 'disabilityType') {
      setShowOtherDisability(value === 'other');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 'Yes' : 'No') : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Email validation is now handled in the validation logic

  // Validate current tab's required fields
  const validateCurrentTab = (tabId = activeTab) => {
    const currentTabFields = REQUIRED_FIELDS[tabId] || [];
    const newErrors = {};
    
    currentTabFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // Special validation for email field
    if (tabId === 'parent' && formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields before continuing.'
      });
      return false;
    }
    
    return true;
  };

  // Handle tab change with validation
  const handleTabChange = (tabId) => {
    // Don't validate if clicking the same tab
    if (tabId === activeTab) return;
    
    // Validate current tab before allowing navigation
    if (!validateCurrentTab()) {
      // If validation fails, don't change tabs
      return;
    }
    
    // Clear any previous error messages
    setSubmitStatus({ type: '', message: '' });
    setErrors({});
    
    // Change to the new tab
    setActiveTab(tabId);
    
    // Scroll to top of form when changing tabs
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle next button click
  const handleNext = () => {
    // Validate current tab before proceeding
    if (!validateCurrentTab()) {
      return;
    }

    // Move to next tab or submit if on last tab
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex < TABS.length - 1) {
      const nextTab = TABS[currentIndex + 1].id;
      setActiveTab(nextTab);
      setSubmitStatus({ type: '', message: '' });
      setErrors({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  // Handle previous button click
  const handlePrevious = () => {
    const currentIndex = TABS.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1].id);
      setSubmitStatus({ type: '', message: '' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Final validation of all required fields
    const newErrors = {};
    Object.values(REQUIRED_FIELDS).flat().forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    // Validate email format if provided
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fill in all required fields correctly before submitting.'
      });
      // Find the first tab with errors and switch to it
      const firstErrorTab = TABS.find(tab => 
        (REQUIRED_FIELDS[tab.id] || []).some(field => newErrors[field])
      );
      if (firstErrorTab) {
        setActiveTab(firstErrorTab.id);
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/children', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        }
      });
      
      setSubmitStatus({
        type: 'success',
        message: 'Child information saved successfully!'
      });
      
      // Reset form after successful submission
      setFormData(initialFormData);
      setActiveTab('child');
    } catch (error) {
      console.error('Error saving child:', error);
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to save child information. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render form field with error handling
  const renderField = (name, label, type = 'text', options = [], required = false) => {
    const isError = !!errors[name];
    const fieldValue = formData[name] || '';
    
    return (
      <div className={`form-group ${isError ? 'has-error' : ''}`}>
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
        {type === 'select' ? (
          <select
            name={name}
            value={fieldValue}
            onChange={handleChange}
            className={isError ? 'error' : ''}
            required={required}
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            value={fieldValue}
            onChange={handleChange}
            className={isError ? 'error' : ''}
            required={required}
          />
        ) : type === 'checkbox' ? (
          <input
            type="checkbox"
            name={name}
            checked={fieldValue === 'Yes'}
            onChange={handleChange}
            className={isError ? 'error' : ''}
            required={required}
          />
        ) : (
          <input
            type={type}
            name={name}
            value={fieldValue}
            onChange={handleChange}
            className={isError ? 'error' : ''}
            required={required}
          />
        )}
        {isError && <div className="error-message">{errors[name]}</div>}
      </div>
    );
  };

  // Update the disability tab to use dropdown with 'Other' option
  const renderDisabilityFields = () => (
    <div className="form-grid">
      <div className="form-group">
        <label htmlFor="disabilityType">Type of Disability *</label>
        <select
          id="disabilityType"
          name="disabilityType"
          value={formData.disabilityType}
          onChange={handleChange}
          className={errors.disabilityType ? 'error' : ''}
          required
        >
          <option value="">Select a disability type</option>
          {DISABILITY_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.disabilityType && (
          <span className="error-message">{errors.disabilityType}</span>
        )}
      </div>

      {showOtherDisability && (
        <div className="form-group">
          <label htmlFor="disabilityOther">Please specify *</label>
          <input
            type="text"
            id="disabilityOther"
            name="disabilityOther"
            value={formData.disabilityOther}
            onChange={handleChange}
            className={errors.disabilityOther ? 'error' : ''}
            required={showOtherDisability}
          />
          {errors.disabilityOther && (
            <span className="error-message">{errors.disabilityOther}</span>
          )}
        </div>
      )}

      {renderField('disabilitySeverity', 'Disability Severity', 'select', [
        { value: 'Mild', label: 'Mild' },
        { value: 'Moderate', label: 'Moderate' },
        { value: 'Severe', label: 'Severe' }
      ], true)}
      {renderField('specialNeeds', 'Special Needs', 'textarea')}
    </div>
  );

  // Required fields for validation
  const REQUIRED_FIELDS = {
    child: ['childFirstName', 'childMiddleName', 'childLastName', 'dob', 'gender', 'address'],
    parent: ['parentFirstName', 'parentLastName', 'relationship', 'contactNumber', 'email'],
    disability: ['disabilityType', 'disabilitySeverity'],
    emergency: ['emergencyContactName', 'emergencyContactNumber']
  };

  return (
    <div className="form-container">
      <h1>Add a New Child</h1>
      
      {submitStatus.message && (
        <div className={`alert ${submitStatus.type === 'error' ? 'error' : 'success'}`}>
          {submitStatus.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="tabs-container">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <IonIcon icon={tab.icon} /> {tab.label}
            </button>
          ))}
        </div>
        
        <div className="tabs-content">
          <div className={`tab-pane ${activeTab === 'child' ? 'active' : ''}`}>
            <h3><IonIcon icon={personOutline} /> Child's Information</h3>
            <div className="form-grid">
              {renderField('childFirstName', 'First Name', 'text', [], true)}
              {renderField('childMiddleName', 'Middle Name')}
              {renderField('childLastName', 'Last Name', 'text', [], true)}
              {renderField('dob', 'Date of Birth', 'date', [], true)}
              {renderField('gender', 'Gender', 'select', [
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ], true)}
              {renderField('address', 'Address', 'textarea', [], true)}
            </div>
          </div>
          
          <div className={`tab-pane ${activeTab === 'parent' ? 'active' : ''}`}>
            <h3><IonIcon icon={peopleOutline} /> Parent/Guardian Information</h3>
            <div className="form-grid">
              {renderField('parentFirstName', 'First Name', 'text', [], true)}
              {renderField('parentLastName', 'Last Name', 'text', [], true)}
              {renderField('relationship', 'Relationship to Child', 'text', [], true)}
              {renderField('contactNumber', 'Contact Number', 'tel', [], true)}
              {renderField('email', 'Email', 'email', [], true)}
            </div>
          </div>
          
          <div className={`tab-pane ${activeTab === 'disability' ? 'active' : ''}`}>
            <h3><IonIcon icon={medicalOutline} /> Disability Information</h3>
            {renderDisabilityFields()}
          </div>
          
          <div className={`tab-pane ${activeTab === 'medical' ? 'active' : ''}`}>
            <h3><IonIcon icon={medkitOutline} /> Medical Information</h3>
            <div className="form-grid">
              {renderField('primaryCareProvider', 'Primary Care Provider')}
              {renderField('medicalConditions', 'Medical Conditions', 'textarea')}
              {renderField('medications', 'Current Medications', 'textarea')}
              {renderField('allergies', 'Allergies', 'textarea')}
            </div>
          </div>
          
          <div className={`tab-pane ${activeTab === 'education' ? 'active' : ''}`}>
            <h3><IonIcon icon={schoolOutline} /> Educational Information</h3>
            <div className="form-grid">
              {renderField('school', 'School Name')}
              {renderField('grade', 'Grade Level')}
              {renderField('iep', 'Has IEP?', 'checkbox')}
            </div>
          </div>
          
          <div className={`tab-pane ${activeTab === 'emergency' ? 'active' : ''}`}>
            <h3><IonIcon icon={warningOutline} /> Emergency Contacts</h3>
            <div className="form-grid">
              {renderField('emergencyContactName', 'Primary Contact Name', 'text', [], true)}
              {renderField('emergencyContactNumber', 'Primary Contact Number', 'tel', [], true)}
              {renderField('alternateEmergencyContact', 'Alternate Contact')}
            </div>
          </div>
          
          <div className={`tab-pane ${activeTab === 'additional' ? 'active' : ''}`}>
            <h3><IonIcon icon={documentTextOutline} /> Additional Information</h3>
            <div className="form-grid">
              {renderField('communicationMethod', 'Preferred Communication Method')}
              {renderField('additionalNotes', 'Additional Notes', 'textarea')}
              {renderField('parentSignature', 'Parent/Guardian Signature', 'text', [], true)}
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <div className="form-actions-left">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setFormData(initialFormData)}
              disabled={isSubmitting}
            >
              Reset Form
            </button>
          </div>
          
          <div className="form-actions-right">
            {TABS.findIndex(tab => tab.id === activeTab) > 0 && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                <IonIcon icon={arrowBackOutline} /> Previous
              </button>
            )}
            
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <IonIcon icon={checkmarkCircleOutline} /> Saving...
                </>
              ) : TABS[TABS.length - 1].id === activeTab ? (
                'Submit Child Information'
              ) : (
                <>
                  Next <IonIcon icon={arrowForwardOutline} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChildForm;