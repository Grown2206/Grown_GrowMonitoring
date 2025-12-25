import React, { useState, lazy, Suspense } from 'react';
import { Box, Tabs, Tab, CircularProgress } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ScheduleIcon from '@mui/icons-material/Schedule';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TuneIcon from '@mui/icons-material/Tune';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

// Lazy load tabs
const Automation = lazy(() => import('./Automation').then(m => ({ default: m.Automation })));
const Schedules = lazy(() => import('./Schedules').then(m => ({ default: m.Schedules })));
const GrowRecipeBrowser = lazy(() => import('./GrowRecipeBrowser').then(m => ({ default: m.GrowRecipeBrowser })));
const PIDController = lazy(() => import('./PIDController').then(m => ({ default: m.PIDController })));
const AdvancedAutomation = lazy(() => import('./AdvancedAutomation').then(m => ({ default: m.AdvancedAutomation })));

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
      id={`automation-tabpanel-${index}`}
      aria-labelledby={`automation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function AutomationHub() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<SmartToyIcon />} label="Regeln" iconPosition="start" />
          <Tab icon={<ScheduleIcon />} label="Zeitpläne" iconPosition="start" />
          <Tab icon={<MenuBookIcon />} label="Grow Rezepte" iconPosition="start" />
          <Tab icon={<TuneIcon />} label="PID Controller" iconPosition="start" />
          <Tab icon={<AccountTreeIcon />} label="Erweiterte Regeln" iconPosition="start" />
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
          <Automation />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Schedules />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <GrowRecipeBrowser />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <PIDController />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <AdvancedAutomation />
        </TabPanel>
      </Suspense>
    </Box>
  );
}
