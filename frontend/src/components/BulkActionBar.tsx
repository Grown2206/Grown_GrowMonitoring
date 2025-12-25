import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Checkbox,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Collapse,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  GetApp as ExportIcon,
  MoreVert as MoreIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactElement;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  confirmMessage?: string;
}

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  someSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAction: (actionId: string) => void;
  actions?: BulkAction[];
  isExecuting?: boolean;
  error?: string | null;
  position?: 'top' | 'bottom';
}

const DEFAULT_ACTIONS: BulkAction[] = [
  { id: 'delete', label: 'Delete', icon: <DeleteIcon />, color: 'error' },
  { id: 'edit', label: 'Edit', icon: <EditIcon />, color: 'primary' },
  { id: 'export', label: 'Export', icon: <ExportIcon />, color: 'primary' },
];

export function BulkActionBar({
  selectedCount,
  totalCount,
  allSelected,
  someSelected,
  onSelectAll,
  onDeselectAll,
  onAction,
  actions = DEFAULT_ACTIONS,
  isExecuting = false,
  error = null,
  position = 'top',
}: BulkActionBarProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [confirmAction, setConfirmAction] = React.useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: BulkAction) => {
    handleMenuClose();

    if (action.confirmMessage) {
      setConfirmAction(action.id);
    } else {
      onAction(action.id);
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction) {
      onAction(confirmAction);
      setConfirmAction(null);
    }
  };

  const handleCancelAction = () => {
    setConfirmAction(null);
  };

  const primaryActions = actions.slice(0, 3);
  const moreActions = actions.slice(3);

  return (
    <Collapse in={selectedCount > 0}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: position === 'top' ? 2 : 0,
          mt: position === 'bottom' ? 2 : 0,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
        }}
      >
        <Checkbox
          checked={allSelected}
          indeterminate={someSelected}
          onChange={allSelected ? onDeselectAll : onSelectAll}
          sx={{ color: 'inherit', '&.Mui-checked': { color: 'inherit' } }}
        />

        <Typography variant="body1" sx={{ flexGrow: 1 }}>
          {selectedCount} of {totalCount} selected
        </Typography>

        {isExecuting ? (
          <CircularProgress size={24} sx={{ color: 'inherit' }} />
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {primaryActions.map((action) => (
              <Button
                key={action.id}
                variant="contained"
                color={action.color || 'primary'}
                size="small"
                startIcon={action.icon}
                onClick={() => handleActionClick(action)}
                disabled={isExecuting}
              >
                {action.label}
              </Button>
            ))}

            {moreActions.length > 0 && (
              <>
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{ color: 'inherit' }}
                >
                  <MoreIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {moreActions.map((action) => (
                    <MenuItem
                      key={action.id}
                      onClick={() => handleActionClick(action)}
                    >
                      {action.icon && (
                        <Box sx={{ mr: 2, display: 'flex' }}>{action.icon}</Box>
                      )}
                      {action.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}

            <IconButton
              size="small"
              onClick={onDeselectAll}
              sx={{ color: 'inherit' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={handleCancelAction}>
          {error}
        </Alert>
      )}

      {confirmAction && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Box>
              <Button color="inherit" size="small" onClick={handleCancelAction}>
                Cancel
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={handleConfirmAction}
                sx={{ ml: 1 }}
              >
                Confirm
              </Button>
            </Box>
          }
        >
          {actions.find((a) => a.id === confirmAction)?.confirmMessage ||
            `Are you sure you want to perform this action on ${selectedCount} item(s)?`}
        </Alert>
      )}
    </Collapse>
  );
}

interface SelectAllBarProps {
  selectedCount: number;
  totalCount: number;
  pageCount: number;
  onSelectAll: () => void;
  onSelectPage: () => void;
}

export function SelectAllBar({
  selectedCount,
  totalCount,
  pageCount,
  onSelectAll,
  onSelectPage,
}: SelectAllBarProps) {
  if (selectedCount === 0 || selectedCount === totalCount) {
    return null;
  }

  if (selectedCount === pageCount) {
    return (
      <Alert
        severity="info"
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={onSelectAll}>
            Select All {totalCount}
          </Button>
        }
      >
        {pageCount} items on this page are selected.
      </Alert>
    );
  }

  return null;
}
