import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
  IconButton,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  Snackbar,
  Avatar
} from '@mui/material';
import {
  EditNote as EditNoteIcon,
  Email as EmailIcon,
  Close as CloseIcon,
  WarningAmber as WarningAmberIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  FileCopy as FileCopyIcon,
  Refresh as RefreshIcon,
  Send as SendIcon
} from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

// Mapping of disability types to their display names
const DISABILITY_DISPLAY_NAMES = {
  'autism': 'Autism',
  'adhd': 'ADHD',
  'Down Syndrome': 'Down Syndrome',
  'cerebral_palsy': 'Cerebral Palsy',
  'visual_impairment': 'Visual Impairment',
  'hearing_impairment': 'Hearing Impairment',
  'intellectual_disability': 'Intellectual Disability',
  'learning_disability': 'Learning Disability',
  'physical_disability': 'Physical Disability',
  'speech_impairment': 'Speech Impairment',
  'Lame': 'Mobility Impairment'
};

// Replace these API endpoints
const API_BASE_URL = 'http://localhost:5000/api';
const ENDPOINTS = {
  DISABILITY_TYPES: `${API_BASE_URL}/children/disability-types`,
  RECIPIENT_COUNT: `${API_BASE_URL}/notifications/recipient-count`,
  SENT_MESSAGES: `${API_BASE_URL}/notifications/sent`
};
// TabPanel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// ComposeMessageForm component
// In the ComposeMessageForm component, update the props destructuring to include state setters
const ComposeMessageForm = ({
  subject, setSubject,
  message, setMessage,
  isSending,
  handleSendMessage,
  sendToAll,
  selectedDisabilities,
  isLoadingCount,
  recipientCount,
  setSendToAll,
  setSelectedDisabilities,
  availableDisabilities,
  isLoadingDisabilities
}) => (
  <Box sx={{ p: 3 }}>
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <TextField
              fullWidth
              label="Subject"
              variant="outlined"
              margin="normal"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={8}
              label="Your Message"
              variant="outlined"
              margin="normal"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#3f51b5',
                  },
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={handleSendMessage}
                disabled={isSending || !subject.trim() || !message.trim() || (!sendToAll && selectedDisabilities.length === 0)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  borderRadius: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  },
                }}
              >
                {isSending ? 'Sending...' : 'Send Message'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#2c3e50' }}>
              Target Recipients
            </Typography>
            <FormControl component="fieldset" fullWidth>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={sendToAll}
                      onChange={(e) => {
                        setSendToAll(e.target.checked);
                        if (e.target.checked) {
                          setSelectedDisabilities([]);
                        }
                      }}
                      color="primary"
                    />
                  }
                  label="Send to All Parents"
                />

                {!isLoadingDisabilities && availableDisabilities.length === 0 ? (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    No disability types found. You can still send to all parents.
                  </Alert>
                ) : (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Or select specific disability types:
                    </Typography>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto', p: 1 }}>
                      {isLoadingDisabilities ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : (
                        availableDisabilities.map((disability) => (
                          <FormControlLabel
                            key={disability}
                            control={
                              <Checkbox
                                checked={selectedDisabilities.includes(disability)}
                                onChange={() => {
                                  const newSelected = selectedDisabilities.includes(disability)
                                    ? selectedDisabilities.filter(d => d !== disability)
                                    : [...selectedDisabilities, disability];
                                  setSelectedDisabilities(newSelected);
                                  if (newSelected.length > 0) {
                                    setSendToAll(false);
                                  }
                                }}
                                color="primary"
                                disabled={sendToAll}
                              />
                            }
                            label={DISABILITY_DISPLAY_NAMES[disability] || disability}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              ml: 0,
                              mr: 2,
                              mb: 1,
                            }}
                          />
                        ))
                      )}
                    </Box>
                  </>
                )}
              <Button
                variant="contained"
                color="primary"
                startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={handleSendMessage}
                disabled={isSending || !subject.trim() || !message.trim() || (!sendToAll && selectedDisabilities.length === 0)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  borderRadius: 1,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  },
                }}
              >
                {isSending ? 'Sending...' : 'Send Message'}
              </Button>
              </FormGroup>
            </FormControl>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

// SentMessagesTable component
const SentMessagesTable = ({
  isLoadingSent, sentMessages, fetchSentMessages, page, rowsPerPage,
  handleChangePage, handleChangeRowsPerPage, handleViewMessage, handleDeleteClick,
  user // Changed from currentUser to user for consistency
}) => (
  <Box sx={{ p: 3 }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h6" sx={{ color: '#2c3e50', fontWeight: 600 }}>
        Sent Messages
      </Typography>
      <Button
        variant="outlined"
        startIcon={<RefreshIcon />}
        onClick={fetchSentMessages}
        disabled={isLoadingSent}
        size="small"
        sx={{ textTransform: 'none' }}
      >
        {isLoadingSent ? 'Refreshing...' : 'Refresh'}
      </Button>
    </Box>

    <Paper elevation={0} sx={{ width: '100%', overflow: 'hidden', border: '1px solid #e0e0e0', borderRadius: 2 }}>
      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f7fa' }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f7fa' }}>Sender</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f7fa' }}>Recipients</TableCell>
              <TableCell sx={{ fontWeight: 600, backgroundColor: '#f5f7fa' }}>Date Sent</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, backgroundColor: '#f5f7fa' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoadingSent ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Loading messages...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : sentMessages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  <EmailIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                  <Typography variant="subtitle1">No sent messages yet</Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Messages you send will appear here
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              sentMessages
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((msg) => (
                  <TableRow
                    hover
                    key={msg.id}
                    sx={{ '&:last-child td': { borderBottom: 0 } }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {msg.subject || '(No subject)'}
                      </Typography>
                      <Tooltip title={msg.message || '(No content)'} arrow>
                        <Typography 
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '200px',
                            whiteSpace: 'nowrap',
                            '&:hover': {
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              color: 'primary.main'
                            }
                          }}
                          onClick={() => handleViewMessage(msg)}
                        >
                          {msg.message 
                            ? msg.message.replace(/<[^>]*>?/gm, '').substring(0, 60) + (msg.message.length > 60 ? '...' : '')
                            : '(No content)'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: msg.sender?.role === 'super_admin' ? 'error.main' : 
                            msg.sender?.role === 'admin' ? 'primary.main' : 'grey.500',
                            color: 'white',
                            fontSize: '0.875rem'
                          }}
                        >
                          {msg.sender?.firstName?.[0]}{msg.sender?.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                            {msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : 'System'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ lineHeight: 1.2 }}>
                            {msg.sender?.role === 'super_admin' ? 'Super Admin' : 
                             msg.sender?.role === 'admin' ? 'Admin' : 'User'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {msg.metadata?.recipientName ? (
                        <Box>
                          <div>{msg.metadata.recipientName}</div>
                          <Typography variant="caption" color="textSecondary">
                            {msg.metadata.recipientEmail}
                          </Typography>
                        </Box>
                      ) : (
                        <Box>
                          <div>{msg.recipientGroups?.[0] || 'Specific Recipients'}</div>
                          <Typography variant="caption" color="textSecondary">
                            {msg.totalRecipients} {msg.totalRecipients === 1 ? 'recipient' : 'recipients'}
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={format(new Date(msg.createdAt), 'PPpp')}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {format(new Date(msg.createdAt), 'MMM d, yyyy')}
                        </Typography>
                      </Tooltip>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                        {format(new Date(msg.createdAt), 'h:mm a')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View message">
                        <IconButton
                          size="small"
                          onClick={() => handleViewMessage(msg)}
                          sx={{ color: 'primary.main', '&:hover': { bgcolor: 'rgba(63, 81, 181, 0.08)' } }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {user && (user.role === 'admin' || user.role === 'super_admin' || (msg.sender && msg.sender.id === user.id)) && (
                        <Tooltip title="Delete message">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(msg)}
                            sx={{ color: 'error.main', '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.08)' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {sentMessages.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={sentMessages.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            borderTop: '1px solid rgba(224, 224, 224, 0.5)',
            '& .MuiTablePagination-toolbar': {
              minHeight: '52px',
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              marginBottom: 0,
            }
          }}
        />
      )}
    </Paper>
  </Box>
);

// ViewMessageDialog component
const ViewMessageDialog = ({ open, onClose, selectedMessage }) => {
  // Map the message properties to the expected format
  const message = selectedMessage ? {
    ...selectedMessage,
    senderName: selectedMessage.sender ? 
      `${selectedMessage.sender.firstName} ${selectedMessage.sender.lastName}` : 
      'System',
    senderEmail: selectedMessage.sender?.email || 'system@example.com',
    recipientGroups: selectedMessage.recipientGroups || 
      (selectedMessage.metadata?.recipientGroup ? 
        [selectedMessage.metadata.recipientGroup] : 
        ['Specific Recipients']),
    recipientCount: selectedMessage.totalRecipients || 1,
    subject: selectedMessage.subject || '(No subject)',
    message: selectedMessage.message || '(No content)',
    createdAt: selectedMessage.createdAt || new Date().toISOString()
  } : null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        flexShrink: 0
      }}>
        <Box sx={{ 
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          pr: 4
        }}>
          {message?.subject || 'Message Details'}
        </Box>
        <IconButton 
          onClick={onClose} 
          size="small" 
          sx={{ 
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary'
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent 
        dividers 
        sx={{
          flex: '1 1 auto',
          overflowY: 'auto',
          p: 3
        }}
      >
        {message ? (
          <Box>
            <Box sx={{ 
              mb: 3,
              p: 2,
              bgcolor: 'rgba(0, 0, 0, 0.02)',
              borderRadius: 1
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ minWidth: 60 }}>From:</Typography>
                <Typography variant="body2">
                  {message.senderName} &lt;{message.senderEmail}&gt;
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ minWidth: 60 }}>Date:</Typography>
                <Typography variant="body2">
                  {format(new Date(message.createdAt), 'PPpp')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ minWidth: 60, pt: 0.5 }}>To:</Typography>
                <Box sx={{ flex: 1 }}>
                  {message.recipientGroups?.length ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                      {message.recipientGroups.map((group, idx) => (
                        <Chip
                          key={idx}
                          label={group}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{
                            borderRadius: 1,
                            height: '22px',
                            '& .MuiChip-label': { px: 1, py: 0.25 }
                          }}
                        />
                      ))}
                      <Typography variant="caption" color="textSecondary" sx={{ ml: 0.5 }}>
                        ({message.recipientCount} total)
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2">
                      {message.recipientCount || 1} recipient{message.recipientCount !== 1 ? 's' : ''}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Box 
              component="div" 
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                '& p': { 
                  margin: '0 0 1em 0',
                  lineHeight: 1.6 
                },
                '& p:last-child': { 
                  marginBottom: 0 
                },
                maxHeight: '50vh',
                overflowY: 'auto'
              }}
              dangerouslySetInnerHTML={{ __html: message.message.replace(/\n/g, '<br/>') }}
            />
          </Box>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            No message selected
          </Box>
        )}
      </DialogContent>
      <DialogActions 
        sx={{ 
          p: 2, 
          borderTop: '1px solid rgba(0,0,0,0.12)',
          flexShrink: 0
        }}
      >
        {message?.message && (
          <Button
            onClick={() => {
              navigator.clipboard.writeText(message.message);
              // You might want to show a snackbar here to confirm the copy
            }}
            startIcon={<FileCopyIcon />}
            sx={{ textTransform: 'none' }}
          >
            Copy Message
          </Button>
        )}
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: 'none' }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// DeleteConfirmationDialog component
const DeleteConfirmationDialog = ({
  open, onClose, onConfirm, isDeleting, selectedMessage
}) => (
  <Dialog
    open={open}
    onClose={isDeleting ? undefined : onClose}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle sx={{
      display: 'flex',
      alignItems: 'center',
      pb: 1
    }}>
      <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
      Delete Message
    </DialogTitle>
    <DialogContent>
      <Alert severity="warning" sx={{ mb: 2 }}>
        Are you sure you want to delete this message? This action cannot be undone.
      </Alert>
      {selectedMessage && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {selectedMessage.subject || '(No subject)'}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {selectedMessage.message ? `${selectedMessage.message.substring(0, 150)}${selectedMessage.message.length > 150 ? '...' : ''}` : '(No content)'}
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
            Sent on: {format(new Date(selectedMessage.createdAt), 'PPpp')}
          </Typography>
        </Box>
      )}
    </DialogContent>
    <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
      <Button
        onClick={onClose}
        disabled={isDeleting}
        sx={{ textTransform: 'none' }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        disabled={isDeleting}
        startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
        sx={{ textTransform: 'none' }}
      >
        {isDeleting ? 'Deleting...' : 'Delete Message'}
      </Button>
    </DialogActions>
  </Dialog>
);
// Main AdminMessageCenter component
const AdminMessageCenter = ({ user }) => {
  // State for compose message tab
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedDisabilities, setSelectedDisabilities] = useState([]);
  const [availableDisabilities, setAvailableDisabilities] = useState([]);
  const [isLoadingDisabilities, setIsLoadingDisabilities] = useState(true);
  const [isLoadingCount, setIsLoadingCount] = useState(false);
  const [recipientCount, setRecipientCount] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // State for sent messages tab
  const [sentMessages, setSentMessages] = useState([]);
  const [isLoadingSent, setIsLoadingSent] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState(0);

  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

// Add these functions before the useEffect hooks

const fetchDisabilityTypes = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(ENDPOINTS.DISABILITY_TYPES, {
      headers: { 'x-auth-token': token },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update the fetchRecipientCount function

const fetchRecipientCount = async (disabilities = []) => {
  // Ensure we always have an array
  const safeDisabilities = (() => {
    if (!disabilities) return [];
    return Array.isArray(disabilities) ? disabilities : [disabilities];
  })();

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Only proceed if we have disabilities to check
    if (safeDisabilities.length === 0) {
      return 0;
    }

    const response = await axios.get('http://localhost:5000/api/notifications/recipient-count', {
      params: {
        disabilityTypes: safeDisabilities.join(',')
      },
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });

    return response.data.count || 0;
  } catch (error) {
    throw error;
  }
};
// Update the useEffect that calls it
useEffect(() => {
  const updateRecipientCount = async () => {
    // If sending to all or no disabilities selected, don't fetch count
    if (sendToAll || !selectedDisabilities || selectedDisabilities.length === 0) {
      setRecipientCount(null);
      return;
    }

    try {
      setIsLoadingCount(true);
      const count = await fetchRecipientCount(selectedDisabilities);
      setRecipientCount(count);
    } catch (error) {
      setRecipientCount('Error');
    } finally {
      setIsLoadingCount(false);
    }
  };

  const timer = setTimeout(updateRecipientCount, 500);
  return () => clearTimeout(timer);
}, [selectedDisabilities, sendToAll]);
// Then your existing useEffect hooks can use these functions
useEffect(() => {
  const loadDisabilityTypes = async () => {
    try {
      setIsLoadingDisabilities(true);
      const types = await fetchDisabilityTypes();
      setAvailableDisabilities(types);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to load disability types',
        severity: 'error'
      });
    } finally {
      setIsLoadingDisabilities(false);
    }
  };

  loadDisabilityTypes();
}, []);

  // Fetch available disability types
 useEffect(() => {
    const loadDisabilityTypes = async () => {
      try {
        setIsLoadingDisabilities(true);
        const types = await fetchDisabilityTypes();
        setAvailableDisabilities(types);
      } catch (error) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'Failed to load disability types',
          severity: 'error'
        });
      } finally {
        setIsLoadingDisabilities(false);
      }
    };

    loadDisabilityTypes();
  }, []);


  // Fetch recipient count when selected disabilities change
  // Fetch recipient count when selected disabilities change
  useEffect(() => {
    if (selectedDisabilities.length === 0 && !sendToAll) {
      setRecipientCount(0);
      return;
    }

    const timer = setTimeout(fetchRecipientCount, 500);
    return () => clearTimeout(timer);
  }, [selectedDisabilities, sendToAll]);

  // Fetch sent messages
  const fetchSentMessages = useCallback(async () => {
    setIsLoadingSent(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(ENDPOINTS.SENT_MESSAGES, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      const messages = Array.isArray(response.data?.data) ? response.data.data : [];
      
      // Ensure recipientGroups is properly set for each message
      const processedMessages = messages.map(msg => ({
        ...msg,
        // If recipientGroups exists in metadata but not at root, move it up
        recipientGroups: msg.recipientGroups || 
                        (msg.metadata && msg.metadata.recipientGroup) || 
                        [],
        // Ensure totalRecipients is set
        totalRecipients: msg.totalRecipients || 
                        (msg.metadata && msg.metadata.recipientCount) || 
                        1
      }));
      
      setSentMessages(processedMessages);
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || error.message}`,
        severity: 'error'
      });
      setSentMessages([]);
    } finally {
      setIsLoadingSent(false);
    }
  }, []);

  // Initial fetch of sent messages
  useEffect(() => {
    fetchSentMessages();
  }, [fetchSentMessages]);

  // Handle send message
  const handleSendMessage = async () => {
    // Basic validation
    if (!message.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a message',
        severity: 'error'
      });
      return;
    }
    
    if (!sendToAll && selectedDisabilities.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select at least one disability type or choose to send to all parents',
        severity: 'error'
      });
      return;
    }
  
    try {
      setIsSending(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:5000/api/notifications/send-to-parents', {
        subject: subject.trim(),
        message: message.trim(),
        disabilityTypes: sendToAll ? [] : selectedDisabilities
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        }
      });
  
      // Reset form on success
      setSubject('');
      setMessage('');
      setSelectedDisabilities([]);
      setSendToAll(false);
      setRecipientCount(null);
  
      // Get the success count from the response
      const successCount = response.data?.stats?.success || 0;
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Message sent successfully to ${successCount} parent${successCount !== 1 ? 's' : ''}`,
        severity: 'success'
      });
      
      // Refresh sent messages
      await fetchSentMessages();
      
      // Switch to sent messages tab
      setActiveTab(1);
  
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Error: ${error.response?.data?.message || error.message || 'Failed to send message'}`,
        severity: 'error'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle delete message
  const handleDeleteMessage = async () => {
    if (!selectedMessage) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${ENDPOINTS.SENT_MESSAGES}/${selectedMessage.id}`, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });

      // Refresh the sent messages after successful deletion
      await fetchSentMessages();

      setSnackbar({
        open: true,
        message: 'Message deleted successfully',
        severity: 'success'
      });
      // Refresh sent messages
      fetchSentMessages();
      setDeleteDialogOpen(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete message',
        severity: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle disability toggle
  const handleDisabilityToggle = (disability) => {
    setSelectedDisabilities(prev =>
      prev.includes(disability)
        ? prev.filter(d => d !== disability)
        : [...prev, disability]
    );
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle view message
  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
  };

  // Handle delete click
  const handleDeleteClick = (message) => {
    setSelectedMessage(message);
    setDeleteDialogOpen(true);
  };


  return (
    <Box sx={{ p: 3, backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Card elevation={3} sx={{ mb: 3, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                py: 2,
                minHeight: '60px',
                '&.Mui-selected': {
                  color: '#3f51b5',
                  fontWeight: 600
                }
              }
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EditNoteIcon />
                  <span>Compose Message</span>
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon />
                  <span>Sent Messages</span>
                  {sentMessages.length > 0 && (
                    <Chip
                      label={sentMessages.length}
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  )}
                </Box>
              }
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <ComposeMessageForm
            subject={subject}
            setSubject={setSubject}
            message={message}
            setMessage={setMessage}
            isSending={isSending}
            handleSendMessage={handleSendMessage}
            sendToAll={sendToAll}
            selectedDisabilities={selectedDisabilities}
            isLoadingCount={isLoadingCount}
            recipientCount={recipientCount}
            // Add these props
            setSendToAll={setSendToAll}
            setSelectedDisabilities={setSelectedDisabilities}
            availableDisabilities={availableDisabilities}
            isLoadingDisabilities={isLoadingDisabilities}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <SentMessagesTable
            isLoadingSent={isLoadingSent}
            sentMessages={sentMessages}
            fetchSentMessages={fetchSentMessages}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            handleViewMessage={handleViewMessage}
            handleDeleteClick={handleDeleteClick}
            user={user}
          />
        </TabPanel>
      </Card>

      <ViewMessageDialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        selectedMessage={selectedMessage}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteMessage}
        isDeleting={isDeleting}
        selectedMessage={selectedMessage}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          '&.MuiSnackbar-root': {
            top: '80px', // Position below the top bar
            right: '20px',
            zIndex: 9999, // Very high z-index to ensure it's above everything
            position: 'fixed' // Ensure it stays in place
          },
          '& .MuiPaper-root': {
            minWidth: '300px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
              marginRight: '12px',
              alignItems: 'center',
              display: 'flex'
            },
            '& .MuiAlert-message': {
              fontSize: '0.95rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              padding: '6px 0'
            }
          }
        }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminMessageCenter;