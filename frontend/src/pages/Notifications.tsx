import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Button,
  Switch,
  Divider,
  Alert,
  FormControlLabel,
  alpha,
} from '@mui/material';
import {
  Notifications as NotifIcon,
  NotificationsActive as ActiveIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  WaterDrop as WaterIcon,
  Thermostat as TempIcon,
  Opacity as HumidityIcon,
} from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';

interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'system' | 'plant' | 'sensor' | 'automation';
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'warning',
      title: 'Niedriger Wasserstand',
      message: 'Tank-Level bei Sensor 1 ist unter 20%',
      timestamp: new Date().toISOString(),
      read: false,
      category: 'sensor',
    },
    {
      id: 2,
      type: 'info',
      title: 'Bewässerung abgeschlossen',
      message: 'Automatische Bewässerung für Pflanze "Tomato #1" abgeschlossen',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      category: 'automation',
    },
    {
      id: 3,
      type: 'success',
      title: 'Zeitplan ausgeführt',
      message: 'Licht-Zeitplan "Hauptlicht" erfolgreich aktiviert',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true,
      category: 'automation',
    },
    {
      id: 4,
      type: 'error',
      title: 'Sensor-Fehler',
      message: 'Sensor 3 antwortet nicht mehr',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      read: true,
      category: 'sensor',
    },
  ]);

  const [pushEnabled, setPushEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const { success, info } = useToast();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const enablePushNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushEnabled(true);
        success('Push-Benachrichtigungen aktiviert');

        // Register service worker for push
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            console.log('Service Worker ready for push notifications');
          });
        }
      } else {
        info('Push-Benachrichtigungen wurden abgelehnt');
      }
    }
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    success('Alle als gelesen markiert');
  };

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    info('Benachrichtigung gelöscht');
  };

  const getIcon = (type: string, category: string) => {
    if (category === 'sensor') {
      if (type === 'warning') return <WaterIcon color="warning" />;
      return <TempIcon color={type === 'error' ? 'error' : 'info'} />;
    }

    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'warning':
        return '#ff9800';
      case 'error':
        return '#f44336';
      default:
        return '#2196f3';
    }
  };

  const categoryLabels = {
    system: 'System',
    plant: 'Pflanze',
    sensor: 'Sensor',
    automation: 'Automation',
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4">Benachrichtigungen</Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount} ungelesen
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          {unreadCount > 0 && (
            <Button variant="outlined" onClick={markAllAsRead}>
              Alle als gelesen
            </Button>
          )}
          <IconButton>
            <SettingsIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Settings */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <SettingsIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Einstellungen
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box mb={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pushEnabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          enablePushNotifications();
                        } else {
                          setPushEnabled(false);
                        }
                      }}
                    />
                  }
                  label="Push-Benachrichtigungen"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Erhalte Benachrichtigungen auch wenn die App geschlossen ist
                </Typography>
              </Box>

              <Box mb={3}>
                <FormControlLabel
                  control={<Switch checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />}
                  label="E-Mail-Benachrichtigungen"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Wichtige Meldungen per E-Mail erhalten
                </Typography>
              </Box>

              {!pushEnabled && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Aktiviere Push-Benachrichtigungen für Echtzeit-Alerts auf deinem Gerät
                </Alert>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" gutterBottom>
                Benachrichtigungen für:
              </Typography>
              <List dense>
                <ListItem>
                  <FormControlLabel control={<Switch defaultChecked size="small" />} label="Sensor-Alarme" />
                </ListItem>
                <ListItem>
                  <FormControlLabel control={<Switch defaultChecked size="small" />} label="Bewässerungs-Events" />
                </ListItem>
                <ListItem>
                  <FormControlLabel control={<Switch defaultChecked size="small" />} label="Zeitplan-Ausführung" />
                </ListItem>
                <ListItem>
                  <FormControlLabel control={<Switch size="small" />} label="System-Updates" />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistik
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Gesamt</Typography>
                  <Chip label={notifications.length} size="small" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Ungelesen</Typography>
                  <Chip label={unreadCount} size="small" color="primary" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Warnungen</Typography>
                  <Chip label={notifications.filter((n) => n.type === 'warning').length} size="small" color="warning" />
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2">Fehler</Typography>
                  <Chip label={notifications.filter((n) => n.type === 'error').length} size="small" color="error" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications List */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Aktuelle Benachrichtigungen
              </Typography>
              <List>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.read ? 'transparent' : alpha(getColor(notification.type), 0.05),
                        borderRadius: 2,
                        mb: 1,
                        border: notification.read ? 'none' : `1px solid ${alpha(getColor(notification.type), 0.2)}`,
                      }}
                      secondaryAction={
                        <Box>
                          {!notification.read && (
                            <Button size="small" onClick={() => markAsRead(notification.id)}>
                              Gelesen
                            </Button>
                          )}
                          <IconButton edge="end" onClick={() => deleteNotification(notification.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      }
                    >
                      <ListItemIcon>{getIcon(notification.type, notification.category)}</ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="subtitle1" fontWeight={notification.read ? 'normal' : 'bold'}>
                              {notification.title}
                            </Typography>
                            <Chip label={categoryLabels[notification.category]} size="small" variant="outlined" />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {notification.message}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(notification.timestamp).toLocaleString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>

              {notifications.length === 0 && (
                <Box textAlign="center" py={4}>
                  <NotifIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    Keine Benachrichtigungen
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
