import React, { useState } from 'react';
import '../styles/ChildForm.css';

const ChildForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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
    disabilitySeverity: '',
    specialNeeds: '',
    // Medical Information
    primaryCareProvider: '',
    medicalConditions: '',
    medications: '',
    allergies: '',
    medicalDocuments: null,
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
    profilePicture: null,
    additionalNotes: '',
    // Signature
    parentSignature: '',
    date: '',
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleChange = input => e => {
    setFormData({ ...formData, [input]: e.target.value });
  };

  const handleFileChange = input => e => {
    setFormData({ ...formData, [input]: e.target.files[0] });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-group">
            <h2>1. Child's Information</h2>
            <input type="text" placeholder="First Name" value={formData.childFirstName} onChange={handleChange('childFirstName')} />
            <input type="text" placeholder="Middle Name" value={formData.childMiddleName} onChange={handleChange('childMiddleName')} />
            <input type="text" placeholder="Last Name" value={formData.childLastName} onChange={handleChange('childLastName')} />
            <input type="date" placeholder="Date of Birth" value={formData.dob} onChange={handleChange('dob')} />
            <select value={formData.gender} onChange={handleChange('gender')}>
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            <textarea placeholder="Home Address (Street, City, State, ZIP Code)" value={formData.address} onChange={handleChange('address')} />
          </div>
        );
      case 2:
        return (
          <div className="form-group">
            <h2>2. Parent/Guardian Information</h2>
            <input type="text" placeholder="First Name" value={formData.parentFirstName} onChange={handleChange('parentFirstName')} />
            <input type="text" placeholder="Last Name" value={formData.parentLastName} onChange={handleChange('parentLastName')} />
            <input type="text" placeholder="Relationship to Child" value={formData.relationship} onChange={handleChange('relationship')} />
            <input type="text" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange('contactNumber')} />
            <input type="email" placeholder="Email Address" value={formData.email} onChange={handleChange('email')} />
          </div>
        );
      case 3:
        return (
          <div className="form-group">
            <h2>3. Disability Information</h2>
            <input type="text" placeholder="Type of Disability" value={formData.disabilityType} onChange={handleChange('disabilityType')} />
            <select value={formData.disabilitySeverity} onChange={handleChange('disabilitySeverity')}>
                <option value="">Select Severity</option>
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="Severe">Severe</option>
            </select>
            <textarea placeholder="Special Needs/Accommodations Required" value={formData.specialNeeds} onChange={handleChange('specialNeeds')} />
          </div>
        );
      case 4:
        return (
          <div className="form-group">
            <h2>4. Medical Information</h2>
            <input type="text" placeholder="Primary Health Care Provider" value={formData.primaryCareProvider} onChange={handleChange('primaryCareProvider')} />
            <textarea placeholder="Medical Conditions" value={formData.medicalConditions} onChange={handleChange('medicalConditions')} />
            <textarea placeholder="Current Medications" value={formData.medications} onChange={handleChange('medications')} />
            <textarea placeholder="Allergies" value={formData.allergies} onChange={handleChange('allergies')} />
            <label>Upload Medical Documents/Reports:</label>
            <input type="file" onChange={handleFileChange('medicalDocuments')} />
          </div>
        );
      case 5:
        return (
          <div className="form-group">
            <h2>5. Educational Information</h2>
            <input type="text" placeholder="Current School/Program" value={formData.school} onChange={handleChange('school')} />
            <input type="text" placeholder="Grade Level" value={formData.grade} onChange={handleChange('grade')} />
            <label>Individualized Education Plan (IEP):</label>
            <select value={formData.iep} onChange={handleChange('iep')}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
            </select>
          </div>
        );
      case 6:
        return (
          <div className="form-group">
            <h2>6. Support Services</h2>
            <textarea placeholder="Current Therapies/Services" value={formData.therapies} onChange={handleChange('therapies')} />
            <textarea placeholder="Other Support Services" value={formData.otherSupport} onChange={handleChange('otherSupport')} />
          </div>
        );
      case 7:
        return (
          <div className="form-group">
            <h2>7. Emergency Information</h2>
            <input type="text" placeholder="Emergency Contact Name" value={formData.emergencyContactName} onChange={handleChange('emergencyContactName')} />
            <input type="text" placeholder="Emergency Contact Number" value={formData.emergencyContactNumber} onChange={handleChange('emergencyContactNumber')} />
            <input type="text" placeholder="Alternate Emergency Contact" value={formData.alternateEmergencyContact} onChange={handleChange('alternateEmergencyContact')} />
          </div>
        );
      case 8:
        return (
          <div className="form-group">
            <h2>8. Additional Information & Signature</h2>
            <select value={formData.communicationMethod} onChange={handleChange('communicationMethod')}>
                <option value="">Preferred Communication Method</option>
                <option value="Verbal">Verbal</option>
                <option value="Sign Language">Sign Language</option>
                <option value="Visual Aids">Visual Aids</option>
            </select>
            <label>Upload Profile Picture:</label>
            <input type="file" onChange={handleFileChange('profilePicture')} />
            <textarea placeholder="Additional Notes or Comments" value={formData.additionalNotes} onChange={handleChange('additionalNotes')} />
            <input type="text" placeholder="Parent/Guardian Signature" value={formData.parentSignature} onChange={handleChange('parentSignature')} />
            <input type="date" placeholder="Date" value={formData.date} onChange={handleChange('date')} />
          </div>
        );
      default:
        return (
            <div>
                <h2>Review and Submit</h2>
                <p>Please review your information before submitting.</p>
                {/* You can display a summary of the formData here */}
            </div>
        );
    }
  };

  return (
    <div className="form-container">
      <h1>Basic Information Form ({step}/9)</h1>
      {renderStep()}
      <div className="navigation-buttons">
        {step > 1 && <button onClick={prevStep}>Previous</button>}
        {step < 9 && <button onClick={nextStep}>Next</button>}
        {step === 9 && <button type="submit">Submit</button>}
      </div>
    </div>
  );
};

export default ChildForm;