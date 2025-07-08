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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { LocalHospital, Phone, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Country codes for mobile number input
const countryCodes = [
  { code: '+1', iso: 'US', name: 'United States' },
  { code: '+44', iso: 'GB', name: 'United Kingdom' },
  { code: '+91', iso: 'IN', name: 'India' },
  { code: '+86', iso: 'CN', name: 'China' },
  { code: '+81', iso: 'JP', name: 'Japan' },
  { code: '+49', iso: 'DE', name: 'Germany' },
  { code: '+33', iso: 'FR', name: 'France' },
  { code: '+39', iso: 'IT', name: 'Italy' },
  { code: '+34', iso: 'ES', name: 'Spain' },
  { code: '+7', iso: 'RU', name: 'Russia' },
];

type LoginStep = 'mobile' | 'otp';

const LoginPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<LoginStep>('mobile');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[2]); // Default to India
  const [mobile, setMobile] = useState('');
  const [userType, setUserType] = useState('PATIENT');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  const { requestOtp, validateOtp, resendOtp, loading } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Timer for resend OTP
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!mobile.trim()) {
      setError('Please enter a valid mobile number');
      return;
    }

    try {
      const result = await requestOtp(mobile, selectedCountry.iso, userType);
      if (result.success) {
        setSuccess(result.message || 'OTP sent successfully');
        setCurrentStep('otp');
        setResendTimer(30); // 30 seconds before resend is allowed
      } else {
        setError(result.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    }
  };

  const handleValidateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    try {
      const result = await validateOtp(mobile, selectedCountry.iso, otp, userType);
      if (result.success) {
        setSuccess(result.message || 'Login successful');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError(result.message || 'Invalid OTP. Please try again.');
        setOtp(''); // Clear OTP field for retry
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
      setOtp(''); // Clear OTP field for retry
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    
    setError('');
    setSuccess('');
    setOtp(''); // Clear current OTP input

    try {
      const result = await resendOtp(mobile, selectedCountry.iso, userType);
      if (result.success) {
        setSuccess(result.message || 'OTP resent successfully');
        setResendTimer(30); // Reset timer for next resend
      } else {
        setError(result.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  const goBackToMobile = () => {
    setCurrentStep('mobile');
    setOtp('');
    setError('');
    setSuccess('');
    setResendTimer(0);
  };

  const steps = ['Enter Mobile Number', 'Verify OTP'];

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
            {/* Step Indicator */}
            <Box sx={{ mb: 3 }}>
              <Stepper activeStep={currentStep === 'mobile' ? 0 : 1} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Mobile Number Step */}
            {currentStep === 'mobile' && (
              <form onSubmit={handleRequestOtp}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>User Type</InputLabel>
                  <Select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    label="User Type"
                    required
                  >
                    <MenuItem value="PATIENT">Patient</MenuItem>
                    <MenuItem value="DOCTOR">Doctor</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const country = countryCodes.find(c => c.code === e.target.value);
                      if (country) setSelectedCountry(country);
                    }}
                    label="Country"
                    required
                  >
                    {countryCodes.map((country) => (
                      <MenuItem key={country.iso} value={country.code}>
                        {country.code} - {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Mobile Number"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Enter mobile number without country code"
                  helperText={`Format: ${selectedCountry.code} followed by your mobile number`}
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                    {success}
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Send OTP'}
                </Button>
              </form>
            )}

            {/* OTP Verification Step */}
            {currentStep === 'otp' && (
              <form onSubmit={handleValidateOtp}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Verify OTP
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter the OTP sent to {selectedCountry.code} {mobile}
                  </Typography>
                </Box>

                <TextField
                  fullWidth
                  label="Enter OTP"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  margin="normal"
                  required
                  error={!!error}
                  helperText={error ? 'Enter the 6-digit OTP sent to your phone' : 'Enter the 6-digit OTP'}
                  inputProps={{
                    maxLength: 6,
                    style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
                  }}
                  placeholder="----"
                />

                {error && (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                    {success}
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Login'}
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Button
                    variant="text"
                    onClick={goBackToMobile}
                    disabled={loading}
                    size="small"
                  >
                    Change Number
                  </Button>
                  
                  <Button
                    variant="text"
                    onClick={handleResendOtp}
                    disabled={loading || resendTimer > 0}
                    startIcon={<Refresh />}
                    size="small"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </Button>
                </Box>

                {error && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Didn't receive the OTP? Check your phone or try resending.
                    </Typography>
                  </Box>
                )}
              </form>
            )}
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
