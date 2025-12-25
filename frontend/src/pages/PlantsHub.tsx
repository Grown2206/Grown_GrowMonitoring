import React, { useState, lazy, Suspense } from 'react';
import { Box, Tabs, Tab, CircularProgress } from '@mui/material';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import AgricultureIcon from '@mui/icons-material/Agriculture';

// Lazy load tabs
const Plants = lazy(() => import('./Plants').then(m => ({ default: m.Plants })));
const GrowJournal = lazy(() => import('./GrowJournal').then(m => ({ default: m.GrowJournal })));
const PhotoGallery = lazy(() => import('./PhotoGallery').then(m => ({ default: m.PhotoGallery })));
const Harvests = lazy(() => import('./Harvests').then(m => ({ default: m.Harvests })));

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
      id={`plants-tabpanel-${index}`}
      aria-labelledby={`plants-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export function PlantsHub() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<LocalFloristIcon />} label="Pflanzen" iconPosition="start" />
          <Tab icon={<MenuBookIcon />} label="Grow Journal" iconPosition="start" />
          <Tab icon={<PhotoLibraryIcon />} label="Galerie" iconPosition="start" />
          <Tab icon={<AgricultureIcon />} label="Ernten" iconPosition="start" />
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
          <Plants />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <GrowJournal />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <PhotoGallery />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <Harvests />
        </TabPanel>
      </Suspense>
    </Box>
  );
}
