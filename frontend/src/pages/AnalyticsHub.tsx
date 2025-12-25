import React, { useState, lazy, Suspense } from 'react';
import { Box, Tabs, Tab, CircularProgress } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EuroIcon from '@mui/icons-material/Euro';

// Lazy load tabs
const Analytics = lazy(() => import('./Analytics').then(m => ({ default: m.Analytics })));
const AnalyticsAdvanced = lazy(() => import('./AnalyticsAdvanced').then(m => ({ default: m.AnalyticsAdvanced })));
const ComparisonAnalytics = lazy(() => import('./ComparisonAnalytics').then(m => ({ default: m.ComparisonAnalytics })));
const SensorForecasting = lazy(() => import('./SensorForecasting').then(m => ({ default: m.SensorForecasting })));
const CostTracking = lazy(() => import('./CostTracking').then(m => ({ default: m.CostTracking })));

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
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function AnalyticsHub() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<BarChartIcon />} label="Basis Analytics" iconPosition="start" />
          <Tab icon={<TimelineIcon />} label="Erweiterte Analytics" iconPosition="start" />
          <Tab icon={<CompareArrowsIcon />} label="Vergleiche" iconPosition="start" />
          <Tab icon={<AssessmentIcon />} label="Prognosen" iconPosition="start" />
          <Tab icon={<EuroIcon />} label="Kosten & ROI" iconPosition="start" />
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
          <Analytics />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <AnalyticsAdvanced />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <ComparisonAnalytics />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <SensorForecasting />
        </TabPanel>
        <TabPanel value={activeTab} index={4}>
          <CostTracking />
        </TabPanel>
      </Suspense>
    </Box>
  );
}
