import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  InsertChart as ChartIcon,
  TableChart as TableIcon,
  TextFields as TextIcon,
  Image as ImageIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Save as SaveIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';

export interface ReportSection {
  id: string;
  type: 'chart' | 'table' | 'text' | 'image' | 'metrics';
  title: string;
  config: any;
}

export interface ReportConfig {
  id?: string;
  name: string;
  description?: string;
  dataSource: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Array<{ field: string; operator: string; value: any }>;
  sections: ReportSection[];
  layout: 'single' | 'two-column' | 'grid';
  pageSize?: 'A4' | 'letter' | 'A3';
  orientation?: 'portrait' | 'landscape';
}

export interface ReportBuilderProps {
  initialConfig?: ReportConfig;
  availableDataSources?: Array<{ id: string; label: string; fields: string[] }>;
  onSave?: (config: ReportConfig) => void;
  onPreview?: (config: ReportConfig) => void;
}

const steps = ['Basic Info', 'Data Source', 'Sections', 'Layout & Preview'];

/**
 * Interactive report builder with step-by-step configuration
 */
export function ReportBuilder({
  initialConfig,
  availableDataSources = [],
  onSave,
  onPreview,
}: ReportBuilderProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [config, setConfig] = useState<ReportConfig>(
    initialConfig || {
      name: '',
      description: '',
      dataSource: '',
      sections: [],
      layout: 'single',
      pageSize: 'A4',
      orientation: 'portrait',
    }
  );

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(config);
    }
  };

  const addSection = (type: ReportSection['type']) => {
    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      type,
      title: `New ${type} section`,
      config: {},
    };
    setConfig((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const removeSection = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== id),
    }));
  };

  const updateSection = (id: string, updates: Partial<ReportSection>) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const renderBasicInfo = () => (
    <Stack spacing={3}>
      <TextField
        label="Report Name"
        value={config.name}
        onChange={(e) => setConfig({ ...config, name: e.target.value })}
        fullWidth
        required
      />
      <TextField
        label="Description"
        value={config.description || ''}
        onChange={(e) => setConfig({ ...config, description: e.target.value })}
        fullWidth
        multiline
        rows={3}
      />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Page Size</InputLabel>
            <Select
              value={config.pageSize}
              onChange={(e) => setConfig({ ...config, pageSize: e.target.value as any })}
              label="Page Size"
            >
              <MenuItem value="A4">A4</MenuItem>
              <MenuItem value="letter">Letter</MenuItem>
              <MenuItem value="A3">A3</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel>Orientation</InputLabel>
            <Select
              value={config.orientation}
              onChange={(e) => setConfig({ ...config, orientation: e.target.value as any })}
              label="Orientation"
            >
              <MenuItem value="portrait">Portrait</MenuItem>
              <MenuItem value="landscape">Landscape</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Stack>
  );

  const renderDataSource = () => {
    const selectedSource = availableDataSources.find((ds) => ds.id === config.dataSource);

    return (
      <Stack spacing={3}>
        <FormControl fullWidth required>
          <InputLabel>Data Source</InputLabel>
          <Select
            value={config.dataSource}
            onChange={(e) => setConfig({ ...config, dataSource: e.target.value })}
            label="Data Source"
          >
            {availableDataSources.map((ds) => (
              <MenuItem key={ds.id} value={ds.id}>
                {ds.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedSource && (
          <Alert severity="info">
            Available fields: {selectedSource.fields.join(', ')}
          </Alert>
        )}

        <Divider />

        <Typography variant="subtitle2">Date Range (Optional)</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Grid>
        </Grid>
      </Stack>
    );
  };

  const renderSections = () => (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Add Report Sections
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ChartIcon />}
            onClick={() => addSection('chart')}
            size="small"
          >
            Chart
          </Button>
          <Button
            variant="outlined"
            startIcon={<TableIcon />}
            onClick={() => addSection('table')}
            size="small"
          >
            Table
          </Button>
          <Button
            variant="outlined"
            startIcon={<TextIcon />}
            onClick={() => addSection('text')}
            size="small"
          >
            Text
          </Button>
          <Button
            variant="outlined"
            startIcon={<ImageIcon />}
            onClick={() => addSection('image')}
            size="small"
          >
            Image
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => addSection('metrics')}
            size="small"
          >
            Metrics
          </Button>
        </Stack>
      </Box>

      <Divider />

      {config.sections.length === 0 ? (
        <Alert severity="warning">
          No sections added yet. Add sections to build your report.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {config.sections.map((section, index) => (
            <Card key={section.id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DragIcon sx={{ color: 'text.secondary', cursor: 'move' }} />
                    <Chip label={section.type} size="small" color="primary" />
                    <Typography variant="subtitle2">{section.title}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <IconButton size="small" onClick={() => removeSection(section.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>

                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Section Title"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    fullWidth
                    size="small"
                  />
                </Box>

                {section.type === 'chart' && (
                  <Box sx={{ mt: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Chart Type</InputLabel>
                      <Select
                        value={section.config.chartType || 'line'}
                        onChange={(e) =>
                          updateSection(section.id, {
                            config: { ...section.config, chartType: e.target.value },
                          })
                        }
                        label="Chart Type"
                      >
                        <MenuItem value="line">Line Chart</MenuItem>
                        <MenuItem value="bar">Bar Chart</MenuItem>
                        <MenuItem value="pie">Pie Chart</MenuItem>
                        <MenuItem value="area">Area Chart</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {section.type === 'text' && (
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      label="Content"
                      value={section.config.content || ''}
                      onChange={(e) =>
                        updateSection(section.id, {
                          config: { ...section.config, content: e.target.value },
                        })
                      }
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );

  const renderLayout = () => (
    <Stack spacing={3}>
      <FormControl fullWidth>
        <InputLabel>Layout</InputLabel>
        <Select
          value={config.layout}
          onChange={(e) => setConfig({ ...config, layout: e.target.value as any })}
          label="Layout"
        >
          <MenuItem value="single">Single Column</MenuItem>
          <MenuItem value="two-column">Two Columns</MenuItem>
          <MenuItem value="grid">Grid Layout</MenuItem>
        </Select>
      </FormControl>

      <Divider />

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          Report Summary
        </Typography>
        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Name:</strong> {config.name || '(Not set)'}
            </Typography>
            <Typography variant="body2">
              <strong>Data Source:</strong> {config.dataSource || '(Not selected)'}
            </Typography>
            <Typography variant="body2">
              <strong>Sections:</strong> {config.sections.length}
            </Typography>
            <Typography variant="body2">
              <strong>Layout:</strong> {config.layout}
            </Typography>
            <Typography variant="body2">
              <strong>Page:</strong> {config.pageSize} ({config.orientation})
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {config.sections.length > 0 && (
        <Alert severity="success">
          Report is ready! You can preview or save it now.
        </Alert>
      )}
    </Stack>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderDataSource();
      case 2:
        return renderSections();
      case 3:
        return renderLayout();
      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mb: 4 }}>{renderStepContent()}</Box>

      <Divider sx={{ mb: 3 }} />

      <Stack direction="row" justifyContent="space-between">
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<BackIcon />}
        >
          Back
        </Button>
        <Stack direction="row" spacing={1}>
          {activeStep === steps.length - 1 && (
            <>
              <Button
                variant="outlined"
                startIcon={<PreviewIcon />}
                onClick={handlePreview}
              >
                Preview
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!config.name || !config.dataSource}
              >
                Save Report
              </Button>
            </>
          )}
          {activeStep < steps.length - 1 && (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<NextIcon />}
            >
              Next
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
