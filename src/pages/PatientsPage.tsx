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
  Chip,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Layout from '../components/Layout';
import { patientService } from '../services/api';
import { Patient } from '../types';

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    address: '',
    medicalHistory: '',
    allergies: '',
  });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const data = await patientService.getAll();
      setPatients(data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (patient?: Patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        email: patient.email,
        phone: patient.phone,
        address: patient.address,
        medicalHistory: patient.medicalHistory,
        allergies: patient.allergies,
      });
    } else {
      setEditingPatient(null);
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        email: '',
        phone: '',
        address: '',
        medicalHistory: '',
        allergies: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPatient(null);
  };

  const handleSavePatient = async () => {
    try {
      if (editingPatient) {
        await patientService.update(editingPatient.id, formData);
      } else {
        await patientService.create(formData);
      }
      fetchPatients();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await patientService.delete(id);
        fetchPatients();
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
            Patients
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage patient records and information
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          size={isMobile ? 'small' : 'medium'}
        >
          Add Patient
        </Button>
      </Box>

      {isMobile ? (
        // Mobile card layout
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {patients.map((patient) => (
            <Card key={patient.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {patient.firstName} {patient.lastName}
                      </Typography>
                      <Chip 
                        label={`Age: ${calculateAge(patient.dateOfBirth)}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleOpenDialog(patient)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeletePatient(patient.id)} size="small" color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{patient.email}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{patient.phone}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <HomeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary', mt: 0.1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {patient.address}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
          ))}
        </Box>
      ) : (
        // Desktop table layout
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      {patient.firstName} {patient.lastName}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={calculateAge(patient.dateOfBirth)} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.address}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(patient)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDeletePatient(patient.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Patient Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPatient ? 'Edit Patient' : 'Add New Patient'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
            <DatePicker
              label="Date of Birth"
              value={formData.dateOfBirth ? dayjs(formData.dateOfBirth) : null}
              onChange={(date) => 
                setFormData({ ...formData, dateOfBirth: date ? date.format('YYYY-MM-DD') : '' })
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                },
              }}
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
            />
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
            />
            <TextField
              fullWidth
              label="Medical History"
              multiline
              rows={3}
              value={formData.medicalHistory}
              onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
              sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
            />
            <TextField
              fullWidth
              label="Allergies"
              multiline
              rows={2}
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSavePatient} variant="contained">
            {editingPatient ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default PatientsPage;
