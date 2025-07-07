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
  Cancel as CancelIcon,
  CheckCircle as CompleteIcon,
} from '@mui/icons-material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import Layout from '../components/Layout';
import { appointmentService, patientService } from '../services/api';
import { 
  Appointment, 
  Patient, 
  AddAppointmentRequest, 
  UpdateAppointmentRequest,
  APPOINTMENT_STATUS_LABELS,
  AppointmentStatus 
} from '../types';

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AddAppointmentRequest>({
    patientId: '',
    doctorId: '1', // Default doctor
    doctorName: 'Dr. Smith',
    appointmentDate: '',
    appointmentTime: '',
    durationMinutes: 30,
    reason: '',
    notes: '',
    appointmentType: 'Consultation',
    estimatedCost: 150,
    status: 'SCHEDULED',
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
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        appointmentDate: appointment.date,
        appointmentTime: appointment.time,
        durationMinutes: appointment.duration,
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        appointmentType: appointment.appointmentType || 'Consultation',
        estimatedCost: appointment.estimatedCost || 150,
        status: appointment.appointmentStatus,
      });
    } else {
      setEditingAppointment(null);
      setFormData({
        patientId: '',
        doctorId: '1',
        doctorName: 'Dr. Smith',
        appointmentDate: '',
        appointmentTime: '',
        durationMinutes: 30,
        reason: '',
        notes: '',
        appointmentType: 'Consultation',
        estimatedCost: 150,
        status: 'SCHEDULED',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAppointment(null);
  };

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.uuid === patientId);
    setFormData({
      ...formData,
      patientId,
    });
  };

  const handleSaveAppointment = async () => {
    try {
      if (editingAppointment) {
        const updateData: UpdateAppointmentRequest = {
          appointmentId: editingAppointment.uuid,
          doctorId: formData.doctorId,
          doctorName: formData.doctorName,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          durationMinutes: formData.durationMinutes,
          reason: formData.reason,
          notes: formData.notes,
          appointmentType: formData.appointmentType,
          estimatedCost: formData.estimatedCost,
          status: formData.status,
        };
        await appointmentService.update(updateData);
      } else {
        await appointmentService.schedule(formData);
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

  const handleCancelAppointment = async (id: string) => {
    const reason = prompt('Please enter cancellation reason:');
    if (reason !== null) {
      try {
        await appointmentService.cancel(id, reason);
        fetchData();
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  const handleCompleteAppointment = async (id: string) => {
    const notes = prompt('Please enter completion notes (optional):');
    try {
      await appointmentService.complete(id, notes || undefined);
      fetchData();
    } catch (error) {
      console.error('Error completing appointment:', error);
    }
  };

  const getStatusColor = (status: AppointmentStatus): 'primary' | 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'SCHEDULED':
      case 'CONFIRMED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'NO_SHOW':
        return 'warning';
      case 'IN_PROGRESS':
        return 'primary';
      case 'RESCHEDULED':
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
            <Grid item xs={12} key={appointment.uuid}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {appointment.patientName}
                      </Typography>
                      <Chip 
                        label={APPOINTMENT_STATUS_LABELS[appointment.appointmentStatus]} 
                        size="small" 
                        color={getStatusColor(appointment.appointmentStatus) as any}
                        variant="outlined"
                      />
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleOpenDialog(appointment)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteAppointment(appointment.uuid)} size="small" color="error">
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
                <TableRow key={appointment.uuid} hover>
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
                      label={APPOINTMENT_STATUS_LABELS[appointment.appointmentStatus]} 
                      size="small" 
                      color={getStatusColor(appointment.appointmentStatus) as any}
                      variant="outlined"
                    />
                  </TableCell>                      <TableCell>
                        <IconButton onClick={() => handleOpenDialog(appointment)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteAppointment(appointment.uuid)} color="error">
                          <DeleteIcon />
                        </IconButton>
                        {appointment.appointmentStatus === 'SCHEDULED' && (
                          <IconButton onClick={() => handleCancelAppointment(appointment.uuid)} color="warning">
                            <DeleteIcon />
                          </IconButton>
                        )}
                        {appointment.appointmentStatus === 'IN_PROGRESS' && (
                          <IconButton onClick={() => handleCompleteAppointment(appointment.uuid)} color="success">
                            <EditIcon />
                          </IconButton>
                        )}
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
                    <MenuItem key={patient.uuid} value={patient.uuid}>
                      {patient.firstName} {patient.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Date"                value={formData.appointmentDate ? dayjs(formData.appointmentDate) : null}
                onChange={(date) =>
                  setFormData({ ...formData, appointmentDate: date ? date.format('YYYY-MM-DD') : '' })
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
                label="Time"                value={formData.appointmentTime ? dayjs(`2024-01-01 ${formData.appointmentTime}`) : null}
                onChange={(time) =>
                  setFormData({ ...formData, appointmentTime: time ? time.format('HH:mm') : '' })
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
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) || 30 })}
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
