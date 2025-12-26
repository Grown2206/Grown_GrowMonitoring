import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Stack,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  Divider,
  Alert,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

export interface NotificationHistoryItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: string;
  timestamp: Date;
  read: boolean;
  channels: string[];
  metadata?: any;
}

export interface NotificationHistoryProps {
  notifications?: NotificationHistoryItem[];
  onDelete?: (id: string) => void;
  onMarkAsRead?: (id: string) => void;
  onClearAll?: () => void;
}

/**
 * Notification history with filtering and search
 */
export function NotificationHistory({
  notifications = [],
  onDelete,
  onMarkAsRead,
  onClearAll,
}: NotificationHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notif.type === filterType;
    const matchesCategory = filterCategory === 'all' || notif.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  // Paginate
  const paginatedNotifications = filteredNotifications.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getAvatarColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      default:
        return 'info.main';
    }
  };

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

  const categories = Array.from(new Set(notifications.map((n) => n.category)));

  return (
    <Box>
      {/* Filters and Search */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2}>
              <TextField
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Type">
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="error">Error</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} label="Category">
                  <MenuItem value="all">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {filteredNotifications.length > 0 && (
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {filteredNotifications.length} notification{filteredNotifications.length > 1 ? 's' : ''}
                </Typography>
                {onClearAll && (
                  <Button size="small" color="error" onClick={onClearAll} startIcon={<DeleteIcon />}>
                    Clear All
                  </Button>
                )}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Notification List */}
      {paginatedNotifications.length === 0 ? (
        <Alert severity="info">No notifications found</Alert>
      ) : (
        <Card>
          <List disablePadding>
            {paginatedNotifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notif.read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => onDelete?.(notif.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getAvatarColor(notif.type) }}>{getIcon(notif.type)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">{notif.title}</Typography>
                        {!notif.read && <Chip label="New" size="small" color="primary" />}
                        <Chip label={notif.type} size="small" />
                      </Stack>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {notif.message}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(notif.timestamp)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            •
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {notif.category}
                          </Typography>
                          {notif.channels.length > 0 && (
                            <>
                              <Typography variant="caption" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                via {notif.channels.join(', ')}
                              </Typography>
                            </>
                          )}
                        </Stack>
                      </Box>
                    }
                  />
                </ListItem>
                {index < paginatedNotifications.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={page} onChange={(_, newPage) => setPage(newPage)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
