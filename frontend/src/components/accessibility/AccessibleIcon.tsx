import React from 'react';

/**
 * Icon button with accessible label
 */
export interface AccessibleIconButtonProps {
  icon: React.ReactElement;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function AccessibleIconButton({
  icon,
  label,
  onClick,
  disabled,
}: AccessibleIconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      type="button"
      style={{
        background: 'none',
        border: 'none',
        padding: 8,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {React.cloneElement(icon, { 'aria-hidden': true })}
    </button>
  );
}
