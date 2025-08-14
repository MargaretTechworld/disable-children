import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  AccessibilityNew as AccessibilityNewIcon,
  MedicalServices as MedicalIcon,
  School as SchoolIcon,
  ContactPhone as ContactIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { CircularProgress, Fade } from '@mui/material';

const EditChildModal = ({ isOpen, onClose, onUpdate, child, isLoading = false }) => {
  const [formData, setFormData] = useState({
    childFirstName: '',
    childMiddleName: '',
    childLastName: '',
    gender: '',
    dob: '',
    disabilityType: '',
    disabilitySeverity: '',
    specialNeeds: '',
    medicalHistory: '',
    schoolName: '',
    gradeLevel: '',
    educationalNeeds: '',
    parentFirstName: '',
    parentMiddleName: '',
    parentLastName: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });
  
  const [activeSection, setActiveSection] = useState('basic');
  const [errors, setErrors] = useState({});
  
  // Tab configuration
  const tabs = [
    { value: 'basic', label: 'Basic Info', icon: <PersonIcon fontSize="small" /> },
    { value: 'disability', label: 'Disability', icon: <AccessibilityNewIcon fontSize="small" /> },
    { value: 'medical', label: 'Medical', icon: <MedicalIcon fontSize="small" /> },
    { value: 'education', label: 'Education', icon: <SchoolIcon fontSize="small" /> },
    { value: 'parent', label: 'Parent/Guardian', icon: <ContactIcon fontSize="small" /> }
  ];

  useEffect(() => {
    if (child) {
      // Format dates for the input fields
      const formattedChild = {
        ...formData, // Keep default values for any fields not in child
        ...child,
        dob: child.dob ? new Date(child.dob).toISOString().split('T')[0] : '',
        date: child.date ? new Date(child.date).toISOString().split('T')[0] : ''
      };
      setFormData(formattedChild);
    } else {
      // Reset to default empty values
      setFormData({
        childFirstName: '',
        childMiddleName: '',
        childLastName: '',
        gender: '',
        dob: '',
        disabilityType: '',
        disabilitySeverity: '',
        specialNeeds: '',
        medicalHistory: '',
        schoolName: '',
        gradeLevel: '',
        educationalNeeds: '',
        parentFirstName: '',
        parentMiddleName: '',
        parentLastName: '',
        relationship: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: ''
      });
    }
    setErrors({});
  }, [child]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Define required fields for each section
    const requiredFields = {
      basic: ['childFirstName', 'childLastName', 'gender', 'dob'],
      disability: ['disabilityType'],
      parent: ['parentFirstName', 'parentLastName', 'relationship', 'contactNumber', 'email']
    };
    
    // Check required fields for the current section
    const currentSectionRequired = requiredFields[activeSection] || [];
    
    currentSectionRequired.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = 'This field is required';
      }
    });
    
    // Email validation
    if (activeSection === 'parent' && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Phone number validation
    if (activeSection === 'parent' && formData.contactNumber) {
      const phoneRegex = /^[0-9\-+()\s]{10,}$/;
      if (!phoneRegex.test(formData.contactNumber)) {
        newErrors.contactNumber = 'Please enter a valid phone number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleTabChange = (event, newValue) => {
    // If the form is being submitted, don't change tabs yet
    if (event?.type === 'click' && event?.nativeEvent?.submitter) {
      return;
    }
    
    // If there are errors, don't allow changing tabs
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    setActiveSection(newValue);
  };

  const handleSave = (e) => {
    e?.preventDefault?.();
    
    // Validate current section before saving
    if (!validateForm()) {
      // Scroll to the first error if validation fails
      const firstError = Object.keys(errors)[0];
      if (firstError) {
        const element = document.querySelector(`[name="${firstError}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    // Save the current section's data
    onUpdate(formData);
  };

  const handleNext = (e) => {
    e.preventDefault();
    handleSave(e);
    if (Object.keys(errors).length > 0) return;
    
    const currentTabIndex = tabs.findIndex(tab => tab.value === activeSection);
    if (currentTabIndex < tabs.length - 1) {
      setActiveSection(tabs[currentTabIndex + 1].value);
      const formElement = document.querySelector('.MuiDialogContent-root');
      if (formElement) {
        formElement.scrollTop = 0;
      }
    }
  };

  const renderSection = () => {
    const commonProps = (name, required = false) => ({
      fullWidth: true,
      name,
      value: formData[name] || '',
      onChange: handleChange,
      error: !!errors[name],
      helperText: errors[name],
      size: 'small',
      variant: 'outlined',
      required,
      margin: 'normal'
    });

    const renderTextField = (name, label, required = false, type = 'text') => (
      <TextField
        {...commonProps(name, required)}
        label={label}
        type={type}
        InputLabelProps={type === 'date' ? { shrink: true } : {}}
      />
    );

    const renderSelect = (name, label, options, required = false) => (
      <FormControl fullWidth margin="normal" error={!!errors[name]} required={required}>
        <InputLabel>{label}</InputLabel>
        <Select
          name={name}
          value={formData[name] || ''}
          onChange={handleChange}
          label={label}
          size="small"
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {errors[name] && <FormHelperText>{errors[name]}</FormHelperText>}
      </FormControl>
    );

    const renderTextArea = (name, label, rows = 3) => (
      <TextField
        {...commonProps(name)}
        label={label}
        multiline
        rows={rows}
        variant="outlined"
        fullWidth
        margin="normal"
      />
    );

    switch(activeSection) {
      case 'basic':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                {renderTextField('childFirstName', 'First Name *', true)}
              </Grid>
              <Grid item xs={12} sm={4}>
                {renderTextField('childMiddleName', 'Middle Name')}
              </Grid>
              <Grid item xs={12} sm={4}>
                {renderTextField('childLastName', 'Last Name *', true)}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField('dob', 'Date of Birth *', true, 'date')}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderSelect(
                  'gender',
                  'Gender *',
                  [
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                  ],
                  true
                )}
              </Grid>
              <Grid item xs={12}>
                {renderTextField('address', 'Address')}
              </Grid>
            </Grid>
          </Box>
        );

      case 'disability':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Disability Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                {renderTextField('disabilityType', 'Disability Type *', true)}
              </Grid>
              <Grid item xs={12} sm={4}>
                {renderSelect(
                  'disabilitySeverity',
                  'Severity',
                  [
                    { value: '', label: 'Select Severity' },
                    { value: 'Mild', label: 'Mild' },
                    { value: 'Moderate', label: 'Moderate' },
                    { value: 'Severe', label: 'Severe' }
                  ]
                )}
              </Grid>
              <Grid item xs={12}>
                {renderTextArea('specialNeeds', 'Special Needs')}
              </Grid>
            </Grid>
          </Box>
        );

      case 'parent':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Parent/Guardian Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                {renderTextField('parentFirstName', 'First Name *', true)}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField('parentLastName', 'Last Name *', true)}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField('relationship', 'Relationship to Child *', true)}
              </Grid>
              <Grid item xs={12} sm={6}>
                {renderTextField('contactNumber', 'Contact Number *', true, 'tel')}
              </Grid>
              <Grid item xs={12}>
                {renderTextField('email', 'Email Address *', true, 'email')}
              </Grid>
            </Grid>
          </Box>
        );

      case 'medical':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Medical Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {renderTextField('primaryCareProvider', 'Primary Care Provider')}
              </Grid>
              <Grid item xs={12}>
                {renderTextArea('medicalConditions', 'Medical Conditions')}
              </Grid>
              <Grid item xs={12}>
                {renderTextArea('medications', 'Medications')}
              </Grid>
              <Grid item xs={12}>
                {renderTextArea('allergies', 'Allergies')}
              </Grid>
            </Grid>
          </Box>
        );

      case 'education':
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Educational Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                {renderTextField('school', 'School Name')}
              </Grid>
              <Grid item xs={12} sm={4}>
                {renderTextField('grade', 'Grade Level')}
              </Grid>
              <Grid item xs={12}>
                {renderTextArea('educationalNeeds', 'Educational Needs')}
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'flex-start',
          mt: 8,
          mb: 4
        },
        '& .MuiDialog-paper': {
          borderRadius: '12px',
          minHeight: '80vh',
          maxHeight: '90vh',
          width: '100%',
          maxWidth: '900px',
          m: 0,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        p: 3,
        bgcolor: 'background.paper',
        position: 'sticky',
        top: 0,
        zIndex: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            bgcolor: 'primary.light',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.contrastText'
          }}>
            <PersonIcon />
          </Box>
          <Box>
            <Typography variant="h6" component="div" sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              lineHeight: 1.2
            }}>
              Edit Child Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Update the child's details and click save when done
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose}
          size="small"
          sx={{ 
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'text.primary'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        position: 'sticky',
        top: 76, // Height of the header
        bgcolor: 'background.paper',
        zIndex: 1,
        boxShadow: '0 2px 4px -1px rgba(0,0,0,0.03)'
      }}>
        <Tabs 
          value={activeSection} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              bgcolor: 'primary.main'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              minWidth: 'auto',
              px: 3,
              py: 2,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
                fontWeight: 600
              },
              '&:hover': {
                color: 'primary.main',
                bgcolor: 'action.hover'
              },
              '& .MuiSvgIcon-root': {
                fontSize: '1.25rem',
                mr: 1,
                mb: 0.5
              }
            },
            '& .MuiTabScrollButton-root': {
              color: 'text.secondary',
              '&.Mui-disabled': {
                opacity: 0.5
              }
            }
          }}
        >
          {tabs.map((tab) => (
            <Tab 
              key={tab.value}
              label={tab.label} 
              value={tab.value}
              icon={tab.icon}
              iconPosition="start"
              disableRipple
            />
          ))}
        </Tabs>
      </Box>

      <DialogContent dividers sx={{
        flex: 1,
        p: 0,
        overflowY: 'auto',
        position: 'relative',
        minHeight: 400,
        bgcolor: 'background.default',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '3px',
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.2)',
          },
        },
      }}>
        {isLoading ? (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(2px)',
            zIndex: 1,
            borderRadius: '0 0 12px 12px'
          }}>
            <CircularProgress size={48} thickness={4} sx={{ color: 'primary.main' }} />
          </Box>
        ) : null}

        <form>
          <Box sx={{ 
            opacity: isLoading ? 0.6 : 1, 
            pointerEvents: isLoading ? 'none' : 'auto',
            p: 4
          }}>
            <Fade in={!isLoading} timeout={300}>
              <Box>
                {renderSection()}
                
                <Box sx={{
                  position: 'sticky',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  p: 3,
                  mt: 4,
                  mx: -4,
                  mb: -4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 2,
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: -16,
                    left: 0,
                    right: 0,
                    height: 16,
                    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.03))',
                    pointerEvents: 'none'
                  }
                }}>
                  <Button
                    variant="outlined"
                    onClick={onClose}
                    size="large"
                    disabled={isLoading}
                    sx={{ 
                      minWidth: 120,
                      fontWeight: 500,
                      '&:hover': {
                        borderWidth: '1.5px'
                      }
                    }}
                  >
                    Cancel
                  </Button>

                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2,
                    '& .MuiButton-root': {
                      fontWeight: 500,
                      letterSpacing: '0.3px',
                      textTransform: 'none',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                      }
                    }
                  }}>
                    {tabs.findIndex(tab => tab.value === activeSection) > 0 && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          const currentIndex = tabs.findIndex(tab => tab.value === activeSection);
                          setActiveSection(tabs[currentIndex - 1].value);
                        }}
                        disabled={isLoading}
                        size="large"
                        startIcon={<NavigateBeforeIcon />}
                        sx={{ 
                          minWidth: 140,
                          borderWidth: '1.5px',
                          '&:hover': {
                            borderWidth: '1.5px'
                          }
                        }}
                      >
                        Previous
                      </Button>
                    )}

                    {/* Save Button - Always visible */}
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleSave}
                      disabled={isLoading}
                      startIcon={isLoading ? null : <SaveIcon />}
                      endIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                      sx={{
                        minWidth: 160,
                        px: 3,
                        '&.Mui-disabled': {
                          opacity: 0.7,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText'
                        },
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        }
                      }}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>

                    {/* Next Button - Only show if not on last tab */}
                    {activeSection !== tabs[tabs.length - 1].value && (
                      <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        onClick={handleNext}
                        disabled={isLoading}
                        endIcon={<NavigateNextIcon />}
                        sx={{
                          minWidth: 140,
                          px: 3,
                          '&:hover': {
                            bgcolor: 'secondary.dark',
                          }
                        }}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              </Box>
            </Fade>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditChildModal;
