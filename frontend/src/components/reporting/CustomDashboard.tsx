import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';

export type WidgetType = 'chart' | 'metric' | 'table' | 'gauge';
export type WidgetSize = 'small' | 'medium' | 'large';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: WidgetSize;
  dataSource: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

export interface Dashboard {
  id: string;
  name: string;
  description: string;
  widgets: Widget[];
  isDefault: boolean;
  createdAt: Date;
}

export interface CustomDashboardProps {
  dashboards?: Dashboard[];
  onSaveDashboard?: (dashboard: Dashboard) => void;
}

export function CustomDashboard({
  dashboards: initialDashboards = [],
  onSaveDashboard,
}: CustomDashboardProps) {
  const [dashboards] = useState<Dashboard[]>(
    initialDashboards.length > 0 ? initialDashboards : getSampleDashboards()
  );
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(
    dashboards[0] || null
  );
  const [editMode, setEditMode] = useState(false);
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<WidgetType>('chart');
  const [formSize, setFormSize] = useState<WidgetSize>('medium');

  const handleAddWidget = () => {
    if (!selectedDashboard) return;
    const timestamp = new Date().getTime();
    const newWidget: Widget = {
      id: `widget-${timestamp}`,
      type: formType,
      title: formTitle,
      size: formSize,
      dataSource: 'default',
      config: {},
      position: { x: 0, y: selectedDashboard.widgets.length },
    };

    const updated = {
      ...selectedDashboard,
      widgets: [...selectedDashboard.widgets, newWidget],
    };

    setSelectedDashboard(updated);
    setWidgetDialogOpen(false);
    setFormTitle('');
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!selectedDashboard) return;
    const updated = {
      ...selectedDashboard,
      widgets: selectedDashboard.widgets.filter((w) => w.id !== widgetId),
    };
    setSelectedDashboard(updated);
  };

  const getWidgetGridSize = (size: WidgetSize) => {
    switch (size) {
      case 'small': return 4;
      case 'medium': return 6;
      case 'large': return 12;
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Custom Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Create and customize analytics dashboard
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant={editMode ? 'contained' : 'outlined'}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? 'Done' : 'Edit'}
          </Button>
          {editMode && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setWidgetDialogOpen(true)}
            >
              Add Widget
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {selectedDashboard?.widgets.map((widget) => (
          <Grid item xs={12} md={getWidgetGridSize(widget.size)} key={widget.id}>
            <Card>
              <CardHeader
                title={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {editMode && <DragIcon />}
                    <Typography variant="h6">{widget.title}</Typography>
                  </Stack>
                }
                action={
                  editMode && (
                    <IconButton onClick={() => handleDeleteWidget(widget.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )
                }
              />
              <CardContent>
                <Box sx={{ height: 200 }}>
                  <Typography color="text.secondary">
                    {widget.type} - {widget.dataSource}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={widgetDialogOpen} onClose={() => setWidgetDialogOpen(false)}>
        <DialogTitle>Add Widget</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={formType} onChange={(e) => setFormType(e.target.value as WidgetType)}>
                <MenuItem value="chart">Chart</MenuItem>
                <MenuItem value="metric">Metric</MenuItem>
                <MenuItem value="table">Table</MenuItem>
                <MenuItem value="gauge">Gauge</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Size</InputLabel>
              <Select value={formSize} onChange={(e) => setFormSize(e.target.value as WidgetSize)}>
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWidgetDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddWidget}>Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function getSampleDashboards(): Dashboard[] {
  return [
    {
      id: '1',
      name: 'Main Dashboard',
      description: 'Overview',
      widgets: [
        {
          id: 'w1',
          type: 'metric',
          title: 'Total Plants',
          size: 'small',
          dataSource: 'plants',
          config: {},
          position: { x: 0, y: 0 },
        },
      ],
      isDefault: true,
      createdAt: new Date(),
    },
  ];
}
