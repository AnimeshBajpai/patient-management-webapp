import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  AccessTime,
  Today,
  Update,
  Security,
  VerifiedUser,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import UserProfileCard from '../components/UserProfileCard';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, rawUserData } = useAuth();

  if (!user || !rawUserData) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>
          <Typography color="text.secondary">
            No user data available.
          </Typography>
        </Container>
      </Layout>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            User Profile
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            View and manage your account information
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Main Profile Information */}
          <Grid item xs={12} lg={8}>
            <UserProfileCard user={user} />
          </Grid>

          {/* Account Activity & Settings */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Account Status */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Account Status
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Security color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">Account Status</Typography>
                          <Chip
                            label={user.status ? 'Active' : 'Inactive'}
                            size="small"
                            color={user.status ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <VerifiedUser color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">Mobile Verification</Typography>
                          <Chip
                            label={user.mobileVerified ? 'Verified' : 'Not Verified'}
                            size="small"
                            color={user.mobileVerified ? 'success' : 'warning'}
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                  
                  {user.email && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <VerifiedUser color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">Email Verification</Typography>
                            <Chip
                              label={user.emailVerified ? 'Verified' : 'Not Verified'}
                              size="small"
                              color={user.emailVerified ? 'success' : 'warning'}
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>

              {/* Account Timeline */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Account Information
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Today color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Created"
                      secondary={formatDate(rawUserData.createdAt)}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Update color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Last Updated"
                      secondary={formatDate(rawUserData.updatedAt)}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <AccessTime color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Current Session"
                      secondary="Active since login"
                    />
                  </ListItem>
                </List>
              </Paper>

              {/* System Information */}
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  System Information
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="User ID"
                      secondary={
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.75rem',
                            wordBreak: 'break-all'
                          }}
                        >
                          {user.uuid}
                        </Typography>
                      }
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText
                      primary="Account Type"
                      secondary={user.userType}
                    />
                  </ListItem>
                  
                  {user.department && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Department"
                        secondary={user.department}
                      />
                    </ListItem>
                  )}
                </List>
              </Paper>
            </Box>
          </Grid>
        </Grid>

        {/* Additional Actions */}
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Actions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Profile management features will be available in future updates. 
              For now, contact your system administrator for any profile changes.
            </Typography>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
};

export default ProfilePage;
