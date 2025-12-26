/**
 * Form Components - Comprehensive form building system
 *
 * Features:
 * - Dynamic form builder from schema
 * - Multi-step form wizard with validation
 * - Unified field component for all input types
 * - Form validation hook with 8 rule types
 */

// Form Builder Components
export { FormBuilder } from './FormBuilder';
export type { FormBuilderProps, FormSchema } from './FormBuilder';

// Form Field Component
export { FormField } from './FormField';
export type {
  FormFieldProps,
  FieldConfig,
  FieldOption,
  FieldType,
} from './FormField';

// Form Wizard Component
export { FormWizard, useWizard, WizardExamples } from './FormWizard';
export type { FormWizardProps, WizardStep } from './FormWizard';

// Re-export form hook and validation utilities
export { useForm, validate, validationRules } from '../../hooks/useForm';
export type {
  UseFormOptions,
  UseFormReturn,
  ValidationRule,
  FieldValidation,
  FormErrors,
} from '../../hooks/useForm';
