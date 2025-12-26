import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Paper,
  Stack,
  Typography,
  Link,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Help as HelpIcon,
  Info as InfoIcon,
  Lightbulb as TipIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  VideoLibrary as VideoIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';

export interface ContextualHelpProps {
  title?: string;
  content: string;
  type?: 'info' | 'tip' | 'warning' | 'error';
  learnMoreUrl?: string;
  videoUrl?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'inline' | 'tooltip';
}

/**
 * Contextual help component that can be placed next to UI elements
 */
export function ContextualHelp({
  title,
  content,
  type = 'info',
  learnMoreUrl,
  videoUrl,
  size = 'small',
  variant = 'icon',
}: ContextualHelpProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const getIcon = () => {
    switch (type) {
      case 'tip':
        return <TipIcon fontSize={size} />;
      case 'warning':
        return <WarningIcon fontSize={size} />;
      case 'error':
        return <ErrorIcon fontSize={size} />;
      default:
        return <InfoIcon fontSize={size} />;
    }
  };

  const getColor = () => {
    switch (type) {
      case 'tip':
        return 'primary';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  // Tooltip variant - simple tooltip on hover
  if (variant === 'tooltip') {
    return (
      <Tooltip title={content} arrow>
        <IconButton size={size} color={getColor()}>
          {getIcon()}
        </IconButton>
      </Tooltip>
    );
  }

  // Inline variant - shows content directly
  if (variant === 'inline') {
    return (
      <Paper
        sx={{
          p: 2,
          bgcolor: `${getColor()}.light`,
          color: `${getColor()}.contrastText`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          {getIcon()}
          <Box sx={{ flex: 1 }}>
            {title && (
              <Typography variant="subtitle2" gutterBottom>
                {title}
              </Typography>
            )}
            <Typography variant="body2">{content}</Typography>
            {(learnMoreUrl || videoUrl) && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {learnMoreUrl && (
                  <Link
                    href={learnMoreUrl}
                    target="_blank"
                    rel="noopener"
                    sx={{ color: 'inherit' }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <ArticleIcon fontSize="small" />
                      <Typography variant="caption">Learn More</Typography>
                    </Stack>
                  </Link>
                )}
                {videoUrl && (
                  <Link
                    href={videoUrl}
                    target="_blank"
                    rel="noopener"
                    sx={{ color: 'inherit' }}
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <VideoIcon fontSize="small" />
                      <Typography variant="caption">Watch Video</Typography>
                    </Stack>
                  </Link>
                )}
              </Stack>
            )}
          </Box>
        </Stack>
      </Paper>
    );
  }

  // Icon variant (default) - shows popover on click
  return (
    <>
      <IconButton size={size} onClick={handleClick} color={getColor()}>
        {getIcon()}
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: { maxWidth: 400 },
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            {/* Header */}
            {title && (
              <Stack direction="row" spacing={1} alignItems="center">
                {getIcon()}
                <Typography variant="subtitle1">{title}</Typography>
              </Stack>
            )}

            {/* Content */}
            <Typography variant="body2">{content}</Typography>

            {/* Links */}
            {(learnMoreUrl || videoUrl) && (
              <Stack direction="row" spacing={1}>
                {learnMoreUrl && (
                  <Chip
                    icon={<ArticleIcon />}
                    label="Learn More"
                    size="small"
                    component="a"
                    href={learnMoreUrl}
                    target="_blank"
                    clickable
                  />
                )}
                {videoUrl && (
                  <Chip
                    icon={<VideoIcon />}
                    label="Watch Video"
                    size="small"
                    component="a"
                    href={videoUrl}
                    target="_blank"
                    clickable
                  />
                )}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Popover>
    </>
  );
}

export interface HelpTooltipProps {
  children: React.ReactElement;
  title: string;
  description?: string;
  learnMoreUrl?: string;
}

/**
 * Wrapper component that adds contextual help to any element
 */
export function HelpTooltip({ children, title, description, learnMoreUrl }: HelpTooltipProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        component="span"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
      >
        {children}
        <HelpIcon
          fontSize="small"
          sx={{ color: 'action.active', cursor: 'help' }}
        />
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleMouseLeave}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { maxWidth: 300, pointerEvents: 'none' },
        }}
        disableRestoreFocus
        sx={{ pointerEvents: 'none' }}
      >
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2">{title}</Typography>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
            {learnMoreUrl && (
              <Link
                href={learnMoreUrl}
                target="_blank"
                rel="noopener"
                sx={{ pointerEvents: 'auto' }}
              >
                <Typography variant="caption">Learn more →</Typography>
              </Link>
            )}
          </Stack>
        </Paper>
      </Popover>
    </>
  );
}
