import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import {
  Box,
  Chip,
  TextField,
  TextFieldProps,
  Stack,
  Autocomplete,
  AutocompleteProps,
} from '@mui/material';

export interface TagInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  /**
   * Current tags
   */
  value?: string[];
  /**
   * Change handler
   */
  onChange?: (tags: string[]) => void;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Maximum number of tags
   */
  maxTags?: number;
  /**
   * Separator characters for splitting tags (default: comma, semicolon, enter)
   */
  separators?: string[];
  /**
   * Validate tag before adding
   */
  validateTag?: (tag: string) => boolean;
  /**
   * Custom tag color
   */
  tagColor?: 'primary' | 'secondary' | 'default' | 'error' | 'info' | 'success' | 'warning';
  /**
   * Allow duplicates
   */
  allowDuplicates?: boolean;
  /**
   * Transform tag before adding (e.g., toLowerCase, trim)
   */
  transformTag?: (tag: string) => string;
}

/**
 * Tag input component for entering multiple values as chips
 */
export function TagInput({
  value = [],
  onChange,
  placeholder = 'Type and press Enter...',
  maxTags,
  separators = [',', ';'],
  validateTag,
  tagColor = 'primary',
  allowDuplicates = false,
  transformTag = (tag) => tag.trim(),
  ...textFieldProps
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    const lastChar = newValue[newValue.length - 1];

    // Check if separator was entered
    if (separators.includes(lastChar)) {
      const tag = transformTag(newValue.slice(0, -1));
      if (tag) {
        addTag(tag);
        setInputValue('');
      }
      return;
    }

    setInputValue(newValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && inputValue) {
      event.preventDefault();
      const tag = transformTag(inputValue);
      if (tag) {
        addTag(tag);
        setInputValue('');
      }
    } else if (event.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag when backspace is pressed with empty input
      removeTag(value.length - 1);
    }
  };

  const addTag = (tag: string) => {
    // Check if max tags reached
    if (maxTags && value.length >= maxTags) {
      return;
    }

    // Check for duplicates
    if (!allowDuplicates && value.includes(tag)) {
      return;
    }

    // Validate tag
    if (validateTag && !validateTag(tag)) {
      return;
    }

    const newTags = [...value, tag];
    if (onChange) {
      onChange(newTags);
    }
  };

  const removeTag = (index: number) => {
    const newTags = value.filter((_, i) => i !== index);
    if (onChange) {
      onChange(newTags);
    }
  };

  return (
    <Box>
      <TextField
        {...textFieldProps}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        InputProps={{
          ...textFieldProps.InputProps,
          startAdornment: (
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {value.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => removeTag(index)}
                  color={tagColor}
                  size="small"
                  sx={{ mb: 0.5 }}
                />
              ))}
            </Stack>
          ),
        }}
        helperText={
          maxTags
            ? `${value.length}/${maxTags} tags ${textFieldProps.helperText ? `• ${textFieldProps.helperText}` : ''}`
            : textFieldProps.helperText
        }
      />
    </Box>
  );
}

/**
 * Autocomplete tag input with suggestions
 */
export interface AutocompleteTagInputProps
  extends Omit<AutocompleteProps<string, true, false, true>, 'options' | 'renderInput'> {
  /**
   * Available options for autocomplete
   */
  options: string[];
  /**
   * Label for the input
   */
  label?: string;
  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Helper text
   */
  helperText?: string;
  /**
   * Maximum number of tags
   */
  maxTags?: number;
}

export function AutocompleteTagInput({
  options,
  label,
  placeholder = 'Type to search...',
  helperText,
  maxTags,
  ...autocompleteProps
}: AutocompleteTagInputProps) {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={options}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          helperText={
            maxTags && autocompleteProps.value
              ? `${autocompleteProps.value.length}/${maxTags} tags ${helperText ? `• ${helperText}` : ''}`
              : helperText
          }
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip {...getTagProps({ index })} key={index} label={option} size="small" />
        ))
      }
      {...autocompleteProps}
    />
  );
}

/**
 * Email tag input with validation
 */
export function EmailTagInput(props: Omit<TagInputProps, 'validateTag' | 'transformTag'>) {
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <TagInput
      {...props}
      validateTag={validateEmail}
      transformTag={(email) => email.trim().toLowerCase()}
      placeholder="Enter email addresses..."
      helperText={props.helperText || 'Separate emails with comma or Enter'}
    />
  );
}

/**
 * Hashtag input
 */
export function HashtagInput(props: Omit<TagInputProps, 'transformTag'>) {
  const transformHashtag = (tag: string): string => {
    let cleaned = tag.trim().replace(/\s+/g, '');
    if (!cleaned.startsWith('#')) {
      cleaned = '#' + cleaned;
    }
    return cleaned.toLowerCase();
  };

  return (
    <TagInput
      {...props}
      transformTag={transformHashtag}
      placeholder="Enter hashtags..."
      helperText={props.helperText || 'Type hashtags (# is optional)'}
    />
  );
}

/**
 * Keyword input (alphanumeric only)
 */
export function KeywordInput(props: Omit<TagInputProps, 'validateTag' | 'transformTag'>) {
  const validateKeyword = (keyword: string): boolean => {
    return /^[a-zA-Z0-9-_]+$/.test(keyword);
  };

  return (
    <TagInput
      {...props}
      validateTag={validateKeyword}
      transformTag={(keyword) => keyword.trim().toLowerCase()}
      placeholder="Enter keywords..."
      helperText={props.helperText || 'Only letters, numbers, hyphens, and underscores'}
    />
  );
}
