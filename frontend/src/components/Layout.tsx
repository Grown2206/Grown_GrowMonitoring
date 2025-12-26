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
  Tooltip,
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
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BrightnessAutoIcon from '@mui/icons-material/BrightnessAuto';
import PaletteIcon from '@mui/icons-material/Palette';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BuildIcon from '@mui/icons-material/Build';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import { ThemeSettings } from './ThemeSettings';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Pflanzen', icon: <LocalFloristIcon />, path: '/plants' },
  { text: 'Sensoren', icon: <SensorsIcon />, path: '/sensors' },
  { text: 'Steuerung', icon: <ToggleOnIcon />, path: '/control' },
  { text: 'Automation', icon: <AutoModeIcon />, path: '/automation' },
  { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics' },
  { text: 'Benachrichtigungen', icon: <NotificationsIcon />, path: '/notifications' },
  { text: 'Tools', icon: <BuildIcon />, path: '/tools' },
  { text: 'Einstellungen', icon: <SettingsIcon />, path: '/settings' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [themeSettingsOpen, setThemeSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { mode, actualMode, toggleMode } = useThemeMode();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'light':
        return <Brightness7Icon />;
      case 'dark':
        return <Brightness4Icon />;
      case 'auto':
        return <BrightnessAutoIcon />;
      default:
        return <Brightness4Icon />;
    }
  };

  const drawer = (
    <Box id="main-navigation">
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
          <Tooltip title={`Theme-Modus: ${mode === 'auto' ? `Auto (${actualMode})` : mode}`}>
            <IconButton onClick={toggleMode} color="inherit">
              {getModeIcon()}
            </IconButton>
          </Tooltip>
          <Tooltip title="Theme-Einstellungen">
            <IconButton onClick={() => setThemeSettingsOpen(true)} color="inherit" sx={{ mr: 2 }}>
              <PaletteIcon />
            </IconButton>
          </Tooltip>
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

      <Box component="main" id="main-content" tabIndex={-1} sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Container maxWidth="xl">{children}</Container>
      </Box>

      {/* Theme Settings Dialog */}
      <ThemeSettings open={themeSettingsOpen} onClose={() => setThemeSettingsOpen(false)} />
    </Box>
  );
}
