import React, { useState, useEffect, ChangeEvent } from 'react';
import { TextField, TextFieldProps } from '@mui/material';

export interface InputMaskProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  /**
   * Mask pattern using:
   * - 9: digit (0-9)
   * - a: letter (a-z, A-Z)
   * - *: alphanumeric
   * - Other characters are treated as literals
   *
   * Examples:
   * - Phone: "(999) 999-9999"
   * - Date: "99/99/9999"
   * - SSN: "999-99-9999"
   * - Zip: "99999-9999"
   */
  mask: string;
  /**
   * Current value
   */
  value?: string;
  /**
   * Change handler that receives unmasked value
   */
  onChange?: (value: string) => void;
  /**
   * Placeholder character for unfilled positions
   */
  placeholder?: string;
  /**
   * Show mask pattern as placeholder
   */
  showMaskAsPlaceholder?: boolean;
}

/**
 * Input field with masking for formatted text entry
 */
export function InputMask({
  mask,
  value = '',
  onChange,
  placeholder = '_',
  showMaskAsPlaceholder = true,
  ...textFieldProps
}: InputMaskProps) {
  const [maskedValue, setMaskedValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Apply mask to value
  const applyMask = (rawValue: string): { masked: string; unmasked: string } => {
    let maskIndex = 0;
    let valueIndex = 0;
    let masked = '';
    const unmasked: string[] = [];

    while (maskIndex < mask.length && valueIndex < rawValue.length) {
      const maskChar = mask[maskIndex];
      const valueChar = rawValue[valueIndex];

      if (maskChar === '9') {
        // Digit
        if (/\d/.test(valueChar)) {
          masked += valueChar;
          unmasked.push(valueChar);
          maskIndex++;
          valueIndex++;
        } else {
          valueIndex++;
        }
      } else if (maskChar === 'a') {
        // Letter
        if (/[a-zA-Z]/.test(valueChar)) {
          masked += valueChar;
          unmasked.push(valueChar);
          maskIndex++;
          valueIndex++;
        } else {
          valueIndex++;
        }
      } else if (maskChar === '*') {
        // Alphanumeric
        if (/[a-zA-Z0-9]/.test(valueChar)) {
          masked += valueChar;
          unmasked.push(valueChar);
          maskIndex++;
          valueIndex++;
        } else {
          valueIndex++;
        }
      } else {
        // Literal character
        masked += maskChar;
        if (valueChar === maskChar) {
          valueIndex++;
        }
        maskIndex++;
      }
    }

    return { masked, unmasked: unmasked.join('') };
  };

  // Update masked value when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      const { masked } = applyMask(value);
      setMaskedValue(masked);
    }
  }, [value, mask]);

  // Restore cursor position
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      setCursorPosition(null);
    }
  }, [cursorPosition, maskedValue]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    const cursorPos = event.target.selectionStart || 0;

    const { masked, unmasked } = applyMask(inputValue);
    setMaskedValue(masked);
    setCursorPosition(cursorPos);

    if (onChange) {
      onChange(unmasked);
    }
  };

  // Generate placeholder from mask
  const generatePlaceholder = (): string => {
    if (!showMaskAsPlaceholder) {
      return '';
    }

    return mask.replace(/9/g, placeholder).replace(/a/g, placeholder).replace(/\*/g, placeholder);
  };

  return (
    <TextField
      {...textFieldProps}
      inputRef={inputRef}
      value={maskedValue}
      onChange={handleChange}
      placeholder={generatePlaceholder()}
    />
  );
}

/**
 * Predefined mask patterns for common use cases
 */
export const MaskPatterns = {
  phone: {
    us: '(999) 999-9999',
    international: '+99 999 999 9999',
  },
  date: {
    us: '99/99/9999',
    international: '99.99.9999',
  },
  time: {
    '24h': '99:99',
    '12h': '99:99 aa',
  },
  ssn: '999-99-9999',
  zip: {
    us: '99999',
    usExtended: '99999-9999',
  },
  creditCard: '9999 9999 9999 9999',
  cvv: '999',
  ipAddress: '999.999.999.999',
};

/**
 * Phone input with US format
 */
export function PhoneInput(
  props: Omit<InputMaskProps, 'mask'> & { variant?: 'us' | 'international' }
) {
  const { variant = 'us', ...rest } = props;
  return <InputMask mask={MaskPatterns.phone[variant]} {...rest} />;
}

/**
 * Date input with mask
 */
export function DateMaskInput(
  props: Omit<InputMaskProps, 'mask'> & { variant?: 'us' | 'international' }
) {
  const { variant = 'us', ...rest } = props;
  return <InputMask mask={MaskPatterns.date[variant]} {...rest} />;
}

/**
 * Time input with mask
 */
export function TimeInput(props: Omit<InputMaskProps, 'mask'> & { variant?: '24h' | '12h' }) {
  const { variant = '24h', ...rest } = props;
  return <InputMask mask={MaskPatterns.time[variant]} {...rest} />;
}

/**
 * Credit card input with mask
 */
export function CreditCardInput(props: Omit<InputMaskProps, 'mask'>) {
  return <InputMask mask={MaskPatterns.creditCard} {...props} />;
}
