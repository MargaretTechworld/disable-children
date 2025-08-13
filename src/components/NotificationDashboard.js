import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
  useTheme,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  LinearProgress
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AccessTime as PendingIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import axios from 'axios';

const statusColors = {
  draft: 'default',
  scheduled: 'info',
  sent: 'success',
  cancelled: 'error'
};

const statusIcons = {
  draft: <InfoIcon fontSize="small" />,
  scheduled: <PendingIcon fontSize="small" />,
  sent: <CheckCircleIcon fontSize="small" />,
  cancelled: <ErrorIcon fontSize="small" />
};

const NotificationDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch events data
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/events');
        setEvents(response.data.data || []);
        calculateStats(response.data.data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [refreshKey]);

  // Calculate statistics
  const calculateStats = (eventsData) => {
    const stats = {
      total: eventsData.length,
      draft: 0,
      scheduled: 0,
      sent: 0,
      cancelled: 0,
      recent: 0
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    eventsData.forEach(event => {
      if (event.status) {
        stats[event.status] = (stats[event.status] || 0) + 1;
      }
      
      const eventDate = new Date(event.updatedAt || event.createdAt);
      if (eventDate > thirtyDaysAgo) {
        stats.recent++;
      }
    });

    setStats(stats);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSendNotifications = (event) => {
    setSelectedEvent(event);
    setConfirmOpen(true);
  };

  const confirmSendNotifications = async () => {
    if (!selectedEvent) return;
    
    try {
      setActionLoading(true);
      setActionError('');
      
      await axios.post(`/api/events/${selectedEvent.id}/notify`);
      
      // Refresh the events list
      setRefreshKey(prev => prev + 1);
      setConfirmOpen(false);
    } catch (error) {
      console.error('Error sending notifications:', error);
      setActionError(error.response?.data?.message || 'Failed to send notifications');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy hh:mm a');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getStatusChip = (status) => (
    <Chip
      icon={statusIcons[status] || <InfoIcon />}
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={statusColors[status] || 'default'}
      size="small"
      variant="outlined"
    />
  );

  const getTargetDisabilities = (disabilities) => {
    if (!disabilities || disabilities.length === 0) return 'All';
    
    const disabilityMap = {
      'visual': 'Visual',
      'hearing': 'Hearing',
      'physical': 'Physical',
      'intellectual': 'Intellectual',
      'autism': 'Autism',
      'down-syndrome': 'Down Syndrome',
      'other': 'Other'
    };
    
    return disabilities.map(d => disabilityMap[d] || d).join(', ');
  };

  if (loading && !events.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h1">Event Notifications</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/dashboard/events/new')}
          >
            Create Event
          </Button>
        </Box>
        
        <Typography variant="body2" color="textSecondary" paragraph>
          Manage events and send targeted notifications to parents based on their children's disabilities.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {actionError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setActionError('')}>
          {actionError}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Events
                </Typography>
                <Typography variant="h4" component="div">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Draft
                </Typography>
                <Typography variant="h4" color="textSecondary">
                  {stats.draft}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Scheduled
                </Typography>
                <Typography variant="h4" color="info.main">
                  {stats.scheduled}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Sent
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.sent}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Events Table */}
      <Card>
        <CardHeader
          title="Events"
          subheader={`Showing ${events.length} events`}
          action={
            <Button
              size="small"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/dashboard/events/new')}
            >
              New Event
            </Button>
          }
        />
        <Divider />
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Target Disabilities</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="textSecondary">
                      No events found. Create your first event to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                events
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((event) => (
                    <TableRow key={event.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{event.title}</Typography>
                        <Typography variant="body2" color="textSecondary" noWrap>
                          {event.description?.substring(0, 60)}
                          {event.description?.length > 60 ? '...' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {event.dateTime ? formatDate(event.dateTime) : 'Not set'}
                      </TableCell>
                      <TableCell>
                        {getTargetDisabilities(event.targetDisabilities)}
                      </TableCell>
                      <TableCell>
                        {getStatusChip(event.status || 'draft')}
                      </TableCell>
                      <TableCell>
                        {formatDate(event.updatedAt || event.createdAt)}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/dashboard/events/${event.id}`)}
                              disabled={event.status === 'sent'}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {event.status !== 'sent' && event.status !== 'cancelled' && (
                            <Tooltip title="Send Notifications">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleSendNotifications(event)}
                              >
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={events.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => !actionLoading && setConfirmOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Send Notifications
        </DialogTitle>
        <DialogContent>
          {actionLoading && <LinearProgress />}
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to send notifications for the event "{selectedEvent?.title}"?
            <br />
            <br />
            This will send emails to all parents whose children match the target disabilities.
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmOpen(false)} 
            color="primary"
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmSendNotifications}
            color="primary"
            variant="contained"
            autoFocus
            disabled={actionLoading}
            startIcon={actionLoading ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {actionLoading ? 'Sending...' : 'Send Notifications'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationDashboard;
