import React from 'react';
import {
  Badge,
  BadgeProps,
  Box,
  Paper,
  Typography,
  IconButton,
  Alert,
  AlertTitle,
  Collapse,
} from '@mui/material';
import { Close as CloseIcon, Notifications as NotificationIcon } from '@mui/icons-material';

export interface NotificationBadgeProps extends Omit<BadgeProps, 'children'> {
  count?: number;
  max?: number;
  dot?: boolean;
  showZero?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

/**
 * Enhanced notification badge with pulse animation
 */
export function NotificationBadge({
  count = 0,
  max = 99,
  dot = false,
  showZero = false,
  pulse = false,
  children,
  ...props
}: NotificationBadgeProps) {
  return (
    <Badge
      badgeContent={count}
      max={max}
      showZero={showZero}
      variant={dot ? 'dot' : 'standard'}
      color="error"
      sx={
        pulse
          ? {
              '& .MuiBadge-badge': {
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                    opacity: 0.8,
                  },
                  '100%': {
                    transform: 'scale(1)',
                    opacity: 1,
                  },
                },
              },
            }
          : undefined
      }
      {...props}
    >
      {children}
    </Badge>
  );
}

/**
 * Notification item component
 */
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read?: boolean;
  variant?: 'info' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
}

export interface NotificationItemProps {
  notification: NotificationItem;
  onClick?: (id: string) => void;
  onDismiss?: (id: string) => void;
}

export function NotificationItemComponent({
  notification,
  onClick,
  onDismiss,
}: NotificationItemProps) {
  const { id, title, message, timestamp, read, variant = 'info', icon } = notification;

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Paper
      sx={{
        p: 2,
        mb: 1,
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: read ? 'background.paper' : 'action.hover',
        '&:hover': onClick
          ? {
              bgcolor: 'action.selected',
            }
          : undefined,
        transition: 'background-color 0.2s',
      }}
      onClick={() => onClick?.(id)}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        {icon && <Box sx={{ color: `${variant}.main`, mt: 0.5 }}>{icon}</Box>}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="subtitle2" fontWeight={read ? 'normal' : 'bold'}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTimestamp(timestamp)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {message}
          </Typography>
        </Box>
        {onDismiss && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(id);
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
}

/**
 * Banner notification component
 */
export interface BannerProps {
  open: boolean;
  message: string;
  title?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
  persistent?: boolean;
}

export function Banner({
  open,
  message,
  title,
  variant = 'info',
  action,
  onClose,
  persistent = false,
}: BannerProps) {
  return (
    <Collapse in={open}>
      <Alert
        severity={variant}
        onClose={persistent ? undefined : onClose}
        action={
          action ? (
            <IconButton color="inherit" size="small" onClick={action.onClick}>
              {action.label}
            </IconButton>
          ) : undefined
        }
        sx={{
          mb: 2,
          borderRadius: 2,
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Collapse>
  );
}

/**
 * Notification center with empty state
 */
export interface NotificationCenterProps {
  notifications: NotificationItem[];
  onNotificationClick?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onClearAll?: () => void;
}

export function NotificationCenter({
  notifications,
  onNotificationClick,
  onDismiss,
  onClearAll,
}: NotificationCenterProps) {
  if (notifications.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
        }}
      >
        <NotificationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No notifications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You're all caught up!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Notifications ({notifications.length})</Typography>
        {onClearAll && notifications.length > 0 && (
          <Typography
            variant="caption"
            color="primary"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={onClearAll}
          >
            Clear all
          </Typography>
        )}
      </Box>
      <Box>
        {notifications.map((notification) => (
          <NotificationItemComponent
            key={notification.id}
            notification={notification}
            onClick={onNotificationClick}
            onDismiss={onDismiss}
          />
        ))}
      </Box>
    </Box>
  );
}
