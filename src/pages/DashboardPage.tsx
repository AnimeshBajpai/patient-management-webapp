import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  People,
  CalendarToday,
  EventAvailable,
  CheckCircle,
  Person,
  Schedule,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Layout from '../components/Layout';
import { dashboardService, appointmentService } from '../services/api';
import { DashboardStats, Appointment } from '../types';

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography color="text.secondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div" color={color} fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, appointmentsData] = await Promise.all([
          dashboardService.getStats(),
          appointmentService.getAll(),
        ]);
        
        setStats(statsData);
        // Get recent appointments (today and upcoming)
        const now = new Date();
        const recent = appointmentsData
          .filter(apt => new Date(apt.date) >= now)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        setRecentAppointments(recent);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
      day: 'numeric' 
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Welcome back! Here's an overview of your practice.
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3,
        mb: 4 
      }}>
        <StatCard
          title="Total Patients"
          value={stats?.totalPatients || 0}
          icon={<People />}
          color={theme.palette.primary.main}
        />
        <StatCard
          title="Today's Appointments"
          value={stats?.todaysAppointments || 0}
          icon={<CalendarToday />}
          color={theme.palette.info.main}
        />
        <StatCard
          title="Upcoming"
          value={stats?.upcomingAppointments || 0}
          icon={<EventAvailable />}
          color={theme.palette.warning.main}
        />
        <StatCard
          title="Completed"
          value={stats?.completedAppointments || 0}
          icon={<CheckCircle />}
          color={theme.palette.success.main}
        />
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 3 
      }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Appointments
          </Typography>
            {recentAppointments.length === 0 ? (
              <Typography color="text.secondary">
                No upcoming appointments found.
              </Typography>
            ) : (
              <List>
                {recentAppointments.map((appointment, index) => (
                  <ListItem
                    key={appointment.id}
                    divider={index < recentAppointments.length - 1}
                    sx={{ px: 0 }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <Person />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={appointment.patientName}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Schedule fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(appointment.date)} at {appointment.time}
                          </Typography>
                          <Chip
                            label={appointment.status}
                            size="small"
                            color={getStatusColor(appointment.status) as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        {appointment.reason}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appointment.duration} min
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Add New Patient
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Register a new patient in the system
              </Typography>
            </Card>
            
            <Card
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Schedule Appointment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Book a new appointment with a patient
              </Typography>
            </Card>
            
            <Card
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                View All Patients
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse and manage patient records
              </Typography>
            </Card>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default DashboardPage;
