import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { LocalHospital } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { email: 'doctor@example.com', password: 'password', role: 'Doctor' },
    { email: 'patient@example.com', password: 'password', role: 'Patient' },
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
              color: 'white',
              p: 3,
              textAlign: 'center',
            }}
          >
            <LocalHospital sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant={isMobile ? 'h5' : 'h4'} component="h1" fontWeight="bold">
              DocGenie
            </Typography>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Patient Management System
            </Typography>
          </Box>
          
          <CardContent sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                autoComplete="email"
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                required
                autoComplete="current-password"
                variant="outlined"
              />
              
              {error && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  background: 'linear-gradient(45deg, #1976d2 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1565c0 30%, #0288d1 90%)',
                  },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
            </form>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Demo Credentials:
              </Typography>
              {demoCredentials.map((cred, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  onClick={() => fillDemoCredentials(cred.email, cred.password)}
                  sx={{ mr: 1, mb: 1 }}
                >
                  {cred.role}
                </Button>
              ))}
            </Box>

            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
              Use the demo credentials above to explore the application
            </Typography>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
