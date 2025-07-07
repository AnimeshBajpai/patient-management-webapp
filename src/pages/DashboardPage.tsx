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
  Grid,
} from '@mui/material';
import {
  People,
  CalendarToday,
  EventAvailable,
  CheckCircle,
  Person,
  Schedule,
  WbSunny,
  WbCloudy,
  NightsStay,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import Layout from '../components/Layout';
import UserProfileCard from '../components/UserProfileCard';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService, appointmentService } from '../services/api';
import { DashboardStats, Appointment, AppointmentStatus, APPOINTMENT_STATUS_LABELS } from '../types';

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
  const { user } = useAuth();
  const theme = useTheme();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good Morning', icon: <WbSunny /> };
    if (hour < 17) return { text: 'Good Afternoon', icon: <WbCloudy /> };
    return { text: 'Good Evening', icon: <NightsStay /> };
  };

  const greeting = getGreeting();

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
      {/* Welcome Section with User Info */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {greeting.icon}
              <Typography variant="h4" component="h1" fontWeight="bold">
                {greeting.text}, {user?.firstName || user?.displayName || 'User'}!
              </Typography>
            </Box>
            <Typography variant="subtitle1" color="text.secondary">
              Welcome back to DocGenie. Here's what's happening in your practice today.
            </Typography>
          </Grid>
          {user && (
            <Grid item xs={12} md={4}>
              <UserProfileCard user={user} compact />
            </Grid>
          )}
        </Grid>
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
                    key={appointment.uuid}
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
                            label={APPOINTMENT_STATUS_LABELS[appointment.appointmentStatus]}
                            size="small"
                            color={getStatusColor(appointment.appointmentStatus) as any}
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
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* User Profile */}
          {user && (
            <Paper sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                <Typography variant="h6" fontWeight="bold">
                  Your Profile
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <UserProfileCard user={user} />
              </Box>
            </Paper>
          )}
          
          {/* Quick Actions */}
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
      </Box>
    </Layout>
  );
};

export default DashboardPage;
