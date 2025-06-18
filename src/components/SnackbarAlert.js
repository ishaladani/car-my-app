import React from 'react';
import { Alert, Snackbar } from '@mui/material';

const SnackbarAlert = ({ showApiResponse, setShowApiResponse, apiResponseMessage }) => {
  return (
    <Snackbar
      open={showApiResponse}
      autoHideDuration={6000}
      onClose={() => setShowApiResponse(false)}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={() => setShowApiResponse(false)}
        severity={apiResponseMessage?.type || "info"}
        sx={{ width: "100%", borderRadius: 2, fontWeight: 500 }}
        variant="filled"
      >
        {apiResponseMessage?.message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarAlert;