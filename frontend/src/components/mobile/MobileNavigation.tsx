import React, { useState } from 'react';
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  SwipeableDrawer,
  Toolbar,
  Typography,
  Badge,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  LocalFlorist as PlantIcon,
  Sensors as SensorIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Person as ProfileIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

export interface MobileNavigationProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  userName?: string;
  userAvatar?: string;
  notificationCount?: number;
}

const mainNavItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: <HomeIcon />, path: '/' },
  { id: 'plants', label: 'Plants', icon: <PlantIcon />, path: '/plants' },
  { id: 'sensors', label: 'Sensors', icon: <SensorIcon />, path: '/sensors' },
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
];

const drawerItems: NavigationItem[] = [
  { id: 'home', label: 'Home', icon: <HomeIcon />, path: '/' },
  { id: 'plants', label: 'Plants', icon: <PlantIcon />, path: '/plants' },
  { id: 'sensors', label: 'Sensors', icon: <SensorIcon />, path: '/sensors' },
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { id: 'reports', label: 'Reports', icon: <ReportIcon />, path: '/reports' },
  { id: 'profile', label: 'Profile', icon: <ProfileIcon />, path: '/profile' },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  { id: 'help', label: 'Help', icon: <HelpIcon />, path: '/help' },
];

/**
 * Mobile-optimized navigation with drawer and bottom nav
 */
export function MobileNavigation({
  currentPath = '/',
  onNavigate,
  userName = 'User',
  userAvatar,
  notificationCount = 0,
}: MobileNavigationProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
    setDrawerOpen(false);
  };

  const getCurrentValue = () => {
    const current = mainNavItems.find((item) => item.path === currentPath);
    return current ? mainNavItems.indexOf(current) : 0;
  };

  return (
    <Box>
      {/* Top App Bar */}
      <AppBar position="fixed" sx={{ top: 0, bottom: 'auto' }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Grow Monitor
          </Typography>
          <IconButton color="inherit" onClick={() => handleNavigate('/notifications')}>
            <Badge badgeContent={notificationCount} color="error">
              <NotificationIcon />
            </Badge>
          </IconButton>
          <IconButton color="inherit" onClick={() => handleNavigate('/profile')}>
            <Avatar src={userAvatar} sx={{ width: 32, height: 32 }}>
              {userName.charAt(0)}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        disableBackdropTransition={!isMobile}
        disableDiscovery={isMobile}
      >
        <Box sx={{ width: 280 }}>
          {/* User Profile Header */}
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <Avatar src={userAvatar} sx={{ width: 64, height: 64, mb: 1 }}>
              {userName.charAt(0)}
            </Avatar>
            <Typography variant="h6">{userName}</Typography>
            <Typography variant="body2">View Profile</Typography>
          </Box>

          <Divider />

          {/* Navigation Items */}
          <List>
            {drawerItems.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  selected={currentPath === item.path}
                  onClick={() => handleNavigate(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {item.badge && (
                    <Badge badgeContent={item.badge} color="primary" />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </SwipeableDrawer>

      {/* Bottom Navigation */}
      <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 }}>
        <BottomNavigation
          value={getCurrentValue()}
          onChange={(_, newValue) => {
            if (mainNavItems[newValue]) {
              handleNavigate(mainNavItems[newValue].path);
            }
          }}
          showLabels
        >
          {mainNavItems.map((item) => (
            <BottomNavigationAction
              key={item.id}
              label={item.label}
              icon={
                item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )
              }
            />
          ))}
        </BottomNavigation>
      </AppBar>

      {/* Spacers */}
      <Toolbar /> {/* Top spacer */}
      <Box sx={{ pb: 7 }} /> {/* Bottom spacer */}
    </Box>
  );
}
