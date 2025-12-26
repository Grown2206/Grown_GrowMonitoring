import React, { useState, useEffect, ChangeEvent, FocusEvent } from 'react';
import {
  Box,
  TextField,
  TextFieldProps,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';

export interface NumberInputProps extends Omit<TextFieldProps, 'onChange' | 'value' | 'type'> {
  /**
   * Current value
   */
  value?: number;
  /**
   * Change handler
   */
  onChange?: (value: number) => void;
  /**
   * Minimum value
   */
  min?: number;
  /**
   * Maximum value
   */
  max?: number;
  /**
   * Step increment/decrement
   */
  step?: number;
  /**
   * Number of decimal places
   */
  decimals?: number;
  /**
   * Show increment/decrement buttons
   */
  showButtons?: boolean;
  /**
   * Unit to display
   */
  unit?: string;
  /**
   * Format number for display
   */
  formatNumber?: (value: number) => string;
  /**
   * Parse display string to number
   */
  parseNumber?: (value: string) => number;
  /**
   * Allow negative numbers
   */
  allowNegative?: boolean;
}

/**
 * Enhanced number input with increment/decrement buttons and formatting
 */
export function NumberInput({
  value = 0,
  onChange,
  min,
  max,
  step = 1,
  decimals,
  showButtons = true,
  unit,
  formatNumber,
  parseNumber,
  allowNegative = true,
  ...textFieldProps
}: NumberInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(formatValue(value));

  useEffect(() => {
    setLocalValue(value);
    setDisplayValue(formatValue(value));
  }, [value]);

  function formatValue(num: number): string {
    if (formatNumber) {
      return formatNumber(num);
    }

    if (decimals !== undefined) {
      return num.toFixed(decimals);
    }

    return String(num);
  }

  function parseValue(str: string): number {
    if (parseNumber) {
      return parseNumber(str);
    }

    const parsed = parseFloat(str);
    return isNaN(parsed) ? 0 : parsed;
  }

  function clampValue(num: number): number {
    let clamped = num;

    if (!allowNegative && clamped < 0) {
      clamped = 0;
    }

    if (min !== undefined && clamped < min) {
      clamped = min;
    }

    if (max !== undefined && clamped > max) {
      clamped = max;
    }

    if (decimals !== undefined) {
      clamped = parseFloat(clamped.toFixed(decimals));
    }

    return clamped;
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(event.target.value);
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const newValue = clampValue(parseValue(event.target.value));
    setLocalValue(newValue);
    setDisplayValue(formatValue(newValue));

    if (onChange && newValue !== value) {
      onChange(newValue);
    }

    if (textFieldProps.onBlur) {
      textFieldProps.onBlur(event);
    }
  };

  const handleIncrement = () => {
    const newValue = clampValue(localValue + step);
    setLocalValue(newValue);
    setDisplayValue(formatValue(newValue));

    if (onChange) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const newValue = clampValue(localValue - step);
    setLocalValue(newValue);
    setDisplayValue(formatValue(newValue));

    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <TextField
      {...textFieldProps}
      type="text"
      value={displayValue}
      onChange={handleInputChange}
      onBlur={handleBlur}
      InputProps={{
        ...textFieldProps.InputProps,
        startAdornment: showButtons ? (
          <InputAdornment position="start">
            <IconButton
              size="small"
              onClick={handleDecrement}
              disabled={min !== undefined && localValue <= min}
              edge="start"
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : undefined,
        endAdornment: (
          <>
            {showButtons && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleIncrement}
                  disabled={max !== undefined && localValue >= max}
                  edge="end"
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            )}
            {unit && !showButtons && (
              <InputAdornment position="end">{unit}</InputAdornment>
            )}
          </>
        ),
      }}
    />
  );
}

/**
 * Currency input with formatting
 */
export interface CurrencyInputProps extends Omit<NumberInputProps, 'formatNumber' | 'parseNumber'> {
  /**
   * Currency symbol (default: $)
   */
  currencySymbol?: string;
  /**
   * Show thousands separator
   */
  showThousandsSeparator?: boolean;
}

export function CurrencyInput({
  currencySymbol = '$',
  showThousandsSeparator = true,
  decimals = 2,
  ...props
}: CurrencyInputProps) {
  const formatCurrency = (value: number): string => {
    const formatted = value.toFixed(decimals);
    if (showThousandsSeparator) {
      const parts = formatted.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return parts.join('.');
    }
    return formatted;
  };

  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/,/g, ''));
  };

  return (
    <NumberInput
      {...props}
      decimals={decimals}
      formatNumber={formatCurrency}
      parseNumber={parseCurrency}
      InputProps={{
        ...props.InputProps,
        startAdornment: (
          <InputAdornment position="start">
            <Typography variant="body2" color="text.secondary">
              {currencySymbol}
            </Typography>
          </InputAdornment>
        ),
      }}
    />
  );
}

/**
 * Percentage input
 */
export function PercentageInput(props: Omit<NumberInputProps, 'unit' | 'min' | 'max'>) {
  return <NumberInput {...props} unit="%" min={0} max={100} decimals={0} />;
}

/**
 * Temperature input
 */
export interface TemperatureInputProps extends Omit<NumberInputProps, 'unit'> {
  /**
   * Temperature unit (C or F)
   */
  temperatureUnit?: '°C' | '°F';
}

export function TemperatureInput({ temperatureUnit = '°C', ...props }: TemperatureInputProps) {
  return <NumberInput {...props} unit={temperatureUnit} decimals={1} step={0.5} />;
}

/**
 * Compact number input (vertical buttons)
 */
export interface CompactNumberInputProps extends Omit<NumberInputProps, 'showButtons'> {}

export function CompactNumberInput({ value = 0, onChange, min, max, step = 1, ...props }: CompactNumberInputProps) {
  const handleIncrement = () => {
    let newValue = value + step;
    if (max !== undefined) newValue = Math.min(newValue, max);
    if (onChange) onChange(newValue);
  };

  const handleDecrement = () => {
    let newValue = value - step;
    if (min !== undefined) newValue = Math.max(newValue, min);
    if (onChange) onChange(newValue);
  };

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <TextField
        {...props}
        type="number"
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value) || 0)}
        inputProps={{ min, max, step }}
        size="small"
        sx={{ width: 80, ...props.sx }}
      />
      <Stack>
        <IconButton
          size="small"
          onClick={handleIncrement}
          disabled={max !== undefined && value >= max}
          sx={{ padding: '2px', height: '20px' }}
        >
          <AddIcon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          size="small"
          onClick={handleDecrement}
          disabled={min !== undefined && value <= min}
          sx={{ padding: '2px', height: '20px' }}
        >
          <RemoveIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Stack>
    </Stack>
  );
}
