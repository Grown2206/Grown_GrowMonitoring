import React, { useState, lazy, Suspense } from 'react';
import { Box, Tabs, Tab, CircularProgress } from '@mui/material';
import SensorsIcon from '@mui/icons-material/Sensors';
import GroupWorkIcon from '@mui/icons-material/GroupWork';
import FunctionsIcon from '@mui/icons-material/Functions';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Lazy load tabs
const Sensors = lazy(() => import('./Sensors').then(m => ({ default: m.Sensors })));
const SensorGroups = lazy(() => import('./SensorGroups').then(m => ({ default: m.SensorGroups })));
const VirtualSensors = lazy(() => import('./VirtualSensors').then(m => ({ default: m.VirtualSensors })));
const SensorHealthMonitoring = lazy(() => import('./SensorHealthMonitoring').then(m => ({ default: m.SensorHealthMonitoring })));

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
      id={`sensors-tabpanel-${index}`}
      aria-labelledby={`sensors-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function SensorsHub() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<SensorsIcon />} label="Sensoren" iconPosition="start" />
          <Tab icon={<GroupWorkIcon />} label="Sensor Gruppen" iconPosition="start" />
          <Tab icon={<FunctionsIcon />} label="Virtuelle Sensoren" iconPosition="start" />
          <Tab icon={<HealthAndSafetyIcon />} label="Health Monitoring" iconPosition="start" />
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
          <Sensors />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <SensorGroups />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <VirtualSensors />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <SensorHealthMonitoring />
        </TabPanel>
      </Suspense>
    </Box>
  );
}
