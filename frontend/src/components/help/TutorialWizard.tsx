import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  Backdrop,
  Fade,
  Popper,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  Check as CompleteIcon,
  Lightbulb as TipIcon,
} from '@mui/icons-material';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string; // CSS selector for highlighting
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'input' | 'navigate' | 'observe';
  tip?: string;
  image?: string;
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  steps: TutorialStep[];
}

export interface TutorialWizardProps {
  tutorial?: Tutorial;
  open?: boolean;
  onComplete?: (tutorialId: string) => void;
  onSkip?: (tutorialId: string) => void;
  onClose?: () => void;
  autoStart?: boolean;
}

const defaultTutorial: Tutorial = {
  id: 'first-plant',
  title: 'Add Your First Plant',
  description: 'Learn how to add and configure a new plant in the system',
  category: 'getting-started',
  difficulty: 'beginner',
  estimatedTime: 5,
  steps: [
    {
      id: 'step-1',
      title: 'Welcome',
      description: 'This tutorial will guide you through adding your first plant to the monitoring system.',
      action: 'observe',
      tip: 'You can skip this tutorial at any time and come back to it later.',
    },
    {
      id: 'step-2',
      title: 'Navigate to Plants',
      description: 'Click on the "Plants" menu item in the sidebar to access the plant management page.',
      targetElement: '[data-tutorial="plants-menu"]',
      action: 'click',
    },
    {
      id: 'step-3',
      title: 'Add New Plant',
      description: 'Click the "Add Plant" button in the top-right corner of the page.',
      targetElement: '[data-tutorial="add-plant-button"]',
      action: 'click',
      tip: 'You can add as many plants as you need to monitor.',
    },
    {
      id: 'step-4',
      title: 'Enter Plant Details',
      description: 'Fill in the basic information about your plant including name, species, and planting date.',
      targetElement: '[data-tutorial="plant-form"]',
      action: 'input',
    },
    {
      id: 'step-5',
      title: 'Set Optimal Ranges',
      description: 'Configure the ideal environmental conditions for your plant. These will be used for alerts.',
      targetElement: '[data-tutorial="optimal-ranges"]',
      action: 'input',
      tip: 'Default values are provided, but you can customize them based on your plant species.',
    },
    {
      id: 'step-6',
      title: 'Save Your Plant',
      description: 'Click the "Save" button to add your plant to the system.',
      targetElement: '[data-tutorial="save-button"]',
      action: 'click',
    },
    {
      id: 'step-7',
      title: 'Congratulations!',
      description: 'You have successfully added your first plant. You can now view its dashboard and monitor its growth.',
      action: 'observe',
    },
  ],
};

/**
 * Interactive tutorial wizard with step-by-step guidance
 */
export function TutorialWizard({
  tutorial: customTutorial,
  open: controlledOpen,
  onComplete,
  onSkip,
  onClose,
  autoStart = false,
}: TutorialWizardProps) {
  const tutorial = customTutorial || defaultTutorial;
  const [internalOpen, setInternalOpen] = useState(autoStart);
  const [activeStep, setActiveStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const currentStep = tutorial.steps[activeStep];
  const isLastStep = activeStep === tutorial.steps.length - 1;
  const isFirstStep = activeStep === 0;
  const progress = ((activeStep + 1) / tutorial.steps.length) * 100;

  useEffect(() => {
    if (open && currentStep.targetElement) {
      const element = document.querySelector(currentStep.targetElement) as HTMLElement;
      if (element) {
        setHighlightElement(element);
        setAnchorEl(element);
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightElement(null);
      setAnchorEl(null);
    }
  }, [open, activeStep, currentStep.targetElement]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(tutorial.id);
    }
    handleClose();
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip(tutorial.id);
    }
    handleClose();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    if (!isControlled) {
      setInternalOpen(false);
    }
    setActiveStep(0);
    setHighlightElement(null);
    setAnchorEl(null);
  };

  const getDifficultyColor = (difficulty: Tutorial['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <>
      {/* Backdrop for highlighting */}
      {open && highlightElement && (
        <Backdrop
          open
          sx={{
            zIndex: (theme) => theme.zIndex.modal - 1,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
        />
      )}

      {/* Highlighted element overlay */}
      {open && highlightElement && (
        <Box
          sx={{
            position: 'fixed',
            zIndex: (theme) => theme.zIndex.modal,
            pointerEvents: 'none',
            border: '3px solid',
            borderColor: 'primary.main',
            borderRadius: 1,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
            top: highlightElement.offsetTop,
            left: highlightElement.offsetLeft,
            width: highlightElement.offsetWidth,
            height: highlightElement.offsetHeight,
          }}
        />
      )}

      {/* Tutorial dialog (for steps without target elements) */}
      {open && !currentStep.targetElement && (
        <Dialog
          open
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { zIndex: (theme) => theme.zIndex.modal + 1 },
          }}
        >
          <DialogContent>
            <Stack spacing={3}>
              {/* Header */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {tutorial.title}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: `${getDifficultyColor(tutorial.difficulty)}.main`,
                        color: `${getDifficultyColor(tutorial.difficulty)}.contrastText`,
                      }}
                    >
                      {tutorial.difficulty}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {tutorial.estimatedTime} min
                    </Typography>
                  </Stack>
                </Box>
                <IconButton onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </Stack>

              {/* Progress */}
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    Step {activeStep + 1} of {tutorial.steps.length}
                  </Typography>
                  <Typography variant="body2">{Math.round(progress)}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={progress} />
              </Box>

              {/* Stepper */}
              <Stepper activeStep={activeStep} alternativeLabel>
                {tutorial.steps.map((step) => (
                  <Step key={step.id}>
                    <StepLabel>{step.title}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {/* Step content */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {currentStep.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {currentStep.description}
                  </Typography>
                  {currentStep.tip && (
                    <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <TipIcon />
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Tip
                          </Typography>
                          <Typography variant="body2">{currentStep.tip}</Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleSkip}>Skip Tutorial</Button>
            <Box sx={{ flex: 1 }} />
            {!isFirstStep && (
              <Button startIcon={<BackIcon />} onClick={handleBack}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              endIcon={isLastStep ? <CompleteIcon /> : <NextIcon />}
              onClick={handleNext}
            >
              {isLastStep ? 'Complete' : 'Next'}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Popper for steps with target elements */}
      {open && currentStep.targetElement && anchorEl && (
        <Popper
          open
          anchorEl={anchorEl}
          placement={currentStep.position || 'bottom'}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
          transition
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={350}>
              <Paper sx={{ p: 2, maxWidth: 400 }}>
                <Stack spacing={2}>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      Step {activeStep + 1} of {tutorial.steps.length}
                    </Typography>
                    <IconButton size="small" onClick={handleClose}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Stack>

                  {/* Content */}
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {currentStep.title}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {currentStep.description}
                    </Typography>
                    {currentStep.tip && (
                      <Paper sx={{ p: 1.5, bgcolor: 'info.light' }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <TipIcon fontSize="small" />
                          <Typography variant="caption">{currentStep.tip}</Typography>
                        </Stack>
                      </Paper>
                    )}
                  </Box>

                  {/* Actions */}
                  <Stack direction="row" spacing={1} justifyContent="space-between">
                    <Button size="small" onClick={handleSkip}>
                      Skip
                    </Button>
                    <Stack direction="row" spacing={1}>
                      {!isFirstStep && (
                        <Button size="small" startIcon={<BackIcon />} onClick={handleBack}>
                          Back
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="contained"
                        endIcon={isLastStep ? <CompleteIcon /> : <NextIcon />}
                        onClick={handleNext}
                      >
                        {isLastStep ? 'Complete' : 'Next'}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>
            </Fade>
          )}
        </Popper>
      )}
    </>
  );
}
