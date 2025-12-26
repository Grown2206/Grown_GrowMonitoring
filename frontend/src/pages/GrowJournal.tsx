import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Tabs,
  Tab,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  MenuBook as JournalIcon,
  Timeline as TimelineIcon,
  EmojiEvents as MilestoneIcon,
  Note as NoteIcon,
  ShowChart,
} from '@mui/icons-material';
import { plantsAPI, journalAPI } from '../services/api';
import { Plant, TimelineItem as TimelineItemType, JournalSummary } from '../types';
import { NoteEditor } from '../components/journal/NoteEditor';
import { TimelineView } from '../components/journal/TimelineView';
import { MilestoneManager } from '../components/journal/MilestoneManager';

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
      id={`journal-tabpanel-${index}`}
      aria-labelledby={`journal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const GrowJournal: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlant, setSelectedPlant] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [timeline, setTimeline] = useState<TimelineItemType[]>([]);
  const [summary, setSummary] = useState<JournalSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlants();
  }, []);

  useEffect(() => {
    if (selectedPlant) {
      loadTimeline();
      loadSummary();
    }
  }, [selectedPlant]);

  const loadPlants = async () => {
    try {
      const response = await plantsAPI.getAll();
      const plantsData = Array.isArray(response.data) ? response.data : [];
      setPlants(plantsData);
      if (plantsData.length > 0 && !selectedPlant) {
        setSelectedPlant(plantsData[0].id);
      }
    } catch (error) {
      console.error('Error loading plants:', error);
    }
  };

  const loadTimeline = async () => {
    if (!selectedPlant) return;

    try {
      setLoading(true);
      const response = await journalAPI.getTimeline(selectedPlant);
      setTimeline(response.data);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (!selectedPlant) return;

    try {
      const response = await journalAPI.getSummary(selectedPlant);
      setSummary(response.data);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  const handleUpdate = () => {
    loadTimeline();
    loadSummary();
  };

  const selectedPlantData = plants.find(p => p.id === selectedPlant);

  return (
    <Container maxWidth="xl">
      <Box mb={3}>
        <Typography variant="h4" gutterBottom>
          <JournalIcon sx={{ mr: 2, verticalAlign: 'middle' }} />
          Grow-Journal
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Dokumentiere deine Grows mit Notizen, Meilensteinen und einer chronologischen Timeline
        </Typography>
      </Box>

      {/* Plant Selection */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Pflanze auswählen</InputLabel>
              <Select
                value={selectedPlant || ''}
                label="Pflanze auswählen"
                onChange={(e) => setSelectedPlant(Number(e.target.value))}
              >
                {plants.map((plant) => (
                  <MenuItem key={plant.id} value={plant.id}>
                    {plant.name} ({plant.phase})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {summary && (
            <>
              <Grid item xs={12} md={8}>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Card variant="outlined" sx={{ flex: 1, minWidth: 120 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <NoteIcon color="primary" fontSize="small" />
                        <Box>
                          <Typography variant="h6">{summary.stats.notes}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Notizen
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ flex: 1, minWidth: 120 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <MilestoneIcon color="warning" fontSize="small" />
                        <Box>
                          <Typography variant="h6">{summary.stats.milestones}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Meilensteine
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ flex: 1, minWidth: 120 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <ShowChart color="success" fontSize="small" />
                        <Box>
                          <Typography variant="h6">{summary.stats.total}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Gesamt
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {!selectedPlant ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Wähle eine Pflanze aus, um das Journal zu öffnen
          </Typography>
        </Paper>
      ) : (
        <Paper>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            aria-label="journal tabs"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab icon={<NoteIcon />} label="Notizen" />
            <Tab icon={<TimelineIcon />} label="Timeline" />
            <Tab icon={<MilestoneIcon />} label="Meilensteine" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            <TabPanel value={activeTab} index={0}>
              <NoteEditor plantId={selectedPlant} onUpdate={handleUpdate} />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <TimelineView items={timeline} />
              )}
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <MilestoneManager plantId={selectedPlant} onUpdate={handleUpdate} />
            </TabPanel>
          </Box>
        </Paper>
      )}
    </Container>
  );
};
