import React from 'react';
import { Box, Button, Grid, Paper, Typography, Stack } from '@mui/material';
import { useForm, ValidationRule } from '../../hooks/useForm';
import { FormField, FieldConfig } from './FormField';

export interface FormSchema {
  fields: FieldConfig[];
  layout?: 'single' | 'grid' | 'inline';
  columns?: number;
}

export interface FormBuilderProps<T> {
  schema: FormSchema;
  initialValues: T;
  onSubmit: (values: T) => void | Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  title?: string;
  description?: string;
  showReset?: boolean;
  loading?: boolean;
}

export function FormBuilder<T extends Record<string, any>>({
  schema,
  initialValues,
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  title,
  description,
  showReset = true,
  loading = false,
}: FormBuilderProps<T>) {
  const validationRules: Record<string, ValidationRule[]> = {};
  schema.fields.forEach((field) => {
    if (field.validation) {
      validationRules[field.name] = field.validation;
    }
  });

  const form = useForm({
    initialValues,
    validationRules,
    onSubmit,
    validateOnBlur: true,
  });

  const gridColumns = schema.columns || 2;
  const layout = schema.layout || 'grid';

  return (
    <Paper sx={{ p: 3 }}>
      {title && (
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      )}
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}

      <form onSubmit={form.handleSubmit}>
        {layout === 'grid' ? (
          <Grid container spacing={2}>
            {schema.fields.map((field) => {
              const span = field.gridSpan || 12 / gridColumns;
              return (
                <Grid item xs={12} md={span} key={field.name}>
                  <FormField
                    config={field}
                    value={form.values[field.name as keyof T]}
                    onChange={form.handleChange(field.name as keyof T)}
                    onBlur={form.handleBlur(field.name as keyof T)}
                    error={form.touched[field.name] ? form.errors[field.name] : undefined}
                  />
                </Grid>
              );
            })}
          </Grid>
        ) : layout === 'inline' ? (
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {schema.fields.map((field) => (
              <Box key={field.name} sx={{ flex: field.gridSpan ? `0 0 ${field.gridSpan}%` : 1 }}>
                <FormField
                  config={field}
                  value={form.values[field.name as keyof T]}
                  onChange={form.handleChange(field.name as keyof T)}
                  onBlur={form.handleBlur(field.name as keyof T)}
                  error={form.touched[field.name] ? form.errors[field.name] : undefined}
                />
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {schema.fields.map((field) => (
              <FormField
                key={field.name}
                config={field}
                value={form.values[field.name as keyof T]}
                onChange={form.handleChange(field.name as keyof T)}
                onBlur={form.handleBlur(field.name as keyof T)}
                error={form.touched[field.name] ? form.errors[field.name] : undefined}
              />
            ))}
          </Stack>
        )}

        <Stack direction="row" spacing={2} sx={{ mt: 3 }} justifyContent="flex-end">
          {onCancel && (
            <Button onClick={onCancel} disabled={form.isSubmitting || loading}>
              {cancelText}
            </Button>
          )}
          {showReset && (
            <Button onClick={form.resetForm} disabled={form.isSubmitting || loading}>
              Reset
            </Button>
          )}
          <Button type="submit" variant="contained" disabled={form.isSubmitting || loading}>
            {form.isSubmitting || loading ? 'Submitting...' : submitText}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
