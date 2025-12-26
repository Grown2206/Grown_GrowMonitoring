import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  TrendingUp as TrendIcon,
  Inventory as InventoryIcon,
  Settings as SystemIcon,
  Science as SensorIcon,
  LocalFlorist as PlantIcon,
  Search as SearchIcon,
  Visibility as PreviewIcon,
  GetApp as UseIcon,
} from '@mui/icons-material';
import { ReportConfig } from './ReportBuilder';

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'growth' | 'sensor' | 'inventory' | 'system' | 'custom';
  icon: React.ReactNode;
  config: ReportConfig;
  tags?: string[];
  popularity?: number;
}

export interface ReportTemplatesProps {
  onSelectTemplate?: (template: ReportTemplate) => void;
  onUseTemplate?: (template: ReportTemplate) => void;
}

const templates: ReportTemplate[] = [
  {
    id: 'growth-summary',
    name: 'Growth Summary Report',
    description: 'Comprehensive overview of plant growth metrics and trends over time',
    category: 'growth',
    icon: <PlantIcon />,
    popularity: 95,
    tags: ['growth', 'metrics', 'trends'],
    config: {
      name: 'Growth Summary',
      dataSource: 'growth_data',
      sections: [
        {
          id: 'metrics',
          type: 'metrics',
          title: 'Key Growth Metrics',
          config: { metrics: ['height', 'leaf_count', 'stem_width'] },
        },
        {
          id: 'growth-chart',
          type: 'chart',
          title: 'Growth Over Time',
          config: { chartType: 'line', metric: 'height' },
        },
        {
          id: 'comparison',
          type: 'table',
          title: 'Plant Comparison',
          config: { columns: ['plant_id', 'height', 'health_score'] },
        },
      ],
      layout: 'single',
      pageSize: 'A4',
      orientation: 'portrait',
    },
  },
  {
    id: 'sensor-analysis',
    name: 'Sensor Data Analysis',
    description: 'Detailed analysis of environmental sensor readings and patterns',
    category: 'sensor',
    icon: <SensorIcon />,
    popularity: 88,
    tags: ['sensors', 'environment', 'analysis'],
    config: {
      name: 'Sensor Analysis',
      dataSource: 'sensor_data',
      sections: [
        {
          id: 'temp-humidity',
          type: 'chart',
          title: 'Temperature & Humidity',
          config: { chartType: 'line' },
        },
        {
          id: 'light-levels',
          type: 'chart',
          title: 'Light Intensity',
          config: { chartType: 'area' },
        },
        {
          id: 'alerts',
          type: 'table',
          title: 'Alert Summary',
          config: { columns: ['timestamp', 'sensor', 'alert_type', 'value'] },
        },
      ],
      layout: 'two-column',
      pageSize: 'A4',
      orientation: 'landscape',
    },
  },
  {
    id: 'inventory-status',
    name: 'Inventory Status Report',
    description: 'Current inventory levels, usage trends, and reorder recommendations',
    category: 'inventory',
    icon: <InventoryIcon />,
    popularity: 76,
    tags: ['inventory', 'supplies', 'stock'],
    config: {
      name: 'Inventory Status',
      dataSource: 'inventory_data',
      sections: [
        {
          id: 'stock-levels',
          type: 'metrics',
          title: 'Stock Levels',
          config: { metrics: ['total_items', 'low_stock', 'out_of_stock'] },
        },
        {
          id: 'usage-chart',
          type: 'chart',
          title: 'Usage Trends',
          config: { chartType: 'bar' },
        },
        {
          id: 'reorder-list',
          type: 'table',
          title: 'Reorder Recommendations',
          config: { columns: ['item', 'current_stock', 'min_level', 'suggested_order'] },
        },
      ],
      layout: 'single',
      pageSize: 'A4',
      orientation: 'portrait',
    },
  },
  {
    id: 'system-performance',
    name: 'System Performance Report',
    description: 'System health metrics, uptime statistics, and performance indicators',
    category: 'system',
    icon: <SystemIcon />,
    popularity: 72,
    tags: ['system', 'performance', 'health'],
    config: {
      name: 'System Performance',
      dataSource: 'system_metrics',
      sections: [
        {
          id: 'uptime',
          type: 'metrics',
          title: 'Uptime & Availability',
          config: { metrics: ['uptime_percentage', 'total_hours', 'downtime_events'] },
        },
        {
          id: 'response-times',
          type: 'chart',
          title: 'Response Times',
          config: { chartType: 'line' },
        },
        {
          id: 'error-log',
          type: 'table',
          title: 'Recent Errors',
          config: { columns: ['timestamp', 'component', 'error_type', 'severity'] },
        },
      ],
      layout: 'single',
      pageSize: 'A4',
      orientation: 'portrait',
    },
  },
  {
    id: 'weekly-summary',
    name: 'Weekly Summary Report',
    description: 'Comprehensive weekly overview of all system activities and metrics',
    category: 'custom',
    icon: <TrendIcon />,
    popularity: 92,
    tags: ['summary', 'weekly', 'overview'],
    config: {
      name: 'Weekly Summary',
      dataSource: 'combined_data',
      sections: [
        {
          id: 'weekly-metrics',
          type: 'metrics',
          title: 'Week at a Glance',
          config: { metrics: ['total_plants', 'new_growth', 'alerts', 'tasks_completed'] },
        },
        {
          id: 'growth-trends',
          type: 'chart',
          title: 'Growth Trends',
          config: { chartType: 'line' },
        },
        {
          id: 'sensor-summary',
          type: 'chart',
          title: 'Environmental Conditions',
          config: { chartType: 'area' },
        },
        {
          id: 'activities',
          type: 'table',
          title: 'Key Activities',
          config: { columns: ['date', 'activity', 'status', 'notes'] },
        },
      ],
      layout: 'grid',
      pageSize: 'A4',
      orientation: 'landscape',
    },
  },
  {
    id: 'health-assessment',
    name: 'Plant Health Assessment',
    description: 'Detailed health analysis with disease detection and treatment recommendations',
    category: 'growth',
    icon: <PlantIcon />,
    popularity: 85,
    tags: ['health', 'disease', 'assessment'],
    config: {
      name: 'Health Assessment',
      dataSource: 'health_data',
      sections: [
        {
          id: 'health-score',
          type: 'metrics',
          title: 'Overall Health Score',
          config: { metrics: ['avg_health', 'healthy_plants', 'at_risk'] },
        },
        {
          id: 'health-distribution',
          type: 'chart',
          title: 'Health Distribution',
          config: { chartType: 'pie' },
        },
        {
          id: 'issues',
          type: 'table',
          title: 'Identified Issues',
          config: { columns: ['plant_id', 'issue', 'severity', 'recommendation'] },
        },
      ],
      layout: 'single',
      pageSize: 'A4',
      orientation: 'portrait',
    },
  },
];

/**
 * Pre-configured report templates gallery
 */
export function ReportTemplates({ onSelectTemplate, onUseTemplate }: ReportTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<ReportTemplate | null>(null);

  const categories = [
    { id: 'all', label: 'All Templates', count: templates.length },
    { id: 'growth', label: 'Growth', count: templates.filter((t) => t.category === 'growth').length },
    { id: 'sensor', label: 'Sensors', count: templates.filter((t) => t.category === 'sensor').length },
    { id: 'inventory', label: 'Inventory', count: templates.filter((t) => t.category === 'inventory').length },
    { id: 'system', label: 'System', count: templates.filter((t) => t.category === 'system').length },
    { id: 'custom', label: 'Custom', count: templates.filter((t) => t.category === 'custom').length },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (template: ReportTemplate) => {
    if (onUseTemplate) {
      onUseTemplate(template);
    }
  };

  const handlePreview = (template: ReportTemplate) => {
    setPreviewTemplate(template);
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'growth':
        return <PlantIcon />;
      case 'sensor':
        return <SensorIcon />;
      case 'inventory':
        return <InventoryIcon />;
      case 'system':
        return <SystemIcon />;
      default:
        return <ReportIcon />;
    }
  };

  return (
    <Box>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Category Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, newValue) => setSelectedCategory(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((cat) => (
            <Tab
              key={cat.id}
              value={cat.id}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>{cat.label}</Typography>
                  <Chip label={cat.count} size="small" />
                </Stack>
              }
            />
          ))}
        </Tabs>
      </Box>

      {/* Templates Grid */}
      <Grid container spacing={3}>
        {filteredTemplates.map((template) => (
          <Grid item xs={12} sm={6} md={4} key={template.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      {template.icon}
                    </Box>
                    {template.popularity && template.popularity > 80 && (
                      <Chip label="Popular" size="small" color="success" />
                    )}
                  </Stack>

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {template.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </Box>

                  {template.tags && (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                      {template.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  )}

                  <Stack direction="row" spacing={1} alignItems="center">
                    {getCategoryIcon(template.category)}
                    <Typography variant="caption" color="text.secondary">
                      {template.config.sections.length} sections • {template.config.layout} layout
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<PreviewIcon />}
                  onClick={() => handlePreview(template)}
                >
                  Preview
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<UseIcon />}
                  onClick={() => handleUseTemplate(template)}
                >
                  Use Template
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredTemplates.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <ReportIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No templates found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewTemplate !== null}
        onClose={() => setPreviewTemplate(null)}
        maxWidth="md"
        fullWidth
      >
        {previewTemplate && (
          <>
            <DialogTitle>
              <Stack direction="row" spacing={2} alignItems="center">
                {previewTemplate.icon}
                <Typography variant="h6">{previewTemplate.name}</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stack spacing={3}>
                <Typography variant="body1">{previewTemplate.description}</Typography>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Report Configuration
                  </Typography>
                  <Stack spacing={1} sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      • Data Source: {previewTemplate.config.dataSource}
                    </Typography>
                    <Typography variant="body2">
                      • Layout: {previewTemplate.config.layout}
                    </Typography>
                    <Typography variant="body2">
                      • Page Size: {previewTemplate.config.pageSize} ({previewTemplate.config.orientation})
                    </Typography>
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Report Sections ({previewTemplate.config.sections.length})
                  </Typography>
                  <Stack spacing={1}>
                    {previewTemplate.config.sections.map((section, index) => (
                      <Card key={section.id} variant="outlined">
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip label={`${index + 1}`} size="small" />
                            <Chip label={section.type} size="small" color="primary" />
                            <Typography variant="body2">{section.title}</Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewTemplate(null)}>Close</Button>
              <Button
                variant="contained"
                startIcon={<UseIcon />}
                onClick={() => {
                  handleUseTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
              >
                Use This Template
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
