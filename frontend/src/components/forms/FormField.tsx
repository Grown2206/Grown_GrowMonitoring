import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  InputLabel,
  Slider,
  Autocomplete,
} from '@mui/material';
import { ValidationRule } from '../../hooks/useForm';

export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'password'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'autocomplete'
  | 'date'
  | 'time'
  | 'datetime';

export interface FieldOption {
  label: string;
  value: any;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helperText?: string;
  validation?: ValidationRule[];
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  multiline?: boolean;
  disabled?: boolean;
  required?: boolean;
  gridSpan?: number;
  fullWidth?: boolean;
}

export interface FormFieldProps {
  config: FieldConfig;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: string;
}

export function FormField({ config, value, onChange, onBlur, error }: FormFieldProps) {
  const { name, label, type, placeholder, helperText, options = [], disabled, required, fullWidth = true } = config;

  const handleChange = (event: any) => {
    switch (type) {
      case 'checkbox':
      case 'switch':
        onChange(event.target.checked);
        break;
      case 'number':
      case 'slider':
        onChange(Number(event.target.value));
        break;
      default:
        onChange(event.target.value);
    }
  };

  switch (type) {
    case 'text':
    case 'email':
    case 'password':
      return (
        <TextField
          name={name}
          label={label}
          type={type}
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          helperText={error || helperText}
          error={Boolean(error)}
          disabled={disabled}
          required={required}
          fullWidth={fullWidth}
        />
      );

    case 'number':
      return (
        <TextField
          name={name}
          label={label}
          type="number"
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          helperText={error || helperText}
          error={Boolean(error)}
          disabled={disabled}
          required={required}
          fullWidth={fullWidth}
          inputProps={{ min: config.min, max: config.max, step: config.step }}
        />
      );

    case 'textarea':
      return (
        <TextField
          name={name}
          label={label}
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          helperText={error || helperText}
          error={Boolean(error)}
          disabled={disabled}
          required={required}
          fullWidth={fullWidth}
          multiline
          rows={config.rows || 4}
        />
      );

    case 'select':
      return (
        <FormControl fullWidth={fullWidth} error={Boolean(error)} disabled={disabled} required={required}>
          <InputLabel>{label}</InputLabel>
          <Select name={name} value={value || ''} onChange={handleChange} onBlur={onBlur} label={label}>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControl error={Boolean(error)} disabled={disabled}>
          <FormControlLabel
            control={<Checkbox checked={Boolean(value)} onChange={handleChange} onBlur={onBlur} name={name} />}
            label={label}
          />
          {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
        </FormControl>
      );

    case 'switch':
      return (
        <FormControl error={Boolean(error)} disabled={disabled}>
          <FormControlLabel
            control={<Switch checked={Boolean(value)} onChange={handleChange} onBlur={onBlur} name={name} />}
            label={label}
          />
          {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
        </FormControl>
      );

    case 'radio':
      return (
        <FormControl error={Boolean(error)} disabled={disabled} required={required}>
          <FormLabel>{label}</FormLabel>
          <RadioGroup name={name} value={value || ''} onChange={handleChange} onBlur={onBlur}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={option.label}
              />
            ))}
          </RadioGroup>
          {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
        </FormControl>
      );

    case 'slider':
      return (
        <FormControl fullWidth={fullWidth} error={Boolean(error)} disabled={disabled}>
          <FormLabel>{label}</FormLabel>
          <Slider
            value={value || config.min || 0}
            onChange={(_, newValue) => onChange(newValue)}
            onBlur={onBlur}
            min={config.min || 0}
            max={config.max || 100}
            step={config.step || 1}
            valueLabelDisplay="auto"
            disabled={disabled}
          />
          {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
        </FormControl>
      );

    case 'autocomplete':
      return (
        <Autocomplete
          options={options}
          getOptionLabel={(option) => option.label}
          value={options.find((opt) => opt.value === value) || null}
          onChange={(_, newValue) => onChange(newValue?.value)}
          onBlur={onBlur}
          disabled={disabled}
          renderInput={(params) => (
            <TextField
              {...params}
              name={name}
              label={label}
              placeholder={placeholder}
              helperText={error || helperText}
              error={Boolean(error)}
              required={required}
            />
          )}
        />
      );

    case 'date':
      return (
        <TextField
          name={name}
          label={label}
          type="date"
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          helperText={error || helperText}
          error={Boolean(error)}
          disabled={disabled}
          required={required}
          fullWidth={fullWidth}
          InputLabelProps={{ shrink: true }}
        />
      );

    case 'time':
      return (
        <TextField
          name={name}
          label={label}
          type="time"
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          helperText={error || helperText}
          error={Boolean(error)}
          disabled={disabled}
          required={required}
          fullWidth={fullWidth}
          InputLabelProps={{ shrink: true }}
        />
      );

    case 'datetime':
      return (
        <TextField
          name={name}
          label={label}
          type="datetime-local"
          value={value || ''}
          onChange={handleChange}
          onBlur={onBlur}
          helperText={error || helperText}
          error={Boolean(error)}
          disabled={disabled}
          required={required}
          fullWidth={fullWidth}
          InputLabelProps={{ shrink: true }}
        />
      );

    default:
      return <TextField label={label} value={value} fullWidth={fullWidth} />;
  }
}
