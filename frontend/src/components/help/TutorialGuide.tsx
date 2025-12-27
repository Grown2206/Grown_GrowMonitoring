import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
  Chip,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  tips?: string[];
  videoUrl?: string;
  estimatedTime: number; // minutes
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: TutorialDifficulty;
  category: TutorialCategory;
  estimatedTime: number; // total minutes
  steps: TutorialStep[];
  prerequisites?: string[];
  learningOutcomes: string[];
}

export type TutorialDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type TutorialCategory = 'getting-started' | 'features' | 'advanced' | 'troubleshooting';

export interface UserProgress {
  tutorialId: string;
  completedSteps: string[];
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedStep: number;
}

export interface TutorialGuideProps {
  tutorials?: Tutorial[];
  userProgress?: UserProgress[];
  onStartTutorial?: (tutorialId: string) => void;
  onCompleteStep?: (tutorialId: string, stepId: string) => void;
  onCompleteTutorial?: (tutorialId: string) => void;
}

export function TutorialGuide({
  tutorials: initialTutorials,
  userProgress: initialProgress = [],
  onStartTutorial,
  onCompleteStep,
  onCompleteTutorial,
}: TutorialGuideProps) {
  const [tutorials] = useState<Tutorial[]>(initialTutorials || getSampleTutorials());
  const [userProgress, setUserProgress] = useState<UserProgress[]>(initialProgress);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TutorialCategory | 'all'>('all');

  const getTutorialProgress = (tutorialId: string): UserProgress | undefined => {
    return userProgress.find((p) => p.tutorialId === tutorialId);
  };

  const isStepCompleted = (tutorialId: string, stepId: string): boolean => {
    const progress = getTutorialProgress(tutorialId);
    return progress?.completedSteps.includes(stepId) || false;
  };

  const getTutorialCompletionPercentage = (tutorial: Tutorial): number => {
    const progress = getTutorialProgress(tutorial.id);
    if (!progress) return 0;
    return Math.round((progress.completedSteps.length / tutorial.steps.length) * 100);
  };

  const handleStartTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    const progress = getTutorialProgress(tutorial.id);
    setActiveStep(progress?.lastAccessedStep || 0);
    setDialogOpen(true);
    onStartTutorial?.(tutorial.id);
  };

  const handleCompleteStep = (stepId: string) => {
    if (!selectedTutorial) return;

    const progress = getTutorialProgress(selectedTutorial.id);
    const updatedProgress: UserProgress = progress
      ? {
          ...progress,
          completedSteps: [...new Set([...progress.completedSteps, stepId])],
          lastAccessedStep: activeStep,
        }
      : {
          tutorialId: selectedTutorial.id,
          completedSteps: [stepId],
          startedAt: new Date(),
          lastAccessedStep: activeStep,
        };

    setUserProgress((prev) => {
      const filtered = prev.filter((p) => p.tutorialId !== selectedTutorial.id);
      return [...filtered, updatedProgress];
    });

    onCompleteStep?.(selectedTutorial.id, stepId);

    // Check if tutorial is complete
    if (updatedProgress.completedSteps.length === selectedTutorial.steps.length) {
      updatedProgress.completedAt = new Date();
      onCompleteTutorial?.(selectedTutorial.id);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const filteredTutorials = tutorials.filter(
    (t) => selectedCategory === 'all' || t.category === selectedCategory
  );

  const getDifficultyColor = (difficulty: TutorialDifficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Interactive Tutorials</Typography>
          <Typography variant="body2" color="text.secondary">
            Step-by-step guides to master the system
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<SchoolIcon />}
            label={`${tutorials.length} Tutorials`}
            color="primary"
            variant="outlined"
          />
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
        <Chip
          label="All Categories"
          onClick={() => setSelectedCategory('all')}
          color={selectedCategory === 'all' ? 'primary' : 'default'}
          variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Getting Started"
          onClick={() => setSelectedCategory('getting-started')}
          color={selectedCategory === 'getting-started' ? 'primary' : 'default'}
          variant={selectedCategory === 'getting-started' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Features"
          onClick={() => setSelectedCategory('features')}
          color={selectedCategory === 'features' ? 'primary' : 'default'}
          variant={selectedCategory === 'features' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Advanced"
          onClick={() => setSelectedCategory('advanced')}
          color={selectedCategory === 'advanced' ? 'primary' : 'default'}
          variant={selectedCategory === 'advanced' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Troubleshooting"
          onClick={() => setSelectedCategory('troubleshooting')}
          color={selectedCategory === 'troubleshooting' ? 'primary' : 'default'}
          variant={selectedCategory === 'troubleshooting' ? 'filled' : 'outlined'}
        />
      </Stack>

      <Grid container spacing={3}>
        {filteredTutorials.map((tutorial) => {
          const progress = getTutorialProgress(tutorial.id);
          const completionPercentage = getTutorialCompletionPercentage(tutorial);
          const isCompleted = completionPercentage === 100;

          return (
            <Grid item xs={12} md={6} key={tutorial.id}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {tutorial.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {tutorial.description}
                        </Typography>
                      </Box>
                      {isCompleted && <TrophyIcon color="success" />}
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        label={tutorial.difficulty}
                        size="small"
                        color={getDifficultyColor(tutorial.difficulty)}
                      />
                      <Chip
                        icon={<TimerIcon />}
                        label={`${tutorial.estimatedTime} min`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${tutorial.steps.length} steps`}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    {progress && (
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {completionPercentage}%
                          </Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={completionPercentage} />
                      </Box>
                    )}

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        You'll learn:
                      </Typography>
                      <List dense>
                        {tutorial.learningOutcomes.slice(0, 3).map((outcome, index) => (
                          <ListItem key={index} disablePadding>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckCircleIcon fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary={outcome}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Button
                      variant={progress ? 'outlined' : 'contained'}
                      startIcon={<PlayIcon />}
                      onClick={() => handleStartTutorial(tutorial)}
                      fullWidth
                    >
                      {progress ? (isCompleted ? 'Review' : 'Continue') : 'Start Tutorial'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTutorial && (
          <>
            <DialogTitle>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{selectedTutorial.title}</Typography>
                <Chip
                  label={`${activeStep + 1} of ${selectedTutorial.steps.length}`}
                  size="small"
                  color="primary"
                />
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Stepper activeStep={activeStep} orientation="vertical">
                {selectedTutorial.steps.map((step, index) => (
                  <Step key={step.id}>
                    <StepLabel
                      optional={
                        <Typography variant="caption">
                          {step.estimatedTime} min
                        </Typography>
                      }
                    >
                      {step.title}
                    </StepLabel>
                    <StepContent>
                      <Stack spacing={2}>
                        <Typography variant="body2">{step.description}</Typography>

                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Instructions:
                          </Typography>
                          <List dense>
                            {step.instructions.map((instruction, i) => (
                              <ListItem key={i}>
                                <ListItemText
                                  primary={`${i + 1}. ${instruction}`}
                                  primaryTypographyProps={{ variant: 'body2' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Paper>

                        {step.tips && step.tips.length > 0 && (
                          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.50' }}>
                            <Typography variant="subtitle2" gutterBottom color="info.main">
                              Tips:
                            </Typography>
                            <List dense>
                              {step.tips.map((tip, i) => (
                                <ListItem key={i}>
                                  <ListItemText
                                    primary={tip}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Paper>
                        )}

                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Checkbox
                            checked={isStepCompleted(selectedTutorial.id, step.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleCompleteStep(step.id);
                              }
                            }}
                          />
                          <Typography variant="body2">Mark as completed</Typography>
                        </Stack>

                        <Stack direction="row" spacing={1}>
                          <Button
                            disabled={index === 0}
                            onClick={handleBack}
                            startIcon={<PrevIcon />}
                          >
                            Back
                          </Button>
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            endIcon={<NextIcon />}
                            disabled={index === selectedTutorial.steps.length - 1}
                          >
                            Next Step
                          </Button>
                        </Stack>
                      </Stack>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {activeStep === selectedTutorial.steps.length - 1 &&
                getTutorialCompletionPercentage(selectedTutorial) === 100 && (
                  <Paper sx={{ p: 3, mt: 2, bgcolor: 'success.50', textAlign: 'center' }}>
                    <TrophyIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" gutterBottom>
                      Congratulations!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You've completed this tutorial. Keep learning!
                    </Typography>
                  </Paper>
                )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

function getSampleTutorials(): Tutorial[] {
  return [
    {
      id: '1',
      title: 'Getting Started with Plant Monitoring',
      description: 'Learn the basics of adding plants and setting up monitoring',
      difficulty: 'beginner',
      category: 'getting-started',
      estimatedTime: 15,
      learningOutcomes: [
        'Add your first plant to the system',
        'Configure basic monitoring parameters',
        'View plant health dashboard',
        'Set up automated alerts',
      ],
      steps: [
        {
          id: 's1',
          title: 'Create Your First Plant',
          description: 'Learn how to add a new plant to the monitoring system',
          estimatedTime: 3,
          instructions: [
            'Navigate to the Plants section from the main menu',
            'Click the "Add Plant" button in the top right',
            'Fill in the basic information: name, species, and strain',
            'Set the planting date and initial stage',
            'Click "Save" to create the plant',
          ],
          tips: [
            'Use descriptive names to easily identify plants later',
            'Accurate planting dates help with growth tracking',
          ],
        },
        {
          id: 's2',
          title: 'Configure Monitoring Settings',
          description: 'Set up environmental monitoring for your plant',
          estimatedTime: 5,
          instructions: [
            'Select your newly created plant from the list',
            'Click on the "Monitoring" tab',
            'Enable the sensors you want to track (temperature, humidity, pH)',
            'Set optimal ranges for each parameter',
            'Configure the monitoring frequency',
          ],
          tips: [
            'Different growth stages may require different optimal ranges',
            'More frequent monitoring provides better data but uses more resources',
          ],
        },
        {
          id: 's3',
          title: 'View the Dashboard',
          description: 'Understand the plant health dashboard',
          estimatedTime: 4,
          instructions: [
            'Navigate to the Dashboard from the main menu',
            'Locate your plant in the overview grid',
            'Review the health indicators and recent sensor data',
            'Check the growth progress chart',
            'Explore different time ranges for historical data',
          ],
        },
        {
          id: 's4',
          title: 'Set Up Alerts',
          description: 'Configure automated alerts for your plant',
          estimatedTime: 3,
          instructions: [
            'Go to Settings > Notifications',
            'Click "Add Alert Rule"',
            'Select the condition (e.g., temperature too high)',
            'Set the threshold value',
            'Choose notification method (email, SMS, or in-app)',
            'Save the alert rule',
          ],
          tips: [
            'Start with critical alerts first (extreme temperatures, pH imbalances)',
            'You can always add more alerts as you become familiar with the system',
          ],
        },
      ],
    },
    {
      id: '2',
      title: 'Advanced Reporting and Analytics',
      description: 'Master the report builder and create custom dashboards',
      difficulty: 'advanced',
      category: 'features',
      estimatedTime: 25,
      learningOutcomes: [
        'Create custom reports with the report builder',
        'Build personalized analytics dashboards',
        'Export data in multiple formats',
        'Schedule automated report generation',
      ],
      steps: [
        {
          id: 's1',
          title: 'Understanding the Report Builder',
          description: 'Learn about available report types and data sources',
          estimatedTime: 5,
          instructions: [
            'Navigate to Reports > Report Builder',
            'Review the available report types',
            'Explore different data sources',
            'Understand aggregation options',
          ],
        },
        {
          id: 's2',
          title: 'Create Your First Custom Report',
          description: 'Build a growth comparison report',
          estimatedTime: 10,
          instructions: [
            'Click "Create New Report"',
            'Select "Chart" as the report type',
            'Choose "Plants" as the data source',
            'Add fields: Plant Name, Growth Stage, Height',
            'Set filters for active plants only',
            'Preview the report',
            'Save with a descriptive name',
          ],
          tips: [
            'Use filters to focus on specific plant batches or time periods',
            'Preview before saving to ensure the data looks correct',
          ],
        },
        {
          id: 's3',
          title: 'Build a Custom Dashboard',
          description: 'Create a personalized analytics dashboard',
          estimatedTime: 7,
          instructions: [
            'Go to Dashboards > Custom Dashboard',
            'Click "Edit" to enter edit mode',
            'Add widgets for key metrics',
            'Arrange widgets using drag and drop',
            'Configure each widget\'s data source',
            'Save your dashboard layout',
          ],
        },
        {
          id: 's4',
          title: 'Schedule Automated Reports',
          description: 'Set up recurring report generation',
          estimatedTime: 3,
          instructions: [
            'Open an existing report',
            'Click "Schedule"',
            'Set the frequency (daily, weekly, monthly)',
            'Choose the delivery method',
            'Configure recipients',
            'Enable the schedule',
          ],
        },
      ],
    },
    {
      id: '3',
      title: 'Sensor Calibration and Maintenance',
      description: 'Keep your sensors accurate and reliable',
      difficulty: 'intermediate',
      category: 'troubleshooting',
      estimatedTime: 20,
      learningOutcomes: [
        'Properly calibrate pH sensors',
        'Maintain temperature and humidity sensors',
        'Troubleshoot common sensor issues',
        'Understand calibration schedules',
      ],
      steps: [
        {
          id: 's1',
          title: 'pH Sensor Calibration',
          description: 'Learn the proper pH sensor calibration procedure',
          estimatedTime: 8,
          instructions: [
            'Prepare calibration solutions (pH 4.0, 7.0, and 10.0)',
            'Rinse the sensor with distilled water',
            'Start calibration mode in the system',
            'Place sensor in pH 7.0 solution first',
            'Wait for reading to stabilize',
            'Repeat for pH 4.0 and 10.0',
            'Complete calibration and verify accuracy',
          ],
          tips: [
            'Always use fresh calibration solutions',
            'Rinse sensor between different pH solutions',
            'Store pH sensors in storage solution, not water',
          ],
        },
        {
          id: 's2',
          title: 'Temperature Sensor Verification',
          description: 'Check and maintain temperature sensor accuracy',
          estimatedTime: 6,
          instructions: [
            'Use a reference thermometer',
            'Place both sensors in the same location',
            'Wait for readings to stabilize',
            'Compare readings',
            'Adjust calibration if difference exceeds ±0.5°C',
          ],
        },
        {
          id: 's3',
          title: 'Common Issues and Solutions',
          description: 'Troubleshoot typical sensor problems',
          estimatedTime: 6,
          instructions: [
            'Identify the issue (unstable readings, no data, etc.)',
            'Check physical connections',
            'Verify power supply',
            'Clean sensor probes',
            'Recalibrate if necessary',
            'Replace if problems persist',
          ],
        },
      ],
    },
  ];
}
