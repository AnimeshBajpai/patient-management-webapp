import React from 'react';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  Business,
  LocationOn,
  VerifiedUser,
  Badge,
  Wc,
} from '@mui/icons-material';
import { UserProfile } from '../types';

interface UserProfileCardProps {
  user: UserProfile;
  compact?: boolean;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, compact = false }) => {
  const theme = useTheme();

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'DOCTOR':
        return 'primary';
      case 'PATIENT':
        return 'secondary';
      case 'ADMIN':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'DOCTOR':
        return 'Doctor';
      case 'PATIENT':
        return 'Patient';
      case 'ADMIN':
        return 'Administrator';
      default:
        return userType;
    }
  };

  const getGenderLabel = (gender?: string) => {
    switch (gender) {
      case 'MALE':
        return 'Male';
      case 'FEMALE':
        return 'Female';
      case 'OTHER':
        return 'Other';
      default:
        return 'Not specified';
    }
  };

  if (compact) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: theme.palette.primary.main,
                fontSize: '1.25rem',
                fontWeight: 'bold',
              }}
            >
              {user.initials}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" component="h2" fontWeight="bold">
                {user.displayName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip
                  label={getUserTypeLabel(user.userType)}
                  size="small"
                  color={getUserTypeColor(user.userType) as any}
                  variant="outlined"
                />
                {user.mobileVerified && (
                  <Chip
                    icon={<VerifiedUser />}
                    label="Verified"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header with Avatar and Basic Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: theme.palette.primary.main,
              fontSize: '2rem',
              fontWeight: 'bold',
            }}
          >
            {user.initials}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" component="h2" fontWeight="bold" gutterBottom>
              {user.displayName}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              <Chip
                label={getUserTypeLabel(user.userType)}
                color={getUserTypeColor(user.userType) as any}
                variant="filled"
              />
              {user.department && (
                <Chip
                  label={user.department}
                  variant="outlined"
                  size="small"
                />
              )}
              <Chip
                label={user.status ? 'Active' : 'Inactive'}
                color={user.status ? 'success' : 'error'}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Contact Information */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Contact Information
        </Typography>
        <List dense sx={{ mb: 2 }}>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <Phone color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={user.mobile}
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Mobile
                  </Typography>
                  {user.mobileVerified && (
                    <Chip
                      icon={<VerifiedUser />}
                      label="Verified"
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              }
            />
          </ListItem>
          
          {user.email && (
            <ListItem sx={{ px: 0 }}>
              <ListItemIcon>
                <Email color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={user.email}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    {user.emailVerified && (
                      <Chip
                        icon={<VerifiedUser />}
                        label="Verified"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
              />
            </ListItem>
          )}
        </List>

        {/* Additional Information */}
        {(user.gender || user.nationality || user.department) && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Additional Information
            </Typography>
            <List dense>
              {user.gender && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Wc color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={getGenderLabel(user.gender)}
                    secondary="Gender"
                  />
                </ListItem>
              )}
              
              {user.nationality && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <LocationOn color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={user.nationality}
                    secondary="Nationality"
                  />
                </ListItem>
              )}
              
              {user.department && (
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Business color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={user.department}
                    secondary="Department"
                  />
                </ListItem>
              )}
            </List>
          </>
        )}

        {/* Account Information */}
        <Divider sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Account Information
        </Typography>
        <List dense>
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <Badge color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={user.uuid}
              secondary="User ID"
            />
          </ListItem>
          
          <ListItem sx={{ px: 0 }}>
            <ListItemIcon>
              <Person color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={getUserTypeLabel(user.userType)}
              secondary="Account Type"
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;
