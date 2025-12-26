import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  Notifications as NotificationIcon,
  FilterList as FilterIcon,
  ViewList as ListViewIcon,
  ViewModule as GridViewIcon,
} from '@mui/icons-material';

export interface Activity {
  id: string;
  type: 'edit' | 'create' | 'delete' | 'upload' | 'download' | 'security' | 'settings' | 'other';
  title: string;
  description?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ActivityFeedProps {
  activities?: Activity[];
  itemsPerPage?: number;
  showFilters?: boolean;
  viewMode?: 'list' | 'compact';
}

/**
 * User activity feed with filtering and search
 */
export function ActivityFeed({
  activities: initialActivities = [],
  itemsPerPage = 10,
  showFilters = true,
  viewMode: initialViewMode = 'list',
}: ActivityFeedProps) {
  const [activities] = useState<Activity[]>(
    initialActivities.length > 0
      ? initialActivities
      : generateSampleActivities()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'compact'>(initialViewMode);
  const [page, setPage] = useState(1);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'edit':
        return <EditIcon />;
      case 'create':
        return <AddIcon />;
      case 'delete':
        return <DeleteIcon />;
      case 'upload':
        return <UploadIcon />;
      case 'download':
        return <DownloadIcon />;
      case 'security':
        return <SecurityIcon />;
      case 'settings':
        return <SettingsIcon />;
      default:
        return <NotificationIcon />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'edit':
        return 'primary';
      case 'create':
        return 'success';
      case 'delete':
        return 'error';
      case 'upload':
        return 'info';
      case 'download':
        return 'info';
      case 'security':
        return 'warning';
      case 'settings':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      searchQuery === '' ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === 'all' || activity.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const paginatedActivities = filteredActivities.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box>
      {showFilters && (
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="edit">Edits</MenuItem>
                <MenuItem value="create">Creates</MenuItem>
                <MenuItem value="delete">Deletes</MenuItem>
                <MenuItem value="upload">Uploads</MenuItem>
                <MenuItem value="download">Downloads</MenuItem>
                <MenuItem value="security">Security</MenuItem>
                <MenuItem value="settings">Settings</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="list">
                <ListViewIcon />
              </ToggleButton>
              <ToggleButton value="compact">
                <GridViewIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
            </Typography>
          </Stack>
        </Stack>
      )}

      {/* Activity List */}
      {paginatedActivities.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <NotificationIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Activities Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Your activity history will appear here'}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={viewMode === 'compact' ? 1 : 2}>
          {paginatedActivities.map((activity) =>
            viewMode === 'list' ? (
              <Card key={activity.id}>
                <CardContent>
                  <Stack direction="row" spacing={2}>
                    <Avatar
                      sx={{
                        bgcolor: `${getActivityColor(activity.type)}.main`,
                      }}
                    >
                      {getActivityIcon(activity.type)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                      >
                        <Box>
                          <Typography variant="subtitle1">{activity.title}</Typography>
                          {activity.description && (
                            <Typography variant="body2" color="text.secondary">
                              {activity.description}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={activity.type}
                          size="small"
                          color={getActivityColor(activity.type) as any}
                          variant="outlined"
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {formatTimestamp(activity.timestamp)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ) : (
              <Paper key={activity.id} sx={{ p: 1.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: `${getActivityColor(activity.type)}.main`,
                      width: 32,
                      height: 32,
                    }}
                  >
                    {React.cloneElement(getActivityIcon(activity.type) as React.ReactElement, {
                      fontSize: 'small',
                    })}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                      {activity.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(activity.timestamp)}
                    </Typography>
                  </Box>
                  <Chip
                    label={activity.type}
                    size="small"
                    color={getActivityColor(activity.type) as any}
                    variant="outlined"
                  />
                </Stack>
              </Paper>
            )
          )}
        </Stack>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
          />
        </Stack>
      )}
    </Box>
  );
}

/**
 * Generate sample activities for demo
 */
function generateSampleActivities(): Activity[] {
  const now = new Date();
  return [
    {
      id: '1',
      type: 'edit',
      title: 'Updated profile information',
      description: 'Changed email and phone number',
      timestamp: new Date(now.getTime() - 5 * 60000), // 5 minutes ago
    },
    {
      id: '2',
      type: 'security',
      title: 'Enabled two-factor authentication',
      timestamp: new Date(now.getTime() - 2 * 3600000), // 2 hours ago
    },
    {
      id: '3',
      type: 'create',
      title: 'Created new plant monitoring schedule',
      description: 'Schedule for Tomato Plant A',
      timestamp: new Date(now.getTime() - 24 * 3600000), // 1 day ago
    },
    {
      id: '4',
      type: 'upload',
      title: 'Uploaded sensor data',
      description: 'Temperature and humidity readings',
      timestamp: new Date(now.getTime() - 2 * 24 * 3600000), // 2 days ago
    },
    {
      id: '5',
      type: 'settings',
      title: 'Changed notification preferences',
      timestamp: new Date(now.getTime() - 3 * 24 * 3600000), // 3 days ago
    },
    {
      id: '6',
      type: 'download',
      title: 'Downloaded monthly report',
      description: 'Growth analytics report for November',
      timestamp: new Date(now.getTime() - 5 * 24 * 3600000), // 5 days ago
    },
    {
      id: '7',
      type: 'delete',
      title: 'Deleted old sensor logs',
      description: 'Removed data older than 90 days',
      timestamp: new Date(now.getTime() - 7 * 24 * 3600000), // 7 days ago
    },
    {
      id: '8',
      type: 'security',
      title: 'Password changed',
      timestamp: new Date(now.getTime() - 14 * 24 * 3600000), // 14 days ago
    },
    {
      id: '9',
      type: 'edit',
      title: 'Updated plant profile',
      description: 'Added new growth measurements',
      timestamp: new Date(now.getTime() - 21 * 24 * 3600000), // 21 days ago
    },
    {
      id: '10',
      type: 'create',
      title: 'Created new dashboard widget',
      description: 'Temperature trend widget',
      timestamp: new Date(now.getTime() - 30 * 24 * 3600000), // 30 days ago
    },
  ];
}
