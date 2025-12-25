import React, { useState, lazy, Suspense } from 'react';
import { Box, Tabs, Tab, CircularProgress } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ScienceIcon from '@mui/icons-material/Science';

// Lazy load tabs
const VPDCalculator = lazy(() => import('./VPDCalculator').then(m => ({ default: m.VPDCalculator })));
const Simulation = lazy(() => import('./Simulation').then(m => ({ default: m.Simulation })));

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
      id={`tools-tabpanel-${index}`}
      aria-labelledby={`tools-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function ToolsHub() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<CalculateIcon />} label="VPD Rechner" iconPosition="start" />
          <Tab icon={<ScienceIcon />} label="Simulation" iconPosition="start" />
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
          <VPDCalculator />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <Simulation />
        </TabPanel>
      </Suspense>
    </Box>
  );
}
