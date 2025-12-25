import React from 'react';
import { Box, Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { PaginationMeta } from '../types';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export function Pagination({ pagination, onPageChange, onLimitChange }: PaginationProps) {
  const { page, limit, totalPages, hasNext, hasPrev, total } = pagination;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mt={2}
      p={2}
      sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)' }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="body2" color="text.secondary">
          {total > 0 ? `${startItem}-${endItem} von ${total}` : 'Keine Einträge'}
        </Typography>

        {onLimitChange && (
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Pro Seite</InputLabel>
            <Select
              value={limit}
              label="Pro Seite"
              onChange={(e) => onLimitChange(Number(e.target.value))}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={20}>20</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        <Button
          size="small"
          variant="outlined"
          disabled={!hasPrev}
          onClick={() => onPageChange(page - 1)}
          startIcon={<NavigateBeforeIcon />}
        >
          Zurück
        </Button>

        <Typography variant="body2" sx={{ mx: 2 }}>
          Seite {page} von {totalPages || 1}
        </Typography>

        <Button
          size="small"
          variant="outlined"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          endIcon={<NavigateNextIcon />}
        >
          Weiter
        </Button>
      </Box>
    </Box>
  );
}
