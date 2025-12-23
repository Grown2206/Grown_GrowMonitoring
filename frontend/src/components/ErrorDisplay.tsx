import React from 'react';
import { Alert, AlertTitle, Box, Button, Collapse, Paper, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import RefreshIcon from '@mui/icons-material/Refresh';

export interface ErrorDisplayProps {
  error: Error | string;
  title?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  severity?: 'error' | 'warning' | 'info';
}

export function ErrorDisplay({
  error,
  title = 'Ein Fehler ist aufgetreten',
  showDetails = false,
  onRetry,
  severity = 'error',
}: ErrorDisplayProps) {
  const [detailsExpanded, setDetailsExpanded] = React.useState(false);

  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  return (
    <Alert
      severity={severity}
      action={
        onRetry ? (
          <Button
            color="inherit"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Erneut versuchen
          </Button>
        ) : undefined
      }
    >
      <AlertTitle>{title}</AlertTitle>
      <Typography variant="body2">{errorMessage}</Typography>

      {showDetails && errorStack && (
        <Box sx={{ mt: 2 }}>
          <Button
            size="small"
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            endIcon={detailsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            Details {detailsExpanded ? 'ausblenden' : 'anzeigen'}
          </Button>
          <Collapse in={detailsExpanded}>
            <Paper
              sx={{
                mt: 1,
                p: 2,
                bgcolor: 'grey.100',
                maxHeight: 200,
                overflow: 'auto',
              }}
            >
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.7rem' }}>
                {errorStack}
              </Typography>
            </Paper>
          </Collapse>
        </Box>
      )}
    </Alert>
  );
}

/**
 * Inline error display for forms and inputs
 */
export function InlineError({ message }: { message: string }) {
  return (
    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
      {message}
    </Typography>
  );
}

/**
 * Full page error display
 */
export function FullPageError({
  error,
  onRetry,
}: {
  error: Error | string;
  onRetry?: () => void;
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 3,
      }}
    >
      <Typography variant="h5" gutterBottom color="error">
        Fehler beim Laden
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        {errorMessage}
      </Typography>
      {onRetry && (
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={onRetry}>
          Erneut versuchen
        </Button>
      )}
    </Box>
  );
}
