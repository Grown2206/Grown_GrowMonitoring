import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  Avatar,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Person as UserIcon,
  Schedule as TimeIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'export'
  | 'import'
  | 'configure'
  | 'approve'
  | 'reject';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AuditCategory = 'user' | 'plant' | 'sensor' | 'system' | 'security' | 'data' | 'settings';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  category: AuditCategory;
  severity: AuditSeverity;
  resource: string;
  resourceId?: string;
  details: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
}

export interface AuditLogProps {
  entries?: AuditEntry[];
  onExport?: (format: 'csv' | 'json' | 'pdf') => void;
  onViewDetails?: (entry: AuditEntry) => void;
  showFilters?: boolean;
}

/**
 * Comprehensive audit log viewer with filtering and export
 */
export function AuditLog({
  entries: initialEntries = [],
  onExport,
  onViewDetails,
  showFilters = true,
}: AuditLogProps) {
  const [entries] = useState<AuditEntry[]>(
    initialEntries.length > 0 ? initialEntries : getSampleEntries()
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<AuditCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | 'all'>('all');
  const [successFilter, setSuccessFilter] = useState<'all' | 'success' | 'failure'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleViewDetails = (entry: AuditEntry) => {
    setSelectedEntry(entry);
    setDetailsDialogOpen(true);
    onViewDetails?.(entry);
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    onExport?.(format);
    setExportDialogOpen(false);
  };

  const getFilteredEntries = () => {
    return entries.filter((entry) => {
      const matchesSearch =
        searchTerm === '' ||
        entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.details.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesAction = actionFilter === 'all' || entry.action === actionFilter;
      const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
      const matchesSeverity = severityFilter === 'all' || entry.severity === severityFilter;
      const matchesSuccess =
        successFilter === 'all' ||
        (successFilter === 'success' && entry.success) ||
        (successFilter === 'failure' && !entry.success);

      let matchesDateRange = true;
      if (dateFrom) {
        matchesDateRange = matchesDateRange && entry.timestamp >= new Date(dateFrom);
      }
      if (dateTo) {
        matchesDateRange = matchesDateRange && entry.timestamp <= new Date(dateTo);
      }

      return (
        matchesSearch &&
        matchesAction &&
        matchesCategory &&
        matchesSeverity &&
        matchesSuccess &&
        matchesDateRange
      );
    });
  };

  const getSeverityIcon = (severity: AuditSeverity) => {
    switch (severity) {
      case 'info':
        return <InfoIcon />;
      case 'warning':
        return <WarningIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'critical':
        return <SecurityIcon />;
    }
  };

  const getSeverityColor = (severity: AuditSeverity) => {
    switch (severity) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'critical':
        return 'error';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString();
  };

  const filteredEntries = getFilteredEntries();
  const paginatedEntries = filteredEntries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Audit Log</Typography>
          <Typography variant="body2" color="text.secondary">
            Complete audit trail of all system activities
          </Typography>
        </Box>
        <Button startIcon={<ExportIcon />} onClick={() => setExportDialogOpen(true)}>
          Export
        </Button>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary">
                {entries.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total Events
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {entries.filter((e) => e.success).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Successful
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="error.main">
                {entries.filter((e) => !e.success).length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {entries.filter((e) => e.severity === 'critical' || e.severity === 'error').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Critical/Error
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      {showFilters && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Filters
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search by user, resource, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Action</InputLabel>
                  <Select
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value as AuditAction | 'all')}
                  >
                    <MenuItem value="all">All Actions</MenuItem>
                    <MenuItem value="create">Create</MenuItem>
                    <MenuItem value="read">Read</MenuItem>
                    <MenuItem value="update">Update</MenuItem>
                    <MenuItem value="delete">Delete</MenuItem>
                    <MenuItem value="login">Login</MenuItem>
                    <MenuItem value="logout">Logout</MenuItem>
                    <MenuItem value="export">Export</MenuItem>
                    <MenuItem value="import">Import</MenuItem>
                    <MenuItem value="configure">Configure</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value as AuditCategory | 'all')}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="user">User</MenuItem>
                    <MenuItem value="plant">Plant</MenuItem>
                    <MenuItem value="sensor">Sensor</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="security">Security</MenuItem>
                    <MenuItem value="data">Data</MenuItem>
                    <MenuItem value="settings">Settings</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Severity</InputLabel>
                  <Select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value as AuditSeverity | 'all')}
                  >
                    <MenuItem value="all">All Severities</MenuItem>
                    <MenuItem value="info">Info</MenuItem>
                    <MenuItem value="warning">Warning</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={successFilter}
                    onChange={(e) => setSuccessFilter(e.target.value as 'all' | 'success' | 'failure')}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="failure">Failure</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  size="small"
                  fullWidth
                  type="datetime-local"
                  label="From Date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  size="small"
                  fullWidth
                  type="datetime-local"
                  label="To Date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="caption" color="text.secondary">
                  Showing {filteredEntries.length} of {entries.length} events
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Audit Log Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Resource</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No audit entries found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEntries.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Typography variant="body2">{formatTimestamp(entry.timestamp)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 32, height: 32 }}>{entry.userName[0]}</Avatar>
                        <Box>
                          <Typography variant="body2">{entry.userName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {entry.userEmail}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={entry.action} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={entry.category} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{entry.resource}</Typography>
                      {entry.resourceId && (
                        <Typography variant="caption" color="text.secondary">
                          ID: {entry.resourceId}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getSeverityIcon(entry.severity)}
                        label={entry.severity}
                        size="small"
                        color={getSeverityColor(entry.severity) as any}
                      />
                    </TableCell>
                    <TableCell>
                      {entry.success ? (
                        <Chip icon={<SuccessIcon />} label="Success" size="small" color="success" />
                      ) : (
                        <Chip icon={<ErrorIcon />} label="Failed" size="small" color="error" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleViewDetails(entry)}>
                        <ViewIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredEntries.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Audit Entry Details</DialogTitle>
        <DialogContent>
          {selectedEntry && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Timestamp
                  </Typography>
                  <Typography variant="body2">
                    {formatTimestamp(selectedEntry.timestamp)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Event ID
                  </Typography>
                  <Typography variant="body2">{selectedEntry.id}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body2">
                    {selectedEntry.userName} ({selectedEntry.userEmail})
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body2">{selectedEntry.userId}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Action
                  </Typography>
                  <Typography variant="body2">{selectedEntry.action}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body2">{selectedEntry.category}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Resource
                  </Typography>
                  <Typography variant="body2">{selectedEntry.resource}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Resource ID
                  </Typography>
                  <Typography variant="body2">{selectedEntry.resourceId || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Severity
                  </Typography>
                  <Chip
                    icon={getSeverityIcon(selectedEntry.severity)}
                    label={selectedEntry.severity}
                    size="small"
                    color={getSeverityColor(selectedEntry.severity) as any}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  {selectedEntry.success ? (
                    <Chip icon={<SuccessIcon />} label="Success" size="small" color="success" />
                  ) : (
                    <Chip icon={<ErrorIcon />} label="Failed" size="small" color="error" />
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Details
                  </Typography>
                  <Typography variant="body2">{selectedEntry.details}</Typography>
                </Grid>
                {selectedEntry.errorMessage && (
                  <Grid item xs={12}>
                    <Alert severity="error">
                      <Typography variant="caption" color="text.secondary" display="block">
                        Error Message
                      </Typography>
                      <Typography variant="body2">{selectedEntry.errorMessage}</Typography>
                    </Alert>
                  </Grid>
                )}
                {selectedEntry.ipAddress && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">
                      IP Address
                    </Typography>
                    <Typography variant="body2">{selectedEntry.ipAddress}</Typography>
                  </Grid>
                )}
                {selectedEntry.userAgent && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      User Agent
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                      {selectedEntry.userAgent}
                    </Typography>
                  </Grid>
                )}
                {selectedEntry.metadata && Object.keys(selectedEntry.metadata).length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Additional Metadata
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 1, mt: 0.5 }}>
                      <pre style={{ margin: 0, fontSize: '0.75rem' }}>
                        {JSON.stringify(selectedEntry.metadata, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Audit Log</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Export {filteredEntries.length} audit entries to your preferred format.
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => handleExport('csv')}
            >
              Export as CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => handleExport('json')}
            >
              Export as JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={() => handleExport('pdf')}
            >
              Export as PDF Report
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample audit entries
 */
function getSampleEntries(): AuditEntry[] {
  return [
    {
      id: 'audit-001',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      userId: '1',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      action: 'update',
      category: 'plant',
      severity: 'info',
      resource: 'Plant Configuration',
      resourceId: 'plant-123',
      details: 'Updated watering schedule for Tomato plant in Greenhouse A',
      metadata: {
        previousSchedule: '08:00, 18:00',
        newSchedule: '07:00, 19:00',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      success: true,
    },
    {
      id: 'audit-002',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      userId: '2',
      userName: 'Jane Smith',
      userEmail: 'jane.smith@example.com',
      action: 'login',
      category: 'security',
      severity: 'info',
      resource: 'Authentication',
      details: 'User logged in successfully',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
      success: true,
    },
    {
      id: 'audit-003',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      userId: '3',
      userName: 'Mike Johnson',
      userEmail: 'mike.johnson@example.com',
      action: 'delete',
      category: 'sensor',
      severity: 'warning',
      resource: 'Sensor Data',
      resourceId: 'sensor-456',
      details: 'Deleted historical sensor data older than 365 days',
      metadata: {
        recordsDeleted: 15420,
        dateRange: '2022-01-01 to 2023-01-01',
      },
      ipAddress: '192.168.1.110',
      success: true,
    },
    {
      id: 'audit-004',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      userId: '4',
      userName: 'Sarah Williams',
      userEmail: 'sarah.williams@example.com',
      action: 'login',
      category: 'security',
      severity: 'error',
      resource: 'Authentication',
      details: 'Failed login attempt - invalid password',
      errorMessage: 'Invalid credentials provided',
      ipAddress: '192.168.1.120',
      success: false,
    },
    {
      id: 'audit-005',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      userId: '1',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      action: 'configure',
      category: 'settings',
      severity: 'warning',
      resource: 'System Settings',
      details: 'Modified backup configuration settings',
      metadata: {
        previousFrequency: 'daily',
        newFrequency: 'hourly',
        previousRetention: 30,
        newRetention: 7,
      },
      ipAddress: '192.168.1.100',
      success: true,
    },
    {
      id: 'audit-006',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      userId: '1',
      userName: 'John Doe',
      userEmail: 'john.doe@example.com',
      action: 'export',
      category: 'data',
      severity: 'info',
      resource: 'Plant Data Export',
      details: 'Exported plant growth data to CSV format',
      metadata: {
        format: 'CSV',
        recordCount: 1250,
        fileSize: '245KB',
      },
      ipAddress: '192.168.1.100',
      success: true,
    },
  ];
}
