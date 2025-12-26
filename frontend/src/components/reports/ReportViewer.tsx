import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  Fullscreen as FullscreenIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { ReportConfig, ReportSection } from './ReportBuilder';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer } from 'recharts';

export interface ReportData {
  config: ReportConfig;
  generatedAt: Date;
  data: any;
  metadata?: {
    recordCount?: number;
    dateRange?: { start: Date; end: Date };
    filters?: any[];
  };
}

export interface ReportViewerProps {
  report: ReportData;
  onDownload?: (format: 'pdf' | 'excel' | 'csv') => void;
  onPrint?: () => void;
  onShare?: () => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

/**
 * Interactive report viewer with export and sharing capabilities
 */
export function ReportViewer({
  report,
  onDownload,
  onPrint,
  onShare,
  onRefresh,
  loading = false,
}: ReportViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const renderMetrics = (section: ReportSection) => {
    const metrics = section.config.metrics || [];
    const sampleData = [
      { label: 'Total Plants', value: 142, change: '+12%' },
      { label: 'Avg Growth', value: '4.2cm', change: '+8%' },
      { label: 'Health Score', value: '94%', change: '+2%' },
    ];

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {section.title}
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 2 }}>
          {sampleData.map((metric, index) => (
            <Card key={index} sx={{ minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  {metric.label}
                </Typography>
                <Typography variant="h4">{metric.value}</Typography>
                <Chip
                  label={metric.change}
                  size="small"
                  color={metric.change.startsWith('+') ? 'success' : 'error'}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    );
  };

  const renderChart = (section: ReportSection) => {
    const chartType = section.config.chartType || 'line';
    const sampleData = [
      { name: 'Week 1', value: 24, temperature: 22, humidity: 65 },
      { name: 'Week 2', value: 28, temperature: 23, humidity: 68 },
      { name: 'Week 3', value: 32, temperature: 21, humidity: 62 },
      { name: 'Week 4', value: 35, temperature: 24, humidity: 70 },
      { name: 'Week 5', value: 38, temperature: 22, humidity: 66 },
      { name: 'Week 6', value: 42, temperature: 23, humidity: 67 },
    ];

    const pieData = [
      { name: 'Healthy', value: 85 },
      { name: 'At Risk', value: 10 },
      { name: 'Critical', value: 5 },
    ];

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {section.title}
        </Typography>
        <Paper sx={{ p: 2 }}>
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' && (
              <LineChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="temperature" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            )}
            {chartType === 'bar' && (
              <BarChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
                <Bar dataKey="humidity" fill="#82ca9d" />
              </BarChart>
            )}
            {chartType === 'pie' && (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            )}
          </ResponsiveContainer>
        </Paper>
      </Box>
    );
  };

  const renderTable = (section: ReportSection) => {
    const sampleData = [
      { id: 'P001', name: 'Tomato Plant A', height: '42cm', health: '95%', status: 'Healthy' },
      { id: 'P002', name: 'Lettuce B', height: '18cm', health: '88%', status: 'Healthy' },
      { id: 'P003', name: 'Pepper C', height: '35cm', health: '72%', status: 'At Risk' },
      { id: 'P004', name: 'Basil D', height: '25cm', health: '91%', status: 'Healthy' },
      { id: 'P005', name: 'Cucumber E', height: '48cm', health: '85%', status: 'Healthy' },
    ];

    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {section.title}
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Height</TableCell>
                <TableCell>Health</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.height}</TableCell>
                  <TableCell>{row.health}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      color={row.status === 'Healthy' ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const renderText = (section: ReportSection) => {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {section.title}
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body1">
            {section.config.content || 'Text content would appear here...'}
          </Typography>
        </Paper>
      </Box>
    );
  };

  const renderImage = (section: ReportSection) => {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {section.title}
        </Typography>
        <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
          <Box
            sx={{
              width: '100%',
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.200',
              borderRadius: 1,
            }}
          >
            <Typography color="text.secondary">Image Placeholder</Typography>
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderSection = (section: ReportSection) => {
    switch (section.type) {
      case 'metrics':
        return renderMetrics(section);
      case 'chart':
        return renderChart(section);
      case 'table':
        return renderTable(section);
      case 'text':
        return renderText(section);
      case 'image':
        return renderImage(section);
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} />
          <Typography variant="body1" color="text.secondary">
            Generating report...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ height: fullscreen ? '100vh' : 'auto', overflow: 'auto' }}>
      {/* Toolbar */}
      <Paper sx={{ mb: 2, position: 'sticky', top: 0, zIndex: 10 }}>
        <Toolbar>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{report.config.name}</Typography>
            <Chip
              label={`${report.config.sections.length} sections`}
              size="small"
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Zoom Out">
              <IconButton size="small" onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Typography variant="body2" sx={{ minWidth: 50, textAlign: 'center', alignSelf: 'center' }}>
              {zoom}%
            </Typography>
            <Tooltip title="Zoom In">
              <IconButton size="small" onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem />
            <Tooltip title="Refresh">
              <IconButton size="small" onClick={onRefresh}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton size="small" onClick={onPrint}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download">
              <IconButton size="small" onClick={() => onDownload?.('pdf')}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Share">
              <IconButton size="small" onClick={onShare}>
                <ShareIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              <IconButton size="small" onClick={() => setFullscreen(!fullscreen)}>
                {fullscreen ? <CloseIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </Paper>

      {/* Report Content */}
      <Box
        sx={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s',
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
          {/* Report Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" gutterBottom>
              {report.config.name}
            </Typography>
            {report.config.description && (
              <Typography variant="body1" color="text.secondary" paragraph>
                {report.config.description}
              </Typography>
            )}
            <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
              <Chip label={`Data: ${report.config.dataSource}`} size="small" />
              <Chip label={`Layout: ${report.config.layout}`} size="small" />
              {report.metadata?.recordCount && (
                <Chip label={`${report.metadata.recordCount} records`} size="small" />
              )}
            </Stack>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {/* Report Sections */}
          {report.config.sections.length === 0 ? (
            <Alert severity="info">This report has no sections configured.</Alert>
          ) : (
            report.config.sections.map((section) => (
              <Box key={section.id}>{renderSection(section)}</Box>
            ))
          )}

          {/* Report Footer */}
          <Divider sx={{ mt: 4, mb: 2 }} />
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            Report generated on {new Date(report.generatedAt).toLocaleString()} •{' '}
            {report.config.pageSize} {report.config.orientation}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
