import React, { useEffect } from 'react';
import {
  IconButton,
  Tooltip,
  ButtonGroup,
  Box,
  Typography,
  Menu,
  MenuItem,
  Divider,
  ListItemText,
} from '@mui/material';
import {
  Undo as UndoIcon,
  Redo as RedoIcon,
  History as HistoryIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';
import { useUndoRedoShortcuts } from '../hooks/useUndoRedo';

interface UndoRedoButtonsProps {
  onUndo: () => void;
  onRedo: () => void;
  onReset?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historySize?: number;
  showHistory?: boolean;
  enableShortcuts?: boolean;
  size?: 'small' | 'medium' | 'large';
  orientation?: 'horizontal' | 'vertical';
}

export function UndoRedoButtons({
  onUndo,
  onRedo,
  onReset,
  canUndo,
  canRedo,
  historySize = 0,
  showHistory = false,
  enableShortcuts = true,
  size = 'medium',
  orientation = 'horizontal',
}: UndoRedoButtonsProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { handleKeyDown } = useUndoRedoShortcuts(onUndo, onRedo);

  useEffect(() => {
    if (enableShortcuts) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [enableShortcuts, handleKeyDown]);

  const handleHistoryClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHistoryClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <ButtonGroup
        orientation={orientation}
        variant="outlined"
        size={size}
      >
        <Tooltip title="Undo (Ctrl+Z)">
          <span>
            <IconButton
              onClick={onUndo}
              disabled={!canUndo}
              size={size}
            >
              <UndoIcon fontSize={size} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo (Ctrl+Shift+Z)">
          <span>
            <IconButton
              onClick={onRedo}
              disabled={!canRedo}
              size={size}
            >
              <RedoIcon fontSize={size} />
            </IconButton>
          </span>
        </Tooltip>

        {showHistory && (
          <Tooltip title="History">
            <IconButton onClick={handleHistoryClick} size={size}>
              <HistoryIcon fontSize={size} />
            </IconButton>
          </Tooltip>
        )}

        {onReset && (
          <Tooltip title="Reset">
            <IconButton onClick={onReset} size={size}>
              <ResetIcon fontSize={size} />
            </IconButton>
          </Tooltip>
        )}
      </ButtonGroup>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleHistoryClose}
      >
        <MenuItem disabled>
          <ListItemText
            primary="History"
            secondary={`${historySize} state(s)`}
          />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { onUndo(); handleHistoryClose(); }} disabled={!canUndo}>
          <UndoIcon sx={{ mr: 2 }} fontSize="small" />
          Undo
        </MenuItem>
        <MenuItem onClick={() => { onRedo(); handleHistoryClose(); }} disabled={!canRedo}>
          <RedoIcon sx={{ mr: 2 }} fontSize="small" />
          Redo
        </MenuItem>
        {onReset && (
          <>
            <Divider />
            <MenuItem onClick={() => { onReset(); handleHistoryClose(); }}>
              <ResetIcon sx={{ mr: 2 }} fontSize="small" />
              Reset
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
}

interface UndoRedoIndicatorProps {
  canUndo: boolean;
  canRedo: boolean;
  historySize: number;
  compact?: boolean;
}

export function UndoRedoIndicator({
  canUndo,
  canRedo,
  historySize,
  compact = false,
}: UndoRedoIndicatorProps) {
  if (!canUndo && !canRedo) {
    return null;
  }

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <HistoryIcon fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary">
          {historySize}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        borderRadius: 1,
        bgcolor: 'action.hover',
      }}
    >
      <HistoryIcon fontSize="small" color="action" />
      <Typography variant="caption" color="text.secondary">
        {canUndo && 'Undo available'}
        {canUndo && canRedo && ' • '}
        {canRedo && 'Redo available'}
        {' '}({historySize} state{historySize !== 1 ? 's' : ''})
      </Typography>
    </Box>
  );
}

interface SimpleUndoRedoProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function SimpleUndoRedo({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: SimpleUndoRedoProps) {
  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      <Tooltip title="Undo">
        <span>
          <IconButton onClick={onUndo} disabled={!canUndo} size="small">
            <UndoIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Redo">
        <span>
          <IconButton onClick={onRedo} disabled={!canRedo} size="small">
            <RedoIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
}
