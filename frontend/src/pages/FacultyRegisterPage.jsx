import { useState } from 'react';
import { Alert, Box, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function FacultyRegisterPage() {
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, password, 'faculty');
      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister(credential) {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credential, 'faculty');
      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-up failed');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError() {
    setError('Google sign-up was cancelled or failed');
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
      <Paper elevation={10} sx={{ width: '100%', maxWidth: 440, p: 4 }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Typography variant="h4">Create Faculty Account</Typography>
          <Typography color="text.secondary">Register to manage your course roster.</Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth helperText="At least 6 characters" />
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </Button>
          <Divider>or</Divider>
          <GoogleAuthButton
            disabled={loading}
            loading={loading}
            label="Sign up with Google"
            onSuccess={handleGoogleRegister}
            onError={handleGoogleError}
          />
          <Typography variant="body2">
            Already have an account? <Link to="/faculty/login">Login</Link>
          </Typography>
          <Typography variant="body2">
            <Link to="/">Back</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
