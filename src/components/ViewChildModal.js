import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  Divider, 
  IconButton, 
  Tooltip, 
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip
} from '@mui/material';
import { 
  Download as DownloadIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  AccessibilityNew as DisabilityIcon,
  MedicalServices as MedicalIcon,
  School as SchoolIcon,
  Support as SupportIcon,
  Emergency as EmergencyIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ViewChildModal = ({ isOpen, onClose, child, onEdit, onDelete }) => {
  if (!isOpen || !child) {
    return null;
  }

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    let yPosition = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    const lineHeight = 7;
    
    // Set default font
    doc.setFont('helvetica');
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(33, 150, 243);
    doc.setFont(undefined, 'bold');
    const title = 'CHILD DETAILED RECORD';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, yPosition);
    
    // Add date
    doc.setFontSize(9);
    doc.setTextColor(100);
    const dateText = `Generated on: ${new Date().toLocaleString()}`;
    doc.text(dateText, margin, yPosition + 10);
    yPosition = 35;
    
    // Helper function to add section
    const addSection = (title) => {
      // Add new page if less than 30mm remaining
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      } else {
        yPosition += 10; // Add space before new section
      }
      
      doc.setFontSize(12);
      doc.setTextColor(33, 150, 243);
      doc.setFont(undefined, 'bold');
      doc.text(title.toUpperCase(), margin, yPosition);
      
      // Add line under section title
      doc.setDrawColor(200);
      doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2);
      
      yPosition += 10; // Space after section title
    };
    
    // Helper function to add field with proper text wrapping
    const addField = (label, value, isImportant = false) => {
      // Start new page if less than 15mm left at bottom
      if (yPosition > pageHeight - 15) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.setFont(undefined, 'bold');
      
      // Calculate label width and position
      const labelText = `${label}: `;
      const labelWidth = doc.getTextWidth(labelText);
      const valueX = margin + labelWidth;
      const valueWidth = contentWidth - labelWidth;
      
      // Print label
      doc.text(labelText, margin, yPosition + 4);
      
      // Set value style
      doc.setFont(undefined, isImportant ? 'bold' : 'normal');
      doc.setTextColor(0);
      
      // Process value text
      const text = value !== undefined && value !== null ? value.toString().trim() : 'N/A';
      
      // Split text into lines that fit within the available width
      const splitText = doc.splitTextToSize(text, valueWidth - 2);
      
      // Print each line of the value
      let yOffset = 0;
      splitText.forEach((line, i) => {
        // Check if we need a new page
        if (yPosition + yOffset > pageHeight - 15) {
          doc.addPage();
          yPosition = 20;
          yOffset = 0;
        }
        doc.text(line, valueX, yPosition + yOffset + 4);
        yOffset += lineHeight;
      });
      
      // Add space after field
      yPosition += Math.max(yOffset, lineHeight) + 2;
    };
    
    // 1. Child Information
    addSection('Child Information');
    addField('Full Name', `${child.childFirstName} ${child.childMiddleName || ''} ${child.childLastName}`, true);
    addField('Date of Birth', formatDate(child.dob));
    addField('Gender', child.gender);
    addField('Address', child.address);
    
    // 2. Parent/Guardian Information
    addSection('Parent/Guardian Information');
    addField('Full Name', `${child.parentFirstName} ${child.parentLastName}`, true);
    addField('Relationship', child.relationship);
    addField('Contact Number', child.contactNumber);
    addField('Email', child.email);
    
    // 3. Disability Information
    addSection('Disability Information');
    addField('Disability Type', child.disabilityType, true);
    addField('Severity', child.disabilitySeverity);
    addField('Special Needs', child.specialNeeds || 'None specified');
    
    // 4. Medical Information
    addSection('Medical Information');
    addField('Primary Care Provider', child.primaryCareProvider || 'Not specified');
    addField('Medical Conditions', child.medicalConditions || 'None reported');
    addField('Medications', child.medications || 'None');
    addField('Allergies', child.allergies || 'None reported');
    
    // 5. Educational Information
    addSection('Educational Information');
    addField('School', child.school || 'Not specified');
    addField('Grade', child.grade || 'Not specified');
    addField('IEP/504 Plan', child.iep || 'Not specified');
    
    // 6. Support Services
    addSection('Support Services');
    addField('Therapies', child.therapies || 'None reported');
    addField('Other Support Services', child.otherSupport || 'None');
    
    // 7. Emergency Information
    addSection('Emergency Information');
    addField('Emergency Contact', child.emergencyContactName || 'Not specified', true);
    addField('Emergency Number', child.emergencyContactNumber || 'Not specified');
    addField('Alternate Emergency Contact', child.alternateEmergencyContact || 'Not specified');
    
    // 8. Additional Information
    addSection('Additional Information');
    addField('Preferred Communication Method', child.communicationMethod || 'Not specified');
    addField('Additional Notes', child.additionalNotes || 'None');
    addField('Parent/Guardian Signature', child.parentSignature ? 'Signed' : 'Not signed');
    addField('Registration Date', formatDate(child.date));
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth - margin - 20,
        doc.internal.pageSize.getHeight() - 10
      );
    }
    
    // Save the PDF with a descriptive filename
    const filename = `${child.childFirstName}_${child.childLastName}_Record_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const renderField = (label, value, icon = null) => (
    <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start' }}>
      {icon && (
        <Box sx={{ mr: 1, color: 'text.secondary', mt: 0.5 }}>
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {value || 'N/A'}
        </Typography>
        <Divider sx={{ mt: 1 }} />
      </Box>
    </Box>
  );

  const renderSection = (title, icon, fields) => (
    <Accordion defaultExpanded elevation={2} sx={{ mb: 2 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>{title}</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {fields}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: (theme) => theme.palette.primary.main,
        color: 'white',
        borderBottom: '1px solid #e0e0e0',
        py: 2
      }}>
        <Typography variant="h6" component="div">
          {child.childFirstName} {child.childLastName}'s Record
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ py: 3, bgcolor: '#f9f9f9' }}>
        <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Basic Information */}
          {renderSection(
            'Child Information',
            <PersonIcon color="primary" />,
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                {renderField('First Name', child.childFirstName, <PersonIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={4}>
                {renderField('Middle Name', child.childMiddleName || 'N/A', <PersonIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={4}>
                {renderField('Last Name', child.childLastName, <PersonIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={4}>
                {renderField('Date of Birth', formatDate(child.dob), <PersonIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={4}>
                {renderField('Gender', child.gender, <PersonIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12}>
                {renderField('Address', child.address, <PersonIcon fontSize="small" />)}
              </Grid>
            </Grid>
          )}

          {/* Parent/Guardian Information */}
          {renderSection(
            'Parent/Guardian Information',
            <PersonIcon color="primary" />,
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {renderField('First Name', child.parentFirstName, <PersonIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderField('Last Name', child.parentLastName, <PersonIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderField('Relationship', child.relationship, <PersonIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderField('Contact Number', child.contactNumber, <PersonIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12}>
                {renderField('Email', child.email, <PersonIcon fontSize="small" />)}
              </Grid>
            </Grid>
          )}

          {/* Disability Information */}
          {renderSection(
            'Disability Information',
            <DisabilityIcon color="primary" />,
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DisabilityIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Disability Type & Severity
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip label={child.disabilityType} color="primary" variant="outlined" />
                  <Chip label={child.disabilitySeverity} color="secondary" variant="outlined" />
                </Box>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12}>
                {renderField('Special Needs', child.specialNeeds, <DisabilityIcon fontSize="small" />)}
              </Grid>
            </Grid>
          )}

          {/* Medical Information */}
          {renderSection(
            'Medical Information',
            <MedicalIcon color="primary" />,
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {renderField('Primary Care Provider', child.primaryCareProvider || 'Not specified', <MedicalIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12}>
                {renderField('Medical Conditions', child.medicalConditions || 'None reported', <MedicalIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderField('Medications', child.medications || 'None', <MedicalIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderField('Allergies', child.allergies || 'None reported', <MedicalIcon fontSize="small" />)}
              </Grid>
            </Grid>
          )}

          {/* Educational Information */}
          {renderSection(
            'Educational Information',
            <SchoolIcon color="primary" />,
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {renderField('School', child.school || 'Not specified', <SchoolIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderField('Grade', child.grade || 'Not specified', <SchoolIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12}>
                {renderField('IEP/504 Plan', child.iep || 'Not specified', <SchoolIcon fontSize="small" />)}
              </Grid>
            </Grid>
          )}

          {/* Support Services */}
          {renderSection(
            'Support Services',
            <SupportIcon color="primary" />,
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {renderField('Therapies', child.therapies || 'None reported', <SupportIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12}>
                {renderField('Other Support Services', child.otherSupport || 'None', <SupportIcon fontSize="small" />)}
              </Grid>
            </Grid>
          )}

          {/* Emergency Information */}
          {renderSection(
            'Emergency Information',
            <EmergencyIcon color="primary" />,
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {renderField('Emergency Contact', child.emergencyContactName, <EmergencyIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderField('Emergency Number', child.emergencyContactNumber, <EmergencyIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12}>
                {renderField('Alternate Emergency Contact', child.alternateEmergencyContact || 'Not specified', <EmergencyIcon fontSize="small" />)}
              </Grid>
            </Grid>
          )}

          {/* Additional Information */}
          {renderSection(
            'Additional Information',
            <NotesIcon color="primary" />,
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {renderField('Preferred Communication Method', child.communicationMethod || 'Not specified', <NotesIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12}>
                {renderField('Additional Notes', child.additionalNotes || 'None', <NotesIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12}>
                {renderField('Parent/Guardian Signature', child.parentSignature ? 'Signed' : 'Not signed', <NotesIcon fontSize="small" />)}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderField('Registration Date', formatDate(child.date), <NotesIcon fontSize="small" />)}
              </Grid>
            </Grid>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0', bgcolor: '#f5f5f5' }}>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Tooltip title="Edit Record">
              <IconButton 
                onClick={onEdit}
                color="primary"
                sx={{ 
                  mr: 1,
                  bgcolor: 'primary.light',
                  '&:hover': { bgcolor: 'primary.main', color: 'white' }
                }}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Record">
              <IconButton 
                onClick={onDelete}
                color="error"
                sx={{
                  bgcolor: 'error.light',
                  '&:hover': { bgcolor: 'error.main', color: 'white' }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          <Box>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={generatePDF}
              sx={{ 
                mr: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': { bgcolor: 'primary.main', color: 'white' }
              }}
            >
              Download PDF
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={onClose}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default ViewChildModal;
