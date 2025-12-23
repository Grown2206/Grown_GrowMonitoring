import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  IconButton,
  Chip,
  Switch,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Telegram as TelegramIcon,
  Email as EmailIcon,
  Webhook as WebhookIcon,
} from '@mui/icons-material';
import { Alert } from '../types';
import { alertsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { AlertConfigDialog } from '../components/AlertConfigDialog';

export function AlertManagement() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | undefined>();
  const { success, error } = useToast();

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      const res = await alertsAPI.getAll();
      setAlerts(res.data);
    } catch (err) {
      error('Fehler beim Laden der Alerts');
    }
  }

  async function handleSave(alertData: Partial<Alert>) {
    try {
      if (editingAlert) {
        await alertsAPI.update(editingAlert.id, alertData);
        success('Alert aktualisiert');
      } else {
        await alertsAPI.create(alertData);
        success('Alert erstellt');
      }
      loadAlerts();
    } catch (err) {
      error('Fehler beim Speichern');
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Alert löschen?')) return;
    try {
      await alertsAPI.delete(id);
      success('Alert gelöscht');
      loadAlerts();
    } catch (err) {
      error('Fehler beim Löschen');
    }
  }

  async function toggleEnabled(alert: Alert) {
    try {
      await alertsAPI.update(alert.id, { enabled: !alert.enabled });
      loadAlerts();
    } catch (err) {
      error('Fehler beim Aktualisieren');
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'telegram':
        return <TelegramIcon />;
      case 'discord':
        return <WebhookIcon color="primary" />;
      case 'email':
        return <EmailIcon />;
      default:
        return <WebhookIcon />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Alert Verwaltung</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingAlert(undefined);
            setDialogOpen(true);
          }}
        >
          Neuer Alert
        </Button>
      </Box>

      <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {alerts.map((alert) => (
          <Card key={alert.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>{getTypeIcon(alert.type)}</Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{alert.name}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip label={alert.type} size="small" color="primary" />
                    <Chip label={alert.condition} size="small" />
                    <Chip label={`Schwelle: ${alert.threshold}`} size="small" />
                    <Chip label={`Cooldown: ${alert.cooldownMinutes}min`} size="small" variant="outlined" />
                  </Box>
                  {alert.lastTriggered && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Zuletzt ausgelöst: {new Date(alert.lastTriggered).toLocaleString('de-DE')}
                    </Typography>
                  )}
                </Box>

                <Switch checked={alert.enabled} onChange={() => toggleEnabled(alert)} />

                <IconButton
                  onClick={() => {
                    setEditingAlert(alert);
                    setDialogOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>

                <IconButton onClick={() => handleDelete(alert.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>

      {alerts.length === 0 && (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              Noch keine Alerts konfiguriert. Erstellen Sie Ihren ersten Alert!
            </Typography>
          </CardContent>
        </Card>
      )}

      <AlertConfigDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingAlert(undefined);
        }}
        onSave={handleSave}
        alert={editingAlert}
      />
    </Container>
  );
}
