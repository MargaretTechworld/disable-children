import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Grid, 
  TextField, 
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  FormHelperText,
  CircularProgress,
  Alert,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import axios from 'axios';

// Disability options for targeting
const DISABILITY_OPTIONS = [
  { value: 'visual', label: 'Visual Impairment' },
  { value: 'hearing', label: 'Hearing Impairment' },
  { value: 'physical', label: 'Physical Disability' },
  { value: 'intellectual', label: 'Intellectual Disability' },
  { value: 'autism', label: 'Autism Spectrum Disorder' },
  { value: 'down-syndrome', label: 'Down Syndrome' },
  { value: 'other', label: 'Other Disabilities' },
];

// Form validation
const validateForm = (formData) => {
  const errors = {};
  
  if (!formData.title.trim()) {
    errors.title = 'Title is required';
  }
  
  if (!formData.description.trim()) {
    errors.description = 'Description is required';
  }
  
  if (!formData.dateTime) {
    errors.dateTime = 'Date and time is required';
  } else if (new Date(formData.dateTime) < new Date()) {
    errors.dateTime = 'Event date cannot be in the past';
  }
  
  if (formData.targetDisabilities.length === 0) {
    errors.targetDisabilities = 'Select at least one target disability';
  }
  
  return errors;
};

const EventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [activeTab, setActiveTab] = useState(0);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: null,
    location: '',
    targetDisabilities: [],
    status: 'draft'
  });
  
  const [errors, setErrors] = useState({});
  
  // Fetch event data if editing
  useEffect(() => {
    if (id) {
      const fetchEvent = async () => {
        try {
          const response = await axios.get(`/api/events/${id}`);
          const event = response.data.data;
          
          setFormData({
            title: event.title,
            description: event.description,
            dateTime: new Date(event.dateTime),
            location: event.location || '',
            targetDisabilities: event.targetDisabilities || [],
            status: event.status
          });
          
          if (event.status === 'sent') {
            setSubmitStatus({
              type: 'info',
              message: 'This event has been published. Some fields cannot be modified.'
            });
          }
          
        } catch (error) {
          console.error('Error fetching event:', error);
          setSubmitStatus({
            type: 'error',
            message: 'Failed to load event data. Please try again.'
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchEvent();
    }
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const handleDateTimeChange = (date) => {
    setFormData(prev => ({
      ...prev,
      dateTime: date
    }));
    
    if (errors.dateTime) {
      setErrors(prev => ({
        ...prev,
        dateTime: undefined
      }));
    }
  };
  
  const handleDisabilityChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      targetDisabilities: value
    }));
    
    if (errors.targetDisabilities) {
      setErrors(prev => ({
        ...prev,
        targetDisabilities: undefined
      }));
    }
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const validateCurrentTab = () => {
    const tabFields = [
      ['title', 'description'],
      ['dateTime', 'location', 'targetDisabilities']
    ];
    
    const currentFields = tabFields[activeTab] || [];
    const currentErrors = {};
    
    currentFields.forEach(field => {
      if (field === 'targetDisabilities' && formData[field].length === 0) {
        currentErrors[field] = 'Select at least one target disability';
      } else if (field === 'dateTime' && !formData[field]) {
        currentErrors[field] = 'Date and time is required';
      } else if (!formData[field] && field !== 'location') {
        currentErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      }
    });
    
    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };
  
  const handleNext = () => {
    if (validateCurrentTab()) {
      setActiveTab(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    setActiveTab(prev => prev - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const formErrors = validateForm(formData);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      // If there are errors, jump to the first tab with errors
      const firstErrorField = Object.keys(formErrors)[0];
      const errorTab = firstErrorField === 'title' || firstErrorField === 'description' ? 0 : 1;
      setActiveTab(errorTab);
      return;
    }
    
    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        dateTime: format(new Date(formData.dateTime), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
      };
      
      let response;
      
      if (id) {
        // Update existing event
        response = await axios.put(`/api/events/${id}`, payload);
      } else {
        // Create new event
        response = await axios.post('/api/events', payload);
      }
      
      setSubmitStatus({
        type: 'success',
        message: `Event ${id ? 'updated' : 'created'} successfully!`
      });
      
      // Redirect to events list after a short delay
      setTimeout(() => {
        navigate('/dashboard/events');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving event:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to save event. Please try again.';
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendNotifications = async () => {
    if (!window.confirm('Are you sure you want to send notifications for this event? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await axios.post(`/api/events/${id}/notify`);
      
      setSubmitStatus({
        type: 'success',
        message: response.data.message || 'Notifications sent successfully!'
      });
      
      // Update the form status
      setFormData(prev => ({
        ...prev,
        status: 'sent'
      }));
      
    } catch (error) {
      console.error('Error sending notifications:', error);
      
      const errorMessage = error.response?.data?.message || 'Failed to send notifications. Please try again.';
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };
  
  const isFormDisabled = formData.status === 'sent';
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card elevation={3}>
        <CardHeader 
          title={id ? 'Edit Event' : 'Create New Event'} 
          titleTypographyProps={{ variant: 'h5' }}
        />
        
        <Divider />
        
        <CardContent>
          {submitStatus.message && (
            <Alert 
              severity={submitStatus.type} 
              sx={{ mb: 3 }}
              onClose={() => setSubmitStatus({ type: '', message: '' })}
            >
              {submitStatus.message}
            </Alert>
          )}
          
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ mb: 3 }}
          >
            <Tab label="Event Details" />
            <Tab label="Targeting & Scheduling" />
          </Tabs>
          
          <Box component="form" onSubmit={handleSubmit}>
            <div hidden={activeTab !== 0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Event Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={!!errors.title}
                    helperText={errors.title}
                    disabled={loading || isFormDisabled}
                    required
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={!!errors.description}
                    helperText={errors.description}
                    disabled={loading || isFormDisabled}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
              </Grid>
            </div>
            
            <div hidden={activeTab !== 1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <DateTimePicker
                    label="Date & Time"
                    value={formData.dateTime}
                    onChange={handleDateTimeChange}
                    disabled={loading || isFormDisabled}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        error={!!errors.dateTime}
                        helperText={errors.dateTime}
                        required
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location (Optional)"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={loading || isFormDisabled}
                    placeholder="e.g., Online, Main Hall, etc."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl 
                    fullWidth 
                    error={!!errors.targetDisabilities}
                    disabled={loading || isFormDisabled}
                  >
                    <InputLabel>Target Disabilities *</InputLabel>
                    <Select
                      multiple
                      name="targetDisabilities"
                      value={formData.targetDisabilities}
                      onChange={handleDisabilityChange}
                      renderValue={(selected) => selected.map(val => 
                        DISABILITY_OPTIONS.find(opt => opt.value === val)?.label
                      ).join(', ')}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                          },
                        },
                      }}
                      required
                    >
                      {DISABILITY_OPTIONS.map((disability) => (
                        <MenuItem key={disability.value} value={disability.value}>
                          <Checkbox checked={formData.targetDisabilities.includes(disability.value)} />
                          <ListItemText primary={disability.label} />
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.targetDisabilities && (
                      <FormHelperText>{errors.targetDisabilities}</FormHelperText>
                    )}
                    <FormHelperText>
                      Select the disabilities this event is relevant for
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </div>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                onClick={activeTab === 0 ? () => navigate('/dashboard/events') : handleBack}
                disabled={loading}
              >
                {activeTab === 0 ? 'Cancel' : 'Back'}
              </Button>
              
              <Box>
                {activeTab < 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    Next
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleBack}
                      disabled={loading}
                      sx={{ mr: 2 }}
                    >
                      Back
                    </Button>
                    
                    {id && formData.status !== 'sent' && (
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSendNotifications}
                        disabled={loading}
                        sx={{ mr: 2 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Send Notifications'}
                      </Button>
                    )}
                    
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading || isFormDisabled}
                    >
                      {loading ? <CircularProgress size={24} /> : (id ? 'Update Event' : 'Create Event')}
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default EventForm;
