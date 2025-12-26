import React, { useState, useEffect } from 'react';
import {
  Box,
  Slider,
  SliderProps,
  TextField,
  Typography,
  Stack,
  InputAdornment,
} from '@mui/material';

export interface RangeSliderProps extends Omit<SliderProps, 'onChange' | 'value'> {
  /**
   * Current range value [min, max]
   */
  value?: [number, number];
  /**
   * Change handler
   */
  onChange?: (value: [number, number]) => void;
  /**
   * Minimum value
   */
  min?: number;
  /**
   * Maximum value
   */
  max?: number;
  /**
   * Step increment
   */
  step?: number;
  /**
   * Show value labels above slider
   */
  showLabels?: boolean;
  /**
   * Show input fields for manual entry
   */
  showInputs?: boolean;
  /**
   * Label for the range
   */
  label?: string;
  /**
   * Unit to display (e.g., "°C", "kg", "%")
   */
  unit?: string;
  /**
   * Format value for display
   */
  formatValue?: (value: number) => string;
}

/**
 * Range slider for selecting min and max values
 */
export function RangeSlider({
  value = [0, 100],
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showLabels = true,
  showInputs = true,
  label,
  unit,
  formatValue,
  ...sliderProps
}: RangeSliderProps) {
  const [localValue, setLocalValue] = useState<[number, number]>(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const rangeValue = newValue as [number, number];
    setLocalValue(rangeValue);
    if (onChange) {
      onChange(rangeValue);
    }
  };

  const handleMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(event.target.value);
    const newValue: [number, number] = [newMin, localValue[1]];
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(event.target.value);
    const newValue: [number, number] = [localValue[0], newMax];
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const formatDisplayValue = (val: number): string => {
    if (formatValue) {
      return formatValue(val);
    }
    return unit ? `${val}${unit}` : String(val);
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
      )}

      <Box sx={{ px: showLabels ? 1 : 0 }}>
        {showLabels && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {formatDisplayValue(localValue[0])}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDisplayValue(localValue[1])}
            </Typography>
          </Box>
        )}

        <Slider
          value={localValue}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={step}
          valueLabelDisplay="auto"
          valueLabelFormat={formatDisplayValue}
          {...sliderProps}
        />
      </Box>

      {showInputs && (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Min"
            type="number"
            value={localValue[0]}
            onChange={handleMinChange}
            inputProps={{ min, max: localValue[1], step }}
            size="small"
            fullWidth
            InputProps={{
              endAdornment: unit ? <InputAdornment position="end">{unit}</InputAdornment> : undefined,
            }}
          />
          <TextField
            label="Max"
            type="number"
            value={localValue[1]}
            onChange={handleMaxChange}
            inputProps={{ min: localValue[0], max, step }}
            size="small"
            fullWidth
            InputProps={{
              endAdornment: unit ? <InputAdornment position="end">{unit}</InputAdornment> : undefined,
            }}
          />
        </Stack>
      )}
    </Box>
  );
}

/**
 * Single value slider with input field
 */
export interface ValueSliderProps extends Omit<SliderProps, 'onChange' | 'value'> {
  value?: number;
  onChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  showInput?: boolean;
  formatValue?: (value: number) => string;
}

export function ValueSlider({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  unit,
  showInput = true,
  formatValue,
  ...sliderProps
}: ValueSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    const numValue = newValue as number;
    setLocalValue(numValue);
    if (onChange) {
      onChange(numValue);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const formatDisplayValue = (val: number): string => {
    if (formatValue) {
      return formatValue(val);
    }
    return unit ? `${val}${unit}` : String(val);
  };

  return (
    <Box>
      {label && (
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
      )}

      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ flex: 1 }}>
          <Slider
            value={localValue}
            onChange={handleSliderChange}
            min={min}
            max={max}
            step={step}
            valueLabelDisplay="auto"
            valueLabelFormat={formatDisplayValue}
            {...sliderProps}
          />
        </Box>

        {showInput && (
          <TextField
            type="number"
            value={localValue}
            onChange={handleInputChange}
            inputProps={{ min, max, step }}
            size="small"
            sx={{ width: 100 }}
            InputProps={{
              endAdornment: unit ? <InputAdornment position="end">{unit}</InputAdornment> : undefined,
            }}
          />
        )}
      </Stack>
    </Box>
  );
}

/**
 * Predefined slider configurations
 */
export const SliderPresets = {
  temperature: {
    min: -10,
    max: 50,
    step: 0.5,
    unit: '°C',
  },
  humidity: {
    min: 0,
    max: 100,
    step: 1,
    unit: '%',
  },
  percentage: {
    min: 0,
    max: 100,
    step: 1,
    unit: '%',
  },
  rating: {
    min: 1,
    max: 5,
    step: 0.5,
    marks: [
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' },
      { value: 5, label: '5' },
    ],
  },
};

/**
 * Temperature range slider
 */
export function TemperatureRangeSlider(props: Omit<RangeSliderProps, 'min' | 'max' | 'step' | 'unit'>) {
  return <RangeSlider {...SliderPresets.temperature} {...props} />;
}

/**
 * Humidity range slider
 */
export function HumidityRangeSlider(props: Omit<RangeSliderProps, 'min' | 'max' | 'step' | 'unit'>) {
  return <RangeSlider {...SliderPresets.humidity} {...props} />;
}

/**
 * Percentage slider
 */
export function PercentageSlider(props: Omit<ValueSliderProps, 'min' | 'max' | 'step' | 'unit'>) {
  return <ValueSlider {...SliderPresets.percentage} {...props} />;
}
