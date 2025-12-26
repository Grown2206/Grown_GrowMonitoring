import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Chip,
  Stack,
  TextField,
  Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ThermostatAuto as TempIcon,
  Opacity as HumidityIcon,
  WbSunny as LightIcon,
  LocalFlorist as PlantIcon,
  ShowChart as ChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  category: 'sensor' | 'chart' | 'plant' | 'automation' | 'notification' | 'utility';
  icon: React.ReactNode;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
  configurable: boolean;
  preview?: React.ReactNode;
}

export interface WidgetLibraryProps {
  onAddWidget?: (widget: WidgetDefinition) => void;
  existingWidgets?: string[];
}

const widgetDefinitions: WidgetDefinition[] = [
  {
    id: 'temperature-gauge',
    name: 'Temperature Gauge',
    description: 'Real-time temperature display with gauge',
    category: 'sensor',
    icon: <TempIcon />,
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    configurable: true,
  },
  {
    id: 'humidity-gauge',
    name: 'Humidity Gauge',
    description: 'Current humidity level with indicator',
    category: 'sensor',
    icon: <HumidityIcon />,
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    configurable: true,
  },
  {
    id: 'light-level',
    name: 'Light Level',
    description: 'PAR/Lux measurement display',
    category: 'sensor',
    icon: <LightIcon />,
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    configurable: true,
  },
  {
    id: 'sensor-chart',
    name: 'Sensor Chart',
    description: 'Historical sensor data chart',
    category: 'chart',
    icon: <ChartIcon />,
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    configurable: true,
  },
  {
    id: 'multi-sensor-chart',
    name: 'Multi-Sensor Chart',
    description: 'Compare multiple sensors',
    category: 'chart',
    icon: <TimelineIcon />,
    defaultSize: { w: 6, h: 3 },
    minSize: { w: 4, h: 2 },
    configurable: true,
  },
  {
    id: 'sensor-distribution',
    name: 'Sensor Distribution',
    description: 'Pie chart of sensor readings',
    category: 'chart',
    icon: <PieChartIcon />,
    defaultSize: { w: 3, h: 3 },
    minSize: { w: 2, h: 2 },
    configurable: true,
  },
  {
    id: 'sensor-comparison',
    name: 'Sensor Comparison',
    description: 'Bar chart comparing sensors',
    category: 'chart',
    icon: <BarChartIcon />,
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    configurable: true,
  },
  {
    id: 'plant-status',
    name: 'Plant Status',
    description: 'Overview of plant health',
    category: 'plant',
    icon: <PlantIcon />,
    defaultSize: { w: 3, h: 2 },
    minSize: { w: 2, h: 2 },
    configurable: true,
  },
  {
    id: 'plant-grid',
    name: 'Plant Grid',
    description: 'Grid view of all plants',
    category: 'plant',
    icon: <PlantIcon />,
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 4, h: 3 },
    configurable: false,
  },
  {
    id: 'notifications-feed',
    name: 'Notifications Feed',
    description: 'Recent notifications list',
    category: 'notification',
    icon: <NotificationIcon />,
    defaultSize: { w: 3, h: 4 },
    minSize: { w: 2, h: 3 },
    configurable: true,
  },
  {
    id: 'schedule-calendar',
    name: 'Schedule Calendar',
    description: 'Upcoming watering/feeding schedule',
    category: 'automation',
    icon: <ScheduleIcon />,
    defaultSize: { w: 4, h: 3 },
    minSize: { w: 3, h: 2 },
    configurable: true,
  },
  {
    id: 'quick-actions',
    name: 'Quick Actions',
    description: 'Frequently used controls',
    category: 'utility',
    icon: <SettingsIcon />,
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    configurable: true,
  },
];

/**
 * Widget library for browsing and adding dashboard widgets
 */
export function WidgetLibrary({ onAddWidget, existingWidgets = [] }: WidgetLibraryProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Widgets', icon: <DashboardIcon /> },
    { id: 'sensor', label: 'Sensors', icon: <TempIcon /> },
    { id: 'chart', label: 'Charts', icon: <ChartIcon /> },
    { id: 'plant', label: 'Plants', icon: <PlantIcon /> },
    { id: 'automation', label: 'Automation', icon: <ScheduleIcon /> },
    { id: 'notification', label: 'Notifications', icon: <NotificationIcon /> },
    { id: 'utility', label: 'Utilities', icon: <SettingsIcon /> },
  ];

  const filteredWidgets = widgetDefinitions.filter((widget) => {
    const matchesSearch =
      widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      widget.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddWidget = (widget: WidgetDefinition) => {
    if (onAddWidget) {
      onAddWidget(widget);
    }
    setOpen(false);
  };

  const isWidgetAdded = (widgetId: string) => existingWidgets.includes(widgetId);

  return (
    <>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} fullWidth>
        Add Widget
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Widget Library</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
          />

          {/* Category Filter */}
          <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap">
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                onClick={() => setSelectedCategory(cat.id)}
                color={selectedCategory === cat.id ? 'primary' : 'default'}
                variant={selectedCategory === cat.id ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>

          {/* Widget Grid */}
          <Grid container spacing={2}>
            {filteredWidgets.map((widget) => {
              const added = isWidgetAdded(widget.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={widget.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 4 },
                      opacity: added ? 0.6 : 1,
                    }}
                    onClick={() => !added && handleAddWidget(widget)}
                  >
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: added ? 'grey.400' : 'primary.main' }}>{widget.icon}</Avatar>
                      }
                      title={widget.name}
                      subheader={widget.category}
                      action={
                        added ? (
                          <Chip label="Added" size="small" color="success" />
                        ) : (
                          <IconButton>
                            <AddIcon />
                          </IconButton>
                        )
                      }
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">
                        {widget.description}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Chip
                          label={`${widget.defaultSize.w}x${widget.defaultSize.h}`}
                          size="small"
                          variant="outlined"
                        />
                        {widget.configurable && <Chip label="Configurable" size="small" variant="outlined" />}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {filteredWidgets.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No widgets found
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * Get widget definition by ID
 */
export function getWidgetDefinition(id: string): WidgetDefinition | undefined {
  return widgetDefinitions.find((w) => w.id === id);
}

/**
 * Get all widget definitions
 */
export function getAllWidgetDefinitions(): WidgetDefinition[] {
  return widgetDefinitions;
}
