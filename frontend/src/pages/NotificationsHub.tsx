import React, { useState, lazy, Suspense } from 'react';
import { Box, Tabs, Tab, CircularProgress } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import SummarizeIcon from '@mui/icons-material/Summarize';

// Lazy load tabs
const Notifications = lazy(() => import('./Notifications').then(m => ({ default: m.Notifications })));
const AlertManagement = lazy(() => import('./AlertManagement').then(m => ({ default: m.AlertManagement })));
const ReportManagement = lazy(() => import('./ReportManagement').then(m => ({ default: m.ReportManagement })));

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
      id={`notifications-tabpanel-${index}`}
      aria-labelledby={`notifications-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function NotificationsHub() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<NotificationsIcon />} label="Benachrichtigungen" iconPosition="start" />
          <Tab icon={<NotificationImportantIcon />} label="Alarme" iconPosition="start" />
          <Tab icon={<SummarizeIcon />} label="Reports" iconPosition="start" />
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
          <Notifications />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <AlertManagement />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <ReportManagement />
        </TabPanel>
      </Suspense>
    </Box>
  );
}
