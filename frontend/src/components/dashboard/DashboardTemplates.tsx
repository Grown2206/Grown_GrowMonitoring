import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Agriculture as GrowIcon,
  Science as AnalyticsIcon,
  AutoMode as AutomationIcon,
  Sensors as SensorsIcon,
  Close as CloseIcon,
  CheckCircle as ApplyIcon,
} from '@mui/icons-material';

export interface DashboardLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'beginner' | 'advanced' | 'monitoring' | 'automation' | 'analytics';
  layouts: DashboardLayout[];
  preview?: string;
  tags: string[];
}

const dashboardTemplates: DashboardTemplate[] = [
  {
    id: 'beginner-basic',
    name: 'Beginner Dashboard',
    description: 'Simple dashboard with essential sensors and plant status',
    icon: <DashboardIcon />,
    category: 'beginner',
    tags: ['simple', 'essential', 'starter'],
    layouts: [
      { i: 'temperature-gauge', x: 0, y: 0, w: 2, h: 2 },
      { i: 'humidity-gauge', x: 2, y: 0, w: 2, h: 2 },
      { i: 'light-level', x: 4, y: 0, w: 2, h: 2 },
      { i: 'plant-status', x: 0, y: 2, w: 3, h: 2 },
      { i: 'notifications-feed', x: 3, y: 2, w: 3, h: 4 },
      { i: 'sensor-chart', x: 0, y: 4, w: 6, h: 3 },
    ],
  },
  {
    id: 'grower-complete',
    name: 'Complete Grower Setup',
    description: 'Full-featured dashboard for experienced growers',
    icon: <GrowIcon />,
    category: 'advanced',
    tags: ['complete', 'advanced', 'professional'],
    layouts: [
      { i: 'temperature-gauge', x: 0, y: 0, w: 2, h: 2 },
      { i: 'humidity-gauge', x: 2, y: 0, w: 2, h: 2 },
      { i: 'light-level', x: 4, y: 0, w: 2, h: 2 },
      { i: 'plant-grid', x: 0, y: 2, w: 6, h: 4 },
      { i: 'multi-sensor-chart', x: 0, y: 6, w: 6, h: 3 },
      { i: 'schedule-calendar', x: 0, y: 9, w: 4, h: 3 },
      { i: 'quick-actions', x: 4, y: 9, w: 2, h: 2 },
    ],
  },
  {
    id: 'monitoring-focused',
    name: 'Monitoring Focus',
    description: 'Optimized for continuous sensor monitoring',
    icon: <SensorsIcon />,
    category: 'monitoring',
    tags: ['sensors', 'monitoring', 'realtime'],
    layouts: [
      { i: 'temperature-gauge', x: 0, y: 0, w: 2, h: 2 },
      { i: 'humidity-gauge', x: 2, y: 0, w: 2, h: 2 },
      { i: 'light-level', x: 4, y: 0, w: 2, h: 2 },
      { i: 'sensor-chart', x: 0, y: 2, w: 4, h: 3 },
      { i: 'multi-sensor-chart', x: 0, y: 5, w: 6, h: 3 },
      { i: 'sensor-comparison', x: 0, y: 8, w: 4, h: 3 },
      { i: 'sensor-distribution', x: 4, y: 8, w: 2, h: 3 },
    ],
  },
  {
    id: 'automation-control',
    name: 'Automation Control Center',
    description: 'Perfect for managing automated grow systems',
    icon: <AutomationIcon />,
    category: 'automation',
    tags: ['automation', 'control', 'scheduling'],
    layouts: [
      { i: 'quick-actions', x: 0, y: 0, w: 2, h: 2 },
      { i: 'schedule-calendar', x: 2, y: 0, w: 4, h: 3 },
      { i: 'plant-status', x: 0, y: 2, w: 3, h: 2 },
      { i: 'notifications-feed', x: 3, y: 3, w: 3, h: 4 },
      { i: 'sensor-chart', x: 0, y: 4, w: 6, h: 3 },
    ],
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Data-driven insights with multiple chart views',
    icon: <AnalyticsIcon />,
    category: 'analytics',
    tags: ['analytics', 'charts', 'insights'],
    layouts: [
      { i: 'sensor-chart', x: 0, y: 0, w: 4, h: 3 },
      { i: 'sensor-comparison', x: 4, y: 0, w: 2, h: 3 },
      { i: 'multi-sensor-chart', x: 0, y: 3, w: 6, h: 3 },
      { i: 'sensor-distribution', x: 0, y: 6, w: 3, h: 3 },
      { i: 'plant-status', x: 3, y: 6, w: 3, h: 2 },
    ],
  },
  {
    id: 'minimal-clean',
    name: 'Minimal & Clean',
    description: 'Minimalist layout with only essential information',
    icon: <DashboardIcon />,
    category: 'beginner',
    tags: ['minimal', 'clean', 'simple'],
    layouts: [
      { i: 'temperature-gauge', x: 0, y: 0, w: 2, h: 2 },
      { i: 'humidity-gauge', x: 2, y: 0, w: 2, h: 2 },
      { i: 'plant-status', x: 0, y: 2, w: 4, h: 2 },
      { i: 'sensor-chart', x: 0, y: 4, w: 4, h: 3 },
    ],
  },
];

export interface DashboardTemplatesProps {
  onApplyTemplate?: (template: DashboardTemplate) => void;
  currentTemplate?: string;
}

/**
 * Dashboard template selector with previews
 */
export function DashboardTemplates({ onApplyTemplate, currentTemplate }: DashboardTemplatesProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null);

  const handleApply = (template: DashboardTemplate) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
    }
    setOpen(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'beginner':
        return 'success';
      case 'advanced':
        return 'warning';
      case 'monitoring':
        return 'info';
      case 'automation':
        return 'secondary';
      case 'analytics':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Button variant="outlined" startIcon={<DashboardIcon />} onClick={() => setOpen(true)} fullWidth>
        Load Template
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Dashboard Templates</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Choose a template to quickly set up your dashboard. You can customize it afterwards.
          </Alert>

          <Grid container spacing={3}>
            {dashboardTemplates.map((template) => {
              const isActive = template.id === currentTemplate;
              return (
                <Grid item xs={12} sm={6} md={4} key={template.id}>
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      border: isActive ? 2 : 0,
                      borderColor: 'primary.main',
                      '&:hover': { boxShadow: 6 },
                    }}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader
                      avatar={template.icon}
                      title={template.name}
                      subheader={
                        <Chip
                          label={template.category}
                          size="small"
                          color={getCategoryColor(template.category) as any}
                        />
                      }
                      action={
                        isActive && <Chip label="Active" size="small" color="primary" />
                      }
                    />

                    {/* Preview visualization */}
                    <CardMedia sx={{ height: 140, bgcolor: 'action.hover', position: 'relative', p: 2 }}>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(6, 1fr)',
                          gridTemplateRows: 'repeat(4, 1fr)',
                          gap: 0.5,
                          height: '100%',
                        }}
                      >
                        {template.layouts.map((layout) => (
                          <Box
                            key={layout.i}
                            sx={{
                              gridColumn: `span ${layout.w}`,
                              gridRow: `span ${Math.min(layout.h, 4)}`,
                              bgcolor: 'primary.light',
                              borderRadius: 1,
                              opacity: 0.7,
                            }}
                          />
                        ))}
                      </Box>
                    </CardMedia>

                    <CardContent>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {template.description}
                      </Typography>
                      <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                        {template.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" variant="outlined" />
                        ))}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {template.layouts.length} widgets
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          {selectedTemplate && (
            <Button
              variant="contained"
              startIcon={<ApplyIcon />}
              onClick={() => handleApply(selectedTemplate)}
            >
              Apply Template
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): DashboardTemplate | undefined {
  return dashboardTemplates.find((t) => t.id === id);
}

/**
 * Get all templates
 */
export function getAllTemplates(): DashboardTemplate[] {
  return dashboardTemplates;
}
