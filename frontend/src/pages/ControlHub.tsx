import React, { useState, lazy, Suspense } from 'react';
import { Box, Tabs, Tab, CircularProgress } from '@mui/material';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import OpacityIcon from '@mui/icons-material/Opacity';
import DeveloperBoardIcon from '@mui/icons-material/DeveloperBoard';
import DevicesIcon from '@mui/icons-material/Devices';

// Lazy load tabs
const Relays = lazy(() => import('./Relays').then(m => ({ default: m.Relays })));
const Irrigation = lazy(() => import('./Irrigation').then(m => ({ default: m.Irrigation })));
const GPIOManager = lazy(() => import('./GPIOManager').then(m => ({ default: m.GPIOManager })));
const DeviceManagement = lazy(() => import('./DeviceManagement').then(m => ({ default: m.DeviceManagement })));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`control-tabpanel-${index}`}
      aria-labelledby={`control-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function ControlHub() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<ToggleOnIcon />} label="Relays" iconPosition="start" />
          <Tab icon={<OpacityIcon />} label="Bewässerung" iconPosition="start" />
          <Tab icon={<DeveloperBoardIcon />} label="GPIO" iconPosition="start" />
          <Tab icon={<DevicesIcon />} label="Geräte" iconPosition="start" />
        </Tabs>
      </Box>

      <Suspense
        fallback={
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        }
      >
        <TabPanel value={activeTab} index={0}>
          <Relays />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Irrigation />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <GPIOManager />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <DeviceManagement />
        </TabPanel>
      </Suspense>
    </Box>
  );
}
