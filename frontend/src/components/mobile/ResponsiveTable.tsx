import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';

export interface TableColumn<T> {
  id: string;
  label: string;
  accessor: (row: T) => React.ReactNode;
  priority?: number; // 1 = always show, 2 = hide on mobile, 3 = hide on tablet
  align?: 'left' | 'center' | 'right';
}

export interface ResponsiveTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  mobileLayout?: 'card' | 'stacked';
  onRowClick?: (row: T) => void;
}

/**
 * Responsive table that adapts to mobile, tablet, and desktop
 */
export function ResponsiveTable<T>({
  columns,
  data,
  getRowKey,
  mobileLayout = 'card',
  onRowClick,
}: ResponsiveTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (rowKey: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowKey)) {
        newSet.delete(rowKey);
      } else {
        newSet.add(rowKey);
      }
      return newSet;
    });
  };

  const getVisibleColumns = () => {
    if (isMobile) {
      return columns.filter((col) => col.priority === 1);
    }
    if (isTablet) {
      return columns.filter((col) => col.priority !== 3);
    }
    return columns;
  };

  const getHiddenColumns = () => {
    if (isMobile) {
      return columns.filter((col) => col.priority !== 1);
    }
    if (isTablet) {
      return columns.filter((col) => col.priority === 3);
    }
    return [];
  };

  // Card Layout for Mobile
  if (isMobile && mobileLayout === 'card') {
    return (
      <Stack spacing={2}>
        {data.map((row) => {
          const rowKey = getRowKey(row);
          const isExpanded = expandedRows.has(rowKey);
          const visibleCols = getVisibleColumns();
          const hiddenCols = getHiddenColumns();

          return (
            <Card
              key={rowKey}
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              <CardContent>
                <Stack spacing={1}>
                  {visibleCols.map((col) => (
                    <Box key={col.id}>
                      <Typography variant="caption" color="text.secondary">
                        {col.label}
                      </Typography>
                      <Typography variant="body2">{col.accessor(row)}</Typography>
                    </Box>
                  ))}

                  {hiddenCols.length > 0 && (
                    <>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton size="small" onClick={(e) => {
                          e.stopPropagation();
                          toggleRow(rowKey);
                        }}>
                          {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                        </IconButton>
                      </Box>

                      <Collapse in={isExpanded}>
                        <Stack spacing={1} sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                          {hiddenCols.map((col) => (
                            <Box key={col.id}>
                              <Typography variant="caption" color="text.secondary">
                                {col.label}
                              </Typography>
                              <Typography variant="body2">{col.accessor(row)}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Collapse>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    );
  }

  // Table Layout for Desktop/Tablet
  const visibleColumns = getVisibleColumns();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {visibleColumns.map((col) => (
              <TableCell key={col.id} align={col.align || 'left'}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow
              key={getRowKey(row)}
              hover={!!onRowClick}
              onClick={() => onRowClick?.(row)}
              sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {visibleColumns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'}>
                  {col.accessor(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Example usage type-safe wrapper
export interface Plant {
  id: string;
  name: string;
  species: string;
  health: number;
  lastWatered: Date;
  location: string;
}

export function PlantTable({ plants }: { plants: Plant[] }) {
  const columns: TableColumn<Plant>[] = [
    {
      id: 'name',
      label: 'Name',
      accessor: (plant) => plant.name,
      priority: 1,
    },
    {
      id: 'species',
      label: 'Species',
      accessor: (plant) => plant.species,
      priority: 2,
    },
    {
      id: 'health',
      label: 'Health',
      accessor: (plant) => (
        <Chip
          label={`${plant.health}%`}
          color={plant.health > 80 ? 'success' : plant.health > 50 ? 'warning' : 'error'}
          size="small"
        />
      ),
      priority: 1,
    },
    {
      id: 'lastWatered',
      label: 'Last Watered',
      accessor: (plant) => plant.lastWatered.toLocaleDateString(),
      priority: 2,
    },
    {
      id: 'location',
      label: 'Location',
      accessor: (plant) => plant.location,
      priority: 3,
    },
  ];

  return (
    <ResponsiveTable
      columns={columns}
      data={plants}
      getRowKey={(plant) => plant.id}
    />
  );
}
