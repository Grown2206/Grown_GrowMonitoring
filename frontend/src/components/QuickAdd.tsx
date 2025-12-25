import React, { useState } from 'react';
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  LocalFlorist as PlantIcon,
  Sensors as SensorIcon,
  DeviceHub as DeviceIcon,
  Agriculture as HarvestIcon,
  PlayCircle as AutomationIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { api } from '../services/api';

type QuickAddType = 'plant' | 'sensor' | 'device' | 'harvest' | 'automation' | 'event';

interface QuickAddAction {
  icon: React.ReactElement;
  name: string;
  type: QuickAddType;
  shortcut?: string;
}

const ACTIONS: QuickAddAction[] = [
  { icon: <PlantIcon />, name: 'Add Plant', type: 'plant', shortcut: 'Ctrl+P' },
  { icon: <SensorIcon />, name: 'Add Sensor', type: 'sensor', shortcut: 'Ctrl+S' },
  { icon: <DeviceIcon />, name: 'Add Device', type: 'device', shortcut: 'Ctrl+D' },
  { icon: <HarvestIcon />, name: 'Add Harvest', type: 'harvest', shortcut: 'Ctrl+H' },
  { icon: <AutomationIcon />, name: 'Add Automation', type: 'automation', shortcut: 'Ctrl+A' },
  { icon: <EventIcon />, name: 'Add Event', type: 'event', shortcut: 'Ctrl+E' },
];

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentType, setCurrentType] = useState<QuickAddType | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        const action = ACTIONS.find(a => a.shortcut?.toLowerCase() === `${e.ctrlKey ? 'ctrl' : 'cmd'}+${e.key.toLowerCase()}`);
        if (action) {
          e.preventDefault();
          handleActionClick(action.type);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleActionClick = (type: QuickAddType) => {
    setCurrentType(type);
    setFormData(getDefaultFormData(type));
    setDialogOpen(true);
    setOpen(false);
  };

  const getDefaultFormData = (type: QuickAddType) => {
    switch (type) {
      case 'plant':
        return { name: '', phase: 'seedling', plantedDate: new Date().toISOString().split('T')[0] };
      case 'sensor':
        return { name: '', type: 'temperature' };
      case 'device':
        return { name: '', type: 'ESP32' };
      case 'harvest':
        return { harvestDate: new Date().toISOString().split('T')[0] };
      case 'automation':
        return { name: '', enabled: true };
      case 'event':
        return { title: '', eventDate: new Date().toISOString().split('T')[0], eventType: 'other' };
      default:
        return {};
    }
  };

  const handleSubmit = async () => {
    try {
      let endpoint = '';
      switch (currentType) {
        case 'plant':
          endpoint = '/plants';
          break;
        case 'sensor':
          endpoint = '/sensors-management';
          break;
        case 'device':
          endpoint = '/devices';
          break;
        case 'harvest':
          endpoint = '/harvests';
          break;
        case 'automation':
          endpoint = '/automation';
          break;
        case 'event':
          endpoint = '/events';
          break;
      }

      await api.post(endpoint, formData);
      setSnackbar({ open: true, message: `${currentType} created successfully!`, severity: 'success' });
      setDialogOpen(false);
      setFormData({});

      // Refresh the page or emit event to refresh data
      window.dispatchEvent(new CustomEvent('quickadd:success', { detail: { type: currentType } }));
    } catch (error: any) {
      setSnackbar({ open: true, message: error.response?.data?.error || 'Failed to create item', severity: 'error' });
    }
  };

  const renderDialogContent = () => {
    switch (currentType) {
      case 'plant':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Phase</InputLabel>
              <Select
                value={formData.phase || 'seedling'}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                label="Phase"
              >
                <MenuItem value="seedling">Seedling</MenuItem>
                <MenuItem value="vegetative">Vegetative</MenuItem>
                <MenuItem value="flowering">Flowering</MenuItem>
                <MenuItem value="harvested">Harvested</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Planted Date"
              type="date"
              value={formData.plantedDate || ''}
              onChange={(e) => setFormData({ ...formData, plantedDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );

      case 'sensor':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type || 'temperature'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="temperature">Temperature</MenuItem>
                <MenuItem value="humidity">Humidity</MenuItem>
                <MenuItem value="moisture">Moisture</MenuItem>
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="ph">pH</MenuItem>
                <MenuItem value="ec">EC</MenuItem>
                <MenuItem value="co2">CO2</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      case 'device':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type || 'ESP32'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                label="Type"
              >
                <MenuItem value="ESP32">ESP32</MenuItem>
                <MenuItem value="ESP8266">ESP8266</MenuItem>
                <MenuItem value="Raspberry Pi">Raspberry Pi</MenuItem>
                <MenuItem value="Arduino">Arduino</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="IP Address"
              value={formData.ipAddress || ''}
              onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
              fullWidth
              placeholder="192.168.1.100"
            />
          </Box>
        );

      case 'harvest':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Harvest Date"
              type="date"
              value={formData.harvestDate || ''}
              onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Wet Weight (g)"
              type="number"
              value={formData.wetWeight || ''}
              onChange={(e) => setFormData({ ...formData, wetWeight: parseFloat(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Dry Weight (g)"
              type="number"
              value={formData.dryWeight || ''}
              onChange={(e) => setFormData({ ...formData, dryWeight: parseFloat(e.target.value) })}
              fullWidth
            />
          </Box>
        );

      case 'event':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth>
              <InputLabel>Event Type</InputLabel>
              <Select
                value={formData.eventType || 'other'}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                label="Event Type"
              >
                <MenuItem value="feeding">Feeding</MenuItem>
                <MenuItem value="watering">Watering</MenuItem>
                <MenuItem value="pruning">Pruning</MenuItem>
                <MenuItem value="harvest">Harvest</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Event Date"
              type="date"
              value={formData.eventDate || ''}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <SpeedDial
        ariaLabel="Quick Add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
      >
        {ACTIONS.map((action) => (
          <SpeedDialAction
            key={action.type}
            icon={action.icon}
            tooltipTitle={`${action.name}${action.shortcut ? ` (${action.shortcut})` : ''}`}
            onClick={() => handleActionClick(action.type)}
          />
        ))}
      </SpeedDial>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentType && `Quick Add ${currentType.charAt(0).toUpperCase() + currentType.slice(1)}`}
        </DialogTitle>
        <DialogContent>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
