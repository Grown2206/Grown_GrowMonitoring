import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Popover,
  TextField,
  TextFieldProps,
  Button,
  Stack,
  Typography,
  Paper,
  Grid,
} from '@mui/material';
import { Palette as PaletteIcon } from '@mui/icons-material';

export interface ColorPickerProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  /**
   * Current color value (hex format)
   */
  value?: string;
  /**
   * Change handler
   */
  onChange?: (color: string) => void;
  /**
   * Preset colors to display
   */
  presetColors?: string[];
  /**
   * Show alpha channel (transparency)
   */
  showAlpha?: boolean;
  /**
   * Default color if value is empty
   */
  defaultColor?: string;
}

/**
 * Color picker component with preset colors and custom input
 */
export function ColorPicker({
  value = '#000000',
  onChange,
  presetColors = DEFAULT_PRESET_COLORS,
  showAlpha = false,
  defaultColor = '#000000',
  ...textFieldProps
}: ColorPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentColor, setCurrentColor] = useState(value || defaultColor);
  const [textInput, setTextInput] = useState(value || defaultColor);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      setCurrentColor(value);
      setTextInput(value);
    }
  }, [value]);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
    setTextInput(color);
    if (onChange) {
      onChange(color);
    }
  };

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setTextInput(newValue);

    // Validate hex color
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue) || /^#[0-9A-Fa-f]{8}$/.test(newValue)) {
      setCurrentColor(newValue);
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  const handlePresetClick = (color: string) => {
    handleColorChange(color);
    handleClose();
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <TextField
        {...textFieldProps}
        value={textInput}
        onChange={handleTextInputChange}
        inputRef={inputRef}
        InputProps={{
          ...textFieldProps.InputProps,
          startAdornment: (
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: 1,
                bgcolor: currentColor,
                border: '1px solid',
                borderColor: 'divider',
                mr: 1,
                cursor: 'pointer',
              }}
              onClick={handleOpen}
            />
          ),
          endAdornment: (
            <Button
              size="small"
              onClick={handleOpen}
              startIcon={<PaletteIcon />}
              sx={{ minWidth: 'auto', textTransform: 'none' }}
            >
              Pick
            </Button>
          ),
        }}
        placeholder="#000000"
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, maxWidth: 300 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle2">Preset Colors</Typography>
            <Grid container spacing={1}>
              {presetColors.map((color) => (
                <Grid item key={color}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: color,
                      border: '2px solid',
                      borderColor: currentColor === color ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                      },
                    }}
                    onClick={() => handlePresetClick(color)}
                  />
                </Grid>
              ))}
            </Grid>

            <Typography variant="subtitle2">Custom Color</Typography>
            <TextField
              type="color"
              value={currentColor}
              onChange={(e) => handleColorChange(e.target.value)}
              fullWidth
              sx={{
                '& input': {
                  height: 40,
                  cursor: 'pointer',
                },
              }}
            />

            <TextField
              label="Hex Color"
              value={textInput}
              onChange={handleTextInputChange}
              fullWidth
              size="small"
              placeholder="#000000"
              helperText="Enter hex color (e.g., #FF5733)"
            />
          </Stack>
        </Paper>
      </Popover>
    </>
  );
}

/**
 * Default preset colors
 */
const DEFAULT_PRESET_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#808080', // Gray
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#008000', // Dark Green
  '#000080', // Navy
  '#FF6B6B', // Light Red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage
  '#FFEAA7', // Light Yellow
  '#DFE6E9', // Light Gray
  '#74B9FF', // Light Blue
];

/**
 * Simple color swatch selector without text input
 */
export interface ColorSwatchProps {
  value?: string;
  onChange?: (color: string) => void;
  colors?: string[];
  size?: 'small' | 'medium' | 'large';
}

export function ColorSwatch({ value, onChange, colors = DEFAULT_PRESET_COLORS, size = 'medium' }: ColorSwatchProps) {
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 40,
  };

  const boxSize = sizeMap[size];

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {colors.map((color) => (
        <Box
          key={color}
          sx={{
            width: boxSize,
            height: boxSize,
            borderRadius: 1,
            bgcolor: color,
            border: '2px solid',
            borderColor: value === color ? 'primary.main' : 'divider',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              transform: 'scale(1.1)',
            },
          }}
          onClick={() => onChange?.(color)}
        />
      ))}
    </Box>
  );
}

/**
 * Material Design color palette
 */
export const MaterialColors = {
  red: ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'],
  pink: ['#FCE4EC', '#F8BBD0', '#F48FB1', '#F06292', '#EC407A', '#E91E63', '#D81B60', '#C2185B', '#AD1457', '#880E4F'],
  purple: ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#7B1FA2', '#6A1B9A', '#4A148C'],
  blue: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'],
  green: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'],
  yellow: ['#FFFDE7', '#FFF9C4', '#FFF59D', '#FFF176', '#FFEE58', '#FFEB3B', '#FDD835', '#FBC02D', '#F9A825', '#F57F17'],
  orange: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00', '#EF6C00', '#E65100'],
  gray: ['#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121'],
};
