import { useState } from 'react';
import { Alert, Box, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function FacultyLoginPage() {
  const { login, googleLogin } = useAuth();
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
      await login(username, password);
      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(credential) {
    setError('');
    setLoading(true);
    try {
      await googleLogin(credential, 'faculty');
      navigate('/faculty/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError() {
    setError('Google sign-in was cancelled or failed');
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', px: 2 }}>
      <Paper elevation={10} sx={{ width: '100%', maxWidth: 440, p: 4 }}>
        <Stack spacing={2} component="form" onSubmit={handleSubmit}>
          <Typography variant="h4">Faculty Portal</Typography>
          <Typography color="text.secondary">Sign in to manage your courses.</Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required fullWidth />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
          <Divider>or</Divider>
          <GoogleAuthButton
            disabled={loading}
            loading={loading}
            label="Continue with Google"
            onSuccess={handleGoogleLogin}
            onError={handleGoogleError}
          />
          <Typography variant="body2">
            No account yet? <Link to="/faculty/register">Create one</Link>
          </Typography>
          <Typography variant="body2">
            <Link to="/">Back</Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
