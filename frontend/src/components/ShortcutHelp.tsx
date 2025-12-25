import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
} from '@mui/material';
import {
  Keyboard as KeyboardIcon,
  Navigation as NavigationIcon,
  TouchApp as ActionIcon,
  Help as HelpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useKeyboardShortcutsHelp } from '../hooks/useKeyboardShortcuts';

const CATEGORY_ICONS: Record<string, React.ReactElement> = {
  Navigation: <NavigationIcon fontSize="small" />,
  Actions: <ActionIcon fontSize="small" />,
  'Quick Add': <AddIcon fontSize="small" />,
  Help: <HelpIcon fontSize="small" />,
};

export function ShortcutHelp() {
  const { helpVisible, hideHelp, shortcuts } = useKeyboardShortcutsHelp();

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, typeof shortcuts>);

  const formatKey = (shortcut: typeof shortcuts[0]) => {
    const keys: string[] = [];
    if (shortcut.ctrl) keys.push('Ctrl');
    if (shortcut.shift) keys.push('Shift');
    if (shortcut.alt) keys.push('Alt');
    if (shortcut.meta) keys.push('Cmd');
    keys.push(shortcut.key === ' ' ? 'Space' : shortcut.key.toUpperCase());
    return keys;
  };

  return (
    <Dialog
      open={helpVisible}
      onClose={hideHelp}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <KeyboardIcon />
        <Typography variant="h6">Keyboard Shortcuts</Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Use these keyboard shortcuts to navigate and perform actions quickly.
          </Typography>
        </Box>

        {Object.entries(groupedShortcuts).map(([category, categoryShortcuts], index) => (
          <Box key={category} sx={{ mb: 3 }}>
            {index > 0 && <Divider sx={{ mb: 2 }} />}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {CATEGORY_ICONS[category] || <KeyboardIcon fontSize="small" />}
              <Typography variant="subtitle1" fontWeight="bold">
                {category}
              </Typography>
            </Box>

            <Grid container spacing={1}>
              {categoryShortcuts.map((shortcut, idx) => (
                <Grid item xs={12} key={idx}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: shortcut.enabled === false ? 0.5 : 1,
                    }}
                  >
                    <Typography variant="body2">{shortcut.description}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {formatKey(shortcut).map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <Chip
                            label={key}
                            size="small"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              height: 24,
                              bgcolor: 'action.selected',
                            }}
                          />
                          {keyIdx < formatKey(shortcut).length - 1 && (
                            <Typography
                              variant="body2"
                              sx={{ mx: 0.5, alignSelf: 'center' }}
                            >
                              +
                            </Typography>
                          )}
                        </React.Fragment>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Tip:</strong> Press <Chip label="?" size="small" sx={{ mx: 0.5, height: 18, fontSize: '0.7rem' }} /> to
            open this help dialog anytime. Press <Chip label="Esc" size="small" sx={{ mx: 0.5, height: 18, fontSize: '0.7rem' }} /> to
            close modals and dialogs.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={hideHelp} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
