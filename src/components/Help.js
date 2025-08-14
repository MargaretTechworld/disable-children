import React, { useEffect } from 'react';
import { Typography, Paper, Divider, List, ListItem, ListItemIcon, ListItemText, Link, Box } from '@mui/material';
import { Email, Lock, Group, Notifications, Help as HelpIcon } from '@mui/icons-material';
import '../styles/Help.css';

const Help = () => {
  const [isMounted, setIsMounted] = React.useState(false);

  // Set isMounted to true after component mounts
  React.useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const faqs = [
    {
      icon: <Group />,
      question: 'How do I manage children in the system?',
      answer: 'Navigate to the "Manage Children Data" section in the sidebar. Here you can add new children, view existing records, and update information. Each child record includes personal details, disability information, and contact details.',
    },
    {
      icon: <Notifications />,
      question: 'How do I send messages to parents?',
      answer: (
        <>
          Use the <strong> Admin Message Center</strong> to communicate with parents:
          <List dense component="div" disablePadding className="steps-list">
            <ListItem disableGutters className="step-item">
              <ListItemText 
                primary="1. Select 'Compose New Message'"
                secondary="Choose to send to all parents or filter by disability type"
                className="step-content"
              />
            </ListItem>
            <ListItem disableGutters className="step-item">
              <ListItemText 
                primary="2. Craft your message"
                secondary="Add a clear subject and detailed content"
                className="step-content"
              />
            </ListItem>
            <ListItem disableGutters className="step-item">
              <ListItemText 
                primary="3. Review and send"
                secondary="Preview your message before sending to all selected recipients"
                className="step-content"
              />
            </ListItem>
          </List>
        </>
      ),
    },
    {
      icon: <Lock />,
      question: 'How do I manage my account security?',
      answer: 'Visit the "Settings" section to update your password, email preferences, and notification settings. We recommend changing your password regularly and enabling two-factor authentication if available.',
    },
    {
      icon: <HelpIcon />,
      question: 'What should I do if I encounter an issue?',
      answer: 'First, try refreshing the page. If the issue persists, clear your browser cache or try a different browser. For persistent problems, contact technical support with details about the issue and any error messages.',
    },
  ];

  // Don't render anything until the component is mounted
  if (!isMounted) {
    return null;
  }

  return (
    <div className="help-container">
      <Typography variant="h4" component="h1" gutterBottom className="help-title">
        Help Center
      </Typography>
      
      <Paper elevation={2} className="help-paper">
        <Typography variant="h6" component="h2" gutterBottom className="section-title">
          Frequently Asked Questions
        </Typography>
        <Divider className="divider" />
        
        <Box component="div" className="faq-section">
          {faqs.map((faq, index) => {
            const AnswerComponent = typeof faq.answer === 'string' 
              ? () => <Typography variant="body1">{faq.answer}</Typography>
              : () => faq.answer;
              
            return (
              <Box key={index} component="div" className="faq-item">
                <Box component="div" className="faq-icon">
                  {faq.icon}
                </Box>
                <Box component="div" className="faq-content">
                  <Typography variant="subtitle1" component="h3" className="faq-question">
                    {faq.question}
                  </Typography>
                  <Box component="div" className="faq-answer">
                    <AnswerComponent />
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Paper elevation={2} className="help-paper support-section">
        <Typography variant="h6" component="h2" gutterBottom className="section-title">
          Need Further Assistance?
        </Typography>
        <Divider className="divider" />
        <div className="contact-info">
          <Typography variant="body1" paragraph>
            Our support team is here to help you with any questions or issues you may encounter while using the system.
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><Email color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Email Support"
                secondary={
                  <Link href="mailto:kidsdisable@gmail.com" color="primary">
                    kidsdisable@gmail.com
                  </Link>
                }
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><HelpIcon color="primary" /></ListItemIcon>
              <ListItemText 
                primary="Knowledge Base"
                secondary={
                  <Link href="/knowledge-base" color="primary">
                    Browse our knowledge base
                  </Link>
                }
              />
            </ListItem>
          </List>
          <Typography variant="body2" color="textSecondary" className="response-time">
            Our team typically responds to inquiries within 1 business day.
          </Typography>
        </div>
      </Paper>
    </div>
  );
};

export default Help;
