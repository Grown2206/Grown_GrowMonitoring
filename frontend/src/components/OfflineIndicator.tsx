import React, { useEffect, useState, useCallback } from 'react';
import {
  Snackbar,
  Alert,
  Slide,
  Box,
  Typography,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  CloudOff,
  CloudQueue,
  Sync,
  Close,
} from '@mui/icons-material';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useServiceWorker } from '../hooks/useServiceWorker';

const SlideTransition = (props: any) => {
  return <Slide {...props} direction="down" />;
};

/**
 * Component that displays offline/online status and handles background sync
 */
export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { requestSensorSync, requestActionsSync } = useServiceWorker();
  const [showOffline, setShowOffline] = useState(false);
  const [showOnline, setShowOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      await Promise.all([
        requestSensorSync(),
        requestActionsSync(),
      ]);
      console.log('[Sync] Background sync triggered');
    } catch (error) {
      console.error('[Sync] Failed to trigger sync:', error);
    } finally {
      setTimeout(() => setIsSyncing(false), 2000);
    }
  }, [requestSensorSync, requestActionsSync]);

  useEffect(() => {
    if (!isOnline) {
      // User went offline
      setShowOffline(true);
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      // User came back online - trigger sync
      setShowOffline(false);
      setShowOnline(true);
      handleSync();

      // Hide online notification after 5 seconds
      const timer = setTimeout(() => {
        setShowOnline(false);
        setWasOffline(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, handleSync]);

  const handleClose = () => {
    setShowOffline(false);
    setShowOnline(false);
  };

  return (
    <>
      {/* Offline notification */}
      <Snackbar
        open={showOffline}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={SlideTransition}
      >
        <Alert
          severity="warning"
          icon={<CloudOff />}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <Close fontSize="small" />
            </IconButton>
          }
          sx={{ width: '100%', alignItems: 'center' }}
        >
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              Keine Internetverbindung
            </Typography>
            <Typography variant="body2">
              Du arbeitest im Offline-Modus. Änderungen werden automatisch synchronisiert, sobald die Verbindung wiederhergestellt ist.
            </Typography>
          </Box>
        </Alert>
      </Snackbar>

      {/* Online notification with sync */}
      <Snackbar
        open={showOnline}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={SlideTransition}
        autoHideDuration={5000}
        onClose={handleClose}
      >
        <Alert
          severity="success"
          icon={isSyncing ? <Sync className="rotate" /> : <CloudQueue />}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <Close fontSize="small" />
            </IconButton>
          }
          sx={{
            width: '100%',
            alignItems: 'center',
            '& .rotate': {
              animation: 'rotation 2s infinite linear',
            },
            '@keyframes rotation': {
              from: { transform: 'rotate(0deg)' },
              to: { transform: 'rotate(359deg)' },
            },
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Verbindung wiederhergestellt
            </Typography>
            <Typography variant="body2">
              {isSyncing
                ? 'Synchronisiere ausstehende Daten...'
                : 'Alle Daten wurden erfolgreich synchronisiert.'}
            </Typography>
            {isSyncing && (
              <LinearProgress
                sx={{ mt: 1, borderRadius: 1 }}
                color="inherit"
              />
            )}
          </Box>
        </Alert>
      </Snackbar>
    </>
  );
};
