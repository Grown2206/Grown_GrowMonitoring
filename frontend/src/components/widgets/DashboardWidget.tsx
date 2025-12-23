import React from 'react';
import { Card, CardContent, CardHeader, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export interface WidgetProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onRemove?: () => void;
  actions?: React.ReactNode;
}

export function DashboardWidget({ id, title, children, onRemove, actions }: WidgetProps) {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <CardHeader
        title={title}
        titleTypographyProps={{ variant: 'h6', fontSize: '1rem' }}
        avatar={
          <DragIndicatorIcon
            sx={{ cursor: 'grab', color: 'text.secondary' }}
            className="drag-handle"
          />
        }
        action={
          <Box>
            {actions}
            {onRemove && (
              <IconButton
                size="small"
                onClick={onRemove}
                aria-label="remove widget"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ flexGrow: 1, overflow: 'auto', pt: 0 }}>
        {children}
      </CardContent>
    </Card>
  );
}
