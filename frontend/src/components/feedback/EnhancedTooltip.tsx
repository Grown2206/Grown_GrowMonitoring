import React from 'react';
import { Tooltip, TooltipProps, styled, tooltipClasses, Box, Typography } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

export interface EnhancedTooltipProps extends Omit<TooltipProps, 'title'> {
  title: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'rich' | 'info';
  maxWidth?: number;
}

/**
 * Styled tooltip with custom styling
 */
const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    boxShadow: theme.shadows[3],
    fontSize: 13,
    maxWidth: 300,
    padding: theme.spacing(1.5),
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.grey[900],
  },
}));

/**
 * Rich tooltip with title and subtitle
 */
const RichTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: theme.shadows[4],
    fontSize: 13,
    maxWidth: 350,
    padding: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
    '&::before': {
      border: `1px solid ${theme.palette.divider}`,
    },
  },
}));

/**
 * Enhanced tooltip with multiple variants and customization
 */
export function EnhancedTooltip({
  title,
  subtitle,
  icon,
  variant = 'default',
  maxWidth = 300,
  children,
  ...props
}: EnhancedTooltipProps) {
  if (variant === 'rich') {
    const richContent = (
      <Box>
        {icon && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: subtitle ? 1 : 0 }}>
            {icon}
            <Typography variant="subtitle2" fontWeight="bold">
              {title}
            </Typography>
          </Box>
        )}
        {!icon && (
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: subtitle ? 0.5 : 0 }}>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    );

    return (
      <RichTooltip title={richContent} arrow placement="top" {...props}>
        {children}
      </RichTooltip>
    );
  }

  if (variant === 'info') {
    const infoContent = (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <InfoIcon sx={{ fontSize: 18, mt: 0.25 }} />
        <Box>
          <Typography variant="body2" fontWeight="bold" sx={{ mb: subtitle ? 0.5 : 0 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    );

    return (
      <StyledTooltip title={infoContent} arrow placement="top" {...props}>
        {children}
      </StyledTooltip>
    );
  }

  // Default variant
  return (
    <StyledTooltip title={title} arrow placement="top" {...props}>
      {children}
    </StyledTooltip>
  );
}

/**
 * Help tooltip with info icon
 */
export interface HelpTooltipProps {
  title: string;
  subtitle?: string;
  placement?: TooltipProps['placement'];
}

export function HelpTooltip({ title, subtitle, placement = 'top' }: HelpTooltipProps) {
  return (
    <EnhancedTooltip title={title} subtitle={subtitle} variant="info" placement={placement}>
      <InfoIcon
        sx={{
          fontSize: 18,
          color: 'text.secondary',
          cursor: 'help',
          '&:hover': {
            color: 'primary.main',
          },
        }}
      />
    </EnhancedTooltip>
  );
}

/**
 * Truncated text with tooltip on hover
 */
export interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  variant?: 'body1' | 'body2' | 'caption';
}

export function TruncatedText({ text, maxLength = 50, variant = 'body2' }: TruncatedTextProps) {
  const isTruncated = text.length > maxLength;
  const displayText = isTruncated ? `${text.slice(0, maxLength)}...` : text;

  if (!isTruncated) {
    return <Typography variant={variant}>{text}</Typography>;
  }

  return (
    <EnhancedTooltip title={text}>
      <Typography variant={variant} sx={{ cursor: 'help' }}>
        {displayText}
      </Typography>
    </EnhancedTooltip>
  );
}
