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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Telegram as TelegramIcon,
  Email as EmailIcon,
  Webhook as WebhookIcon,
} from '@mui/icons-material';
import { Alert, PaginationMeta } from '../types';
import { alertsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { AlertConfigDialog } from '../components/AlertConfigDialog';
import { Pagination } from '../components/Pagination';

export function AlertManagement() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | undefined>();
  const { success, error } = useToast();

  // Filter and sort state
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEnabled, setFilterEnabled] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    loadAlerts();
  }, [pagination.page, pagination.limit, filterType, filterEnabled, sortBy]);

  async function loadAlerts() {
    try {
      // Build query params
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        sort: sortBy,
      };

      // Add filters
      if (filterType !== 'all') {
        params['filter[type]'] = filterType;
      }
      if (filterEnabled !== 'all') {
        params['filter[enabled]'] = filterEnabled === 'enabled';
      }

      const res = await alertsAPI.getAll(params);

      // Check if response has pagination
      if (res.data.data && res.data.pagination) {
        setAlerts(res.data.data);
        setPagination(res.data.pagination);
      } else {
        // Fallback for non-paginated response
        setAlerts(Array.isArray(res.data) ? res.data : []);
      }
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

      {/* Filters and Sorting */}
      <Box display="flex" gap={2} mb={3}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Typ</InputLabel>
          <Select
            value={filterType}
            label="Typ"
            onChange={(e) => {
              setFilterType(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
          >
            <MenuItem value="all">Alle Typen</MenuItem>
            <MenuItem value="email">Email</MenuItem>
            <MenuItem value="webhook">Webhook</MenuItem>
            <MenuItem value="telegram">Telegram</MenuItem>
            <MenuItem value="discord">Discord</MenuItem>
            <MenuItem value="sms">SMS</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterEnabled}
            label="Status"
            onChange={(e) => {
              setFilterEnabled(e.target.value);
              setPagination({ ...pagination, page: 1 });
            }}
          >
            <MenuItem value="all">Alle</MenuItem>
            <MenuItem value="enabled">Aktiviert</MenuItem>
            <MenuItem value="disabled">Deaktiviert</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Sortierung</InputLabel>
          <Select
            value={sortBy}
            label="Sortierung"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="name">Name (A-Z)</MenuItem>
            <MenuItem value="-name">Name (Z-A)</MenuItem>
            <MenuItem value="type">Typ</MenuItem>
            <MenuItem value="-createdAt">Neueste zuerst</MenuItem>
            <MenuItem value="createdAt">Älteste zuerst</MenuItem>
          </Select>
        </FormControl>
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

      {/* Pagination */}
      {pagination.total > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={(page) => setPagination({ ...pagination, page })}
          onLimitChange={(limit) => setPagination({ ...pagination, page: 1, limit })}
        />
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
