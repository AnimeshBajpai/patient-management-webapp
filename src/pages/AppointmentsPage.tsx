import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import Layout from '../components/Layout';
import { appointmentService, patientService } from '../services/api';
import { Appointment, Patient } from '../types';

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    doctorId: '1', // Default doctor
    doctorName: 'Dr. Smith',
    date: '',
    time: '',
    duration: 30,
    reason: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled' | 'no-show',
    notes: '',
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [appointmentsData, patientsData] = await Promise.all([
        appointmentService.getAll(),
        patientService.getAll(),
      ]);
      setAppointments(appointmentsData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (appointment?: Appointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setFormData({
        patientId: appointment.patientId,
        patientName: appointment.patientName,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        reason: appointment.reason,
        status: appointment.status,
        notes: appointment.notes || '',
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        patientId: '',
        patientName: '',
        doctorId: '1',
        doctorName: 'Dr. Smith',
        date: '',
        time: '',
        duration: 30,
        reason: '',
        status: 'scheduled',
        notes: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAppointment(null);
  };

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    setFormData({
      ...formData,
      patientId,
      patientName: patient ? `${patient.firstName} ${patient.lastName}` : '',
    });
  };

  const handleSaveAppointment = async () => {
    try {
      if (editingAppointment) {
        await appointmentService.update(editingAppointment.id, formData);
      } else {
        await appointmentService.create(formData);
      }
      fetchData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentService.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'no-show':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Appointments
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage patient appointments and schedules
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size={isMobile ? 'small' : 'medium'}
        >
          Schedule Appointment
        </Button>
      </Box>

      {isMobile ? (
        // Mobile card layout
        <Grid container spacing={2}>
          {appointments.map((appointment) => (
            <Grid item xs={12} key={appointment.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {appointment.patientName}
                      </Typography>
                      <Chip 
                        label={appointment.status} 
                        size="small" 
                        color={getStatusColor(appointment.status) as any}
                        variant="outlined"
                      />
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleOpenDialog(appointment)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteAppointment(appointment.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{formatDate(appointment.date)}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{appointment.time} ({appointment.duration} min)</Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {appointment.reason}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        // Desktop table layout
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      {appointment.patientName}
                    </Box>
                  </TableCell>
                  <TableCell>{formatDate(appointment.date)}</TableCell>
                  <TableCell>{appointment.time}</TableCell>
                  <TableCell>{appointment.duration} min</TableCell>
                  <TableCell>{appointment.reason}</TableCell>
                  <TableCell>
                    <Chip 
                      label={appointment.status} 
                      size="small" 
                      color={getStatusColor(appointment.status) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(appointment)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteAppointment(appointment.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Appointment Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAppointment ? 'Edit Appointment' : 'Schedule New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Patient</InputLabel>
                <Select
                  value={formData.patientId}
                  label="Patient"
                  onChange={(e) => handlePatientChange(e.target.value)}
                >
                  {patients.map((patient) => (
                    <MenuItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date"
                value={formData.date ? dayjs(formData.date) : null}
                onChange={(date) => 
                  setFormData({ ...formData, date: date ? date.format('YYYY-MM-DD') : '' })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Time"
                value={formData.time ? dayjs(`2024-01-01 ${formData.time}`) : null}
                onChange={(time) => 
                  setFormData({ ...formData, time: time ? time.format('HH:mm') : '' })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                required
                inputProps={{ min: 15, max: 120, step: 15 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                  <MenuItem value="no-show">No Show</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Visit"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveAppointment} variant="contained">
            {editingAppointment ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AppointmentsPage;
