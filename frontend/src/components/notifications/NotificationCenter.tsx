import React, { useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
  Avatar,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as ActiveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  MoreVert as MoreIcon,
  DoneAll as MarkAllReadIcon,
  FilterList as FilterIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as SuccessIcon,
  Circle as UnreadIcon,
} from '@mui/icons-material';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  category?: string;
}

export interface NotificationCenterProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onNotificationDelete?: (notificationId: string) => void;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onClearAll?: () => void;
  maxDisplayCount?: number;
}

/**
 * Real-time notification center with drawer and badge
 */
export function NotificationCenter({
  notifications: initialNotifications = [],
  onNotificationClick,
  onNotificationDelete,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  maxDisplayCount = 50,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(
    initialNotifications.length > 0 ? initialNotifications : getSampleNotifications()
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    onMarkAsRead?.(notificationId);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    onMarkAllAsRead?.();
  };

  const handleDelete = (notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId));
    onNotificationDelete?.(notificationId);
    handleMenuClose();
  };

  const handleClearAll = () => {
    setNotifications([]);
    onClearAll?.();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, notificationId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedNotificationId(notificationId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotificationId(null);
  };

  const getUnreadCount = () => notifications.filter((n) => !n.isRead).length;

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 1: // Unread
        return notifications.filter((n) => !n.isRead);
      case 2: // Important
        return notifications.filter((n) => n.priority === 'high' || n.priority === 'urgent');
      default: // All
        return notifications;
    }
  };

  const getTypeIcon = (type: NotificationType) => {
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

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
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

  const filteredNotifications = getFilteredNotifications().slice(0, maxDisplayCount);

  return (
    <>
      {/* Notification Bell Icon */}
      <IconButton onClick={() => setDrawerOpen(true)} color="inherit">
        <Badge badgeContent={getUnreadCount()} color="error">
          {getUnreadCount() > 0 ? <ActiveIcon /> : <NotificationsIcon />}
        </Badge>
      </IconButton>

      {/* Notification Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 } } }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <NotificationsIcon />
                <Typography variant="h6">Notifications</Typography>
                {getUnreadCount() > 0 && (
                  <Chip label={getUnreadCount()} color="primary" size="small" />
                )}
              </Stack>
              <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            {/* Action Buttons */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                size="small"
                startIcon={<MarkAllReadIcon />}
                onClick={handleMarkAllAsRead}
                disabled={getUnreadCount() === 0}
              >
                Mark All Read
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearAll}
                disabled={notifications.length === 0}
              >
                Clear All
              </Button>
            </Stack>
          </Box>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={`All (${notifications.length})`} />
            <Tab label={`Unread (${getUnreadCount()})`} />
            <Tab
              label={`Important (${
                notifications.filter((n) => n.priority === 'high' || n.priority === 'urgent').length
              })`}
            />
          </Tabs>

          {/* Notification List */}
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            {filteredNotifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <NotificationsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're all caught up!
                </Typography>
              </Box>
            ) : (
              <List>
                {filteredNotifications.map((notification) => (
                  <React.Fragment key={notification.id}>
                    <ListItem
                      sx={{
                        bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                      secondaryAction={
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, notification.id)}
                        >
                          <MoreIcon />
                        </IconButton>
                      }
                    >
                      <ListItemButton
                        onClick={() => handleNotificationClick(notification)}
                        sx={{ borderRadius: 1 }}
                      >
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'transparent' }}>
                            {getTypeIcon(notification.type)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              {!notification.isRead && (
                                <UnreadIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                              )}
                              <Typography variant="subtitle2">{notification.title}</Typography>
                              <Chip
                                label={notification.priority}
                                size="small"
                                color={getPriorityColor(notification.priority) as any}
                              />
                            </Stack>
                          }
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {notification.message}
                              </Typography>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="caption" color="text.secondary">
                                  {formatTimestamp(notification.timestamp)}
                                </Typography>
                                {notification.category && (
                                  <Chip label={notification.category} size="small" variant="outlined" />
                                )}
                              </Stack>
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            const notification = notifications.find((n) => n.id === selectedNotificationId);
            if (notification && !notification.isRead && selectedNotificationId) {
              handleMarkAsRead(selectedNotificationId);
            }
            handleMenuClose();
          }}
        >
          Mark as Read
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedNotificationId) handleDelete(selectedNotificationId);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}

/**
 * Generate sample notifications
 */
function getSampleNotifications(): Notification[] {
  return [
    {
      id: '1',
      type: 'warning',
      priority: 'urgent',
      title: 'High Temperature Alert',
      message: 'Greenhouse A temperature exceeded 35°C. Immediate action required.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      category: 'Alerts',
    },
    {
      id: '2',
      type: 'info',
      priority: 'medium',
      title: 'Watering Schedule Complete',
      message: 'Automated watering cycle for Zone 2 completed successfully.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      category: 'Automation',
    },
    {
      id: '3',
      type: 'error',
      priority: 'high',
      title: 'Sensor Offline',
      message: 'Soil moisture sensor #12 has been offline for 2 hours.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      category: 'Sensors',
    },
    {
      id: '4',
      type: 'success',
      priority: 'low',
      title: 'Growth Milestone Reached',
      message: 'Tomato Plant #45 has reached the flowering stage.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: true,
      category: 'Plants',
    },
    {
      id: '5',
      type: 'info',
      priority: 'medium',
      title: 'Weekly Report Available',
      message: 'Your weekly growth analysis report is ready to view.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isRead: true,
      category: 'Reports',
    },
  ];
}
