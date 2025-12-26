import { useState, useCallback, useEffect } from 'react';

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any) => boolean | string;
}

export interface FieldValidation {
  [fieldName: string]: ValidationRule[];
}

export interface FormErrors {
  [fieldName: string]: string;
}

export interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: FieldValidation;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  touched: { [key: string]: boolean };
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (field: keyof T) => (value: any) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => string | null;
  validateForm: () => boolean;
}

/**
 * Comprehensive form hook with validation
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate single field
  const validateField = useCallback(
    (field: keyof T): string | null => {
      const rules = validationRules[field as string];
      if (!rules || rules.length === 0) return null;

      const value = values[field];

      for (const rule of rules) {
        let isValid = true;
        let errorMessage = rule.message || `${String(field)} is invalid`;

        switch (rule.type) {
          case 'required':
            isValid = value !== undefined && value !== null && value !== '';
            errorMessage = rule.message || `${String(field)} is required`;
            break;

          case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
            errorMessage = rule.message || `${String(field)} must be a valid email`;
            break;

          case 'min':
            isValid = Number(value) >= rule.value;
            errorMessage = rule.message || `${String(field)} must be at least ${rule.value}`;
            break;

          case 'max':
            isValid = Number(value) <= rule.value;
            errorMessage = rule.message || `${String(field)} must be at most ${rule.value}`;
            break;

          case 'minLength':
            isValid = String(value || '').length >= rule.value;
            errorMessage =
              rule.message || `${String(field)} must be at least ${rule.value} characters`;
            break;

          case 'maxLength':
            isValid = String(value || '').length <= rule.value;
            errorMessage =
              rule.message || `${String(field)} must be at most ${rule.value} characters`;
            break;

          case 'pattern':
            isValid = new RegExp(rule.value).test(String(value || ''));
            errorMessage = rule.message || `${String(field)} format is invalid`;
            break;

          case 'custom':
            if (rule.validator) {
              const result = rule.validator(value);
              if (typeof result === 'string') {
                return result;
              }
              isValid = result;
            }
            break;
        }

        if (!isValid) {
          return errorMessage;
        }
      }

      return null;
    },
    [validationRules, values]
  );

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field as keyof T);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (field: keyof T) => (value: any) => {
      setValues((prev) => ({
        ...prev,
        [field]: value,
      }));

      if (validateOnChange) {
        const error = validateField(field);
        setErrors((prev) => ({
          ...prev,
          [field]: error || '',
        }));
      }
    },
    [validateField, validateOnChange]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({
        ...prev,
        [field]: true,
      }));

      if (validateOnBlur) {
        const error = validateField(field);
        setErrors((prev) => ({
          ...prev,
          [field]: error || '',
        }));
      }
    },
    [validateField, validateOnBlur]
  );

  // Handle submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched: { [key: string]: boolean } = {};
      Object.keys(values).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      // Validate
      const isValid = validateForm();

      if (isValid) {
        setIsSubmitting(true);
        try {
          await onSubmit(values);
        } catch (error) {
          console.error('Form submission error:', error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [values, validateForm, onSubmit]
  );

  // Set field value
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Set field error
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  }, []);

  // Set field touched
  const setFieldTouched = useCallback((field: keyof T, touched: boolean) => {
    setTouched((prev) => ({
      ...prev,
      [field]: touched,
    }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    validateField,
    validateForm,
  };
}

/**
 * Simple form validation helper
 */
export function validate(value: any, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    let isValid = true;
    let errorMessage = rule.message || 'Invalid value';

    switch (rule.type) {
      case 'required':
        isValid = value !== undefined && value !== null && value !== '';
        errorMessage = rule.message || 'This field is required';
        break;

      case 'email':
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
        errorMessage = rule.message || 'Must be a valid email';
        break;

      case 'min':
        isValid = Number(value) >= rule.value;
        errorMessage = rule.message || `Must be at least ${rule.value}`;
        break;

      case 'max':
        isValid = Number(value) <= rule.value;
        errorMessage = rule.message || `Must be at most ${rule.value}`;
        break;

      case 'minLength':
        isValid = String(value || '').length >= rule.value;
        errorMessage = rule.message || `Must be at least ${rule.value} characters`;
        break;

      case 'maxLength':
        isValid = String(value || '').length <= rule.value;
        errorMessage = rule.message || `Must be at most ${rule.value} characters`;
        break;

      case 'pattern':
        isValid = new RegExp(rule.value).test(String(value || ''));
        errorMessage = rule.message || 'Invalid format';
        break;

      case 'custom':
        if (rule.validator) {
          const result = rule.validator(value);
          if (typeof result === 'string') {
            return result;
          }
          isValid = result;
        }
        break;
    }

    if (!isValid) {
      return errorMessage;
    }
  }

  return null;
}

/**
 * Predefined validation rules
 */
export const validationRules = {
  required: (message?: string): ValidationRule => ({
    type: 'required',
    message: message || 'This field is required',
  }),

  email: (message?: string): ValidationRule => ({
    type: 'email',
    message: message || 'Must be a valid email address',
  }),

  min: (value: number, message?: string): ValidationRule => ({
    type: 'min',
    value,
    message: message || `Must be at least ${value}`,
  }),

  max: (value: number, message?: string): ValidationRule => ({
    type: 'max',
    value,
    message: message || `Must be at most ${value}`,
  }),

  minLength: (value: number, message?: string): ValidationRule => ({
    type: 'minLength',
    value,
    message: message || `Must be at least ${value} characters`,
  }),

  maxLength: (value: number, message?: string): ValidationRule => ({
    type: 'maxLength',
    value,
    message: message || `Must be at most ${value} characters`,
  }),

  pattern: (regex: string | RegExp, message?: string): ValidationRule => ({
    type: 'pattern',
    value: typeof regex === 'string' ? regex : regex.source,
    message: message || 'Invalid format',
  }),

  custom: (validator: (value: any) => boolean | string, message?: string): ValidationRule => ({
    type: 'custom',
    validator,
    message,
  }),
};
