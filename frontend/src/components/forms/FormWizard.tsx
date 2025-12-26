import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useForm, UseFormOptions, ValidationRule } from '../../hooks/useForm';
import { FormField, FieldConfig } from './FormField';

export interface WizardStep {
  label: string;
  description?: string;
  fields: FieldConfig[];
  validationRules?: { [fieldName: string]: ValidationRule[] };
  optional?: boolean;
  condition?: (values: any) => boolean;
}

export interface FormWizardProps<T extends Record<string, any>> {
  steps: WizardStep[];
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
  orientation?: 'horizontal' | 'vertical';
  showProgress?: boolean;
  allowStepSkip?: boolean;
  submitText?: string;
  nextText?: string;
  backText?: string;
  loading?: boolean;
}

/**
 * Multi-step form wizard with validation and progress tracking
 */
export function FormWizard<T extends Record<string, any>>({
  steps,
  initialValues,
  onSubmit,
  onCancel,
  title,
  orientation = 'horizontal',
  showProgress = true,
  allowStepSkip = false,
  submitText = 'Submit',
  nextText = 'Next',
  backText = 'Back',
  loading = false,
}: FormWizardProps<T>) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Filter steps based on conditions
  const visibleSteps = steps.filter((step, index) => {
    if (!step.condition) return true;
    return step.condition(form.values);
  });

  // Combine all validation rules from all steps
  const allValidationRules = steps.reduce((acc, step) => {
    return { ...acc, ...step.validationRules };
  }, {});

  const form = useForm<T>({
    initialValues,
    validationRules: allValidationRules,
    onSubmit,
    validateOnBlur: true,
  });

  const currentStep = visibleSteps[activeStep];
  const isLastStep = activeStep === visibleSteps.length - 1;
  const isFirstStep = activeStep === 0;

  // Validate current step fields
  const validateCurrentStep = useCallback((): boolean => {
    const currentFields = currentStep.fields.map((field) => field.name);
    let isValid = true;

    currentFields.forEach((fieldName) => {
      const error = form.validateField(fieldName as keyof T);
      if (error) {
        form.setFieldError(fieldName as keyof T, error);
        form.setFieldTouched(fieldName as keyof T, true);
        isValid = false;
      }
    });

    return isValid;
  }, [currentStep, form]);

  const handleNext = useCallback(() => {
    if (currentStep.optional || validateCurrentStep()) {
      setCompletedSteps((prev) => new Set(prev).add(activeStep));
      setActiveStep((prev) => Math.min(prev + 1, visibleSteps.length - 1));
    }
  }, [activeStep, currentStep, validateCurrentStep, visibleSteps.length]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleStepClick = useCallback(
    (stepIndex: number) => {
      if (!allowStepSkip && !completedSteps.has(stepIndex - 1) && stepIndex > 0) {
        return;
      }
      setActiveStep(stepIndex);
    },
    [allowStepSkip, completedSteps]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (isLastStep) {
        if (validateCurrentStep()) {
          await form.handleSubmit();
        }
      } else {
        handleNext();
      }
    },
    [isLastStep, validateCurrentStep, form, handleNext]
  );

  const progress = ((activeStep + 1) / visibleSteps.length) * 100;

  return (
    <Paper sx={{ p: 3 }}>
      {title && (
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      )}

      {showProgress && (
        <Box sx={{ mb: 3 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Step {activeStep + 1} of {visibleSteps.length}
          </Typography>
        </Box>
      )}

      <Stepper activeStep={activeStep} orientation={orientation} sx={{ mb: 4 }}>
        {visibleSteps.map((step, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: { optional?: React.ReactNode; error?: boolean } = {};

          if (step.optional) {
            labelProps.optional = <Typography variant="caption">Optional</Typography>;
          }

          if (completedSteps.has(index)) {
            stepProps.completed = true;
          }

          const hasErrors = step.fields.some((field) => form.errors[field.name]);
          if (hasErrors && form.touched[step.fields[0]?.name]) {
            labelProps.error = true;
          }

          return (
            <Step key={step.label} {...stepProps}>
              <StepLabel
                {...labelProps}
                onClick={() => handleStepClick(index)}
                sx={{ cursor: allowStepSkip || completedSteps.has(index - 1) ? 'pointer' : 'default' }}
              >
                {step.label}
              </StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <form onSubmit={handleSubmit}>
        {currentStep.description && (
          <Alert severity="info" sx={{ mb: 3 }}>
            {currentStep.description}
          </Alert>
        )}

        <Stack spacing={3}>
          {currentStep.fields.map((field) => (
            <FormField
              key={field.name}
              config={field}
              value={form.values[field.name]}
              onChange={form.handleChange(field.name as keyof T)}
              onBlur={form.handleBlur(field.name as keyof T)}
              error={form.touched[field.name] ? form.errors[field.name] : undefined}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          {onCancel && (
            <Button onClick={onCancel} disabled={form.isSubmitting || loading}>
              Cancel
            </Button>
          )}

          <Box sx={{ flex: 1 }} />

          {!isFirstStep && (
            <Button onClick={handleBack} disabled={form.isSubmitting || loading}>
              {backText}
            </Button>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={form.isSubmitting || loading}
            sx={{ minWidth: 120 }}
          >
            {isLastStep ? submitText : nextText}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}

/**
 * Simple wizard hook for managing step state
 */
export function useWizard(totalSteps: number) {
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleNext = useCallback(() => {
    setCompletedSteps((prev) => new Set(prev).add(activeStep));
    setActiveStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [activeStep, totalSteps]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setActiveStep(0);
    setCompletedSteps(new Set());
  }, []);

  const handleGoToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setActiveStep(step);
      }
    },
    [totalSteps]
  );

  const isStepComplete = useCallback(
    (step: number) => {
      return completedSteps.has(step);
    },
    [completedSteps]
  );

  const isLastStep = activeStep === totalSteps - 1;
  const isFirstStep = activeStep === 0;
  const progress = ((activeStep + 1) / totalSteps) * 100;

  return {
    activeStep,
    completedSteps,
    isLastStep,
    isFirstStep,
    progress,
    handleNext,
    handleBack,
    handleReset,
    handleGoToStep,
    isStepComplete,
  };
}

/**
 * Example usage with predefined wizard steps
 */
export const WizardExamples = {
  userRegistration: [
    {
      label: 'Account Info',
      description: 'Create your account',
      fields: [
        { name: 'email', label: 'Email', type: 'email' as const, required: true },
        { name: 'password', label: 'Password', type: 'password' as const, required: true },
        { name: 'confirmPassword', label: 'Confirm Password', type: 'password' as const, required: true },
      ],
      validationRules: {
        email: [{ type: 'required', message: 'Email is required' }, { type: 'email' }],
        password: [{ type: 'required' }, { type: 'minLength', value: 8 }],
        confirmPassword: [
          { type: 'required' },
          {
            type: 'custom',
            validator: (value: string, values: any) => value === values.password,
            message: 'Passwords must match',
          },
        ],
      },
    },
    {
      label: 'Personal Info',
      description: 'Tell us about yourself',
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text' as const, required: true },
        { name: 'lastName', label: 'Last Name', type: 'text' as const, required: true },
        { name: 'phone', label: 'Phone', type: 'text' as const },
      ],
      validationRules: {
        firstName: [{ type: 'required' }],
        lastName: [{ type: 'required' }],
      },
    },
    {
      label: 'Preferences',
      description: 'Customize your experience',
      optional: true,
      fields: [
        {
          name: 'newsletter',
          label: 'Subscribe to newsletter',
          type: 'checkbox' as const,
        },
        {
          name: 'notifications',
          label: 'Enable notifications',
          type: 'switch' as const,
        },
      ],
    },
  ],

  plantSetup: [
    {
      label: 'Plant Details',
      fields: [
        { name: 'plantName', label: 'Plant Name', type: 'text' as const, required: true },
        {
          name: 'plantType',
          label: 'Plant Type',
          type: 'select' as const,
          required: true,
          options: [
            { label: 'Tomato', value: 'tomato' },
            { label: 'Lettuce', value: 'lettuce' },
            { label: 'Herbs', value: 'herbs' },
            { label: 'Flowers', value: 'flowers' },
          ],
        },
      ],
    },
    {
      label: 'Environment',
      fields: [
        { name: 'minTemp', label: 'Min Temperature (°C)', type: 'number' as const, min: 0, max: 50 },
        { name: 'maxTemp', label: 'Max Temperature (°C)', type: 'number' as const, min: 0, max: 50 },
        { name: 'targetHumidity', label: 'Target Humidity (%)', type: 'slider' as const, min: 0, max: 100 },
      ],
    },
    {
      label: 'Watering Schedule',
      fields: [
        { name: 'wateringInterval', label: 'Watering Interval (hours)', type: 'number' as const, min: 1, max: 168 },
        { name: 'wateringDuration', label: 'Watering Duration (seconds)', type: 'number' as const, min: 1, max: 300 },
      ],
    },
  ],
};
