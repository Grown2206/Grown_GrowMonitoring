import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Container,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useThemeMode } from '../contexts/ThemeContext';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocalFlorist from '@mui/icons-material/LocalFlorist';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SensorsIcon from '@mui/icons-material/Sensors';
import AutoModeIcon from '@mui/icons-material/AutoMode';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import CalculateIcon from '@mui/icons-material/Calculate';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import MemoryIcon from '@mui/icons-material/Memory';
import DevicesIcon from '@mui/icons-material/Devices';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Pflanzen', icon: <LocalFloristIcon />, path: '/plants' },
  { text: 'Sensoren', icon: <SensorsIcon />, path: '/sensors' },
  { text: 'Bewässerung', icon: <WaterDropIcon />, path: '/irrigation' },
  { text: 'Relays', icon: <PowerSettingsNewIcon />, path: '/relays' },
  { text: 'Zeitpläne', icon: <ScheduleIcon />, path: '/schedules' },
  { text: 'Ernten', icon: <LocalFlorist />, path: '/harvests' },
  { text: 'Automatisierung', icon: <AutoModeIcon />, path: '/automation' },
  { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
  { text: 'Erweiterte Analysen', icon: <TrendingUpIcon />, path: '/analytics-advanced' },
  { text: 'ESP32 Simulation', icon: <DeveloperBoardIcon />, path: '/simulation' },
  { text: 'VPD Rechner', icon: <CalculateIcon />, path: '/vpd' },
  { text: 'GPIO Pins', icon: <MemoryIcon />, path: '/gpio' },
  { text: 'Geräte', icon: <DevicesIcon />, path: '/devices' },
  { text: 'Foto-Galerie', icon: <PhotoLibraryIcon />, path: '/gallery' },
  { text: 'Benachrichtigungen', icon: <NotificationsIcon />, path: '/notifications' },
  { text: 'Alarmierung', icon: <NotificationImportantIcon />, path: '/alerts' },
  { text: 'Einstellungen', icon: <SettingsIcon />, path: '/settings' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap>
          🌱 Grow Monitor
        </Typography>
      </Toolbar>

      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}

        <ListItemButton onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Abmelden" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Grow Monitoring System
          </Typography>
          <IconButton onClick={toggleMode} color="inherit" sx={{ mr: 2 }}>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
          <Typography variant="body2">{user?.username}</Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
}
