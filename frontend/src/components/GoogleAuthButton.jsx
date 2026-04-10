import { Alert, Box } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';

export default function GoogleAuthButton({ disabled, loading, label, onSuccess, onError }) {
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
    return <Alert severity="warning">Google sign-in is unavailable because `VITE_GOOGLE_CLIENT_ID` is missing.</Alert>;
  }

  return (
    <Box sx={{ opacity: disabled || loading ? 0.6 : 1, pointerEvents: disabled || loading ? 'none' : 'auto' }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (!credentialResponse.credential) {
            onError?.();
            return;
          }

          onSuccess(credentialResponse.credential);
        }}
        onError={onError}
        text={label === 'Continue with Google' ? 'continue_with' : 'signup_with'}
        useOneTap={false}
        width="360"
      />
    </Box>
  );
}
