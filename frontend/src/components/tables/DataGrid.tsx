import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import {
  ViewColumn as ViewColumnIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { Column } from './EnhancedTable';

export interface DataGridProps<T> {
  /**
   * Table data
   */
  data: T[];
  /**
   * Column definitions
   */
  columns: Column<T>[];
  /**
   * Enable inline editing
   */
  editable?: boolean;
  /**
   * Enable column management
   */
  columnManagement?: boolean;
  /**
   * Callback when a row is edited
   */
  onRowEdit?: (index: number, updatedRow: T) => void;
  /**
   * Callback for row actions
   */
  onRowAction?: (action: string, index: number) => void;
  /**
   * Custom row actions
   */
  rowActions?: Array<{ label: string; icon?: React.ReactNode; onClick: (index: number) => void }>;
  /**
   * Enable row highlighting on hover
   */
  hover?: boolean;
  /**
   * Dense padding
   */
  dense?: boolean;
  /**
   * Sticky header
   */
  stickyHeader?: boolean;
  /**
   * Maximum height for the table (enables scrolling)
   */
  maxHeight?: number | string;
}

/**
 * Data grid with column management and inline editing
 */
export function DataGrid<T extends Record<string, any>>({
  data,
  columns,
  editable = false,
  columnManagement = false,
  onRowEdit,
  onRowAction,
  rowActions,
  hover = true,
  dense = false,
  stickyHeader = false,
  maxHeight,
}: DataGridProps<T>) {
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof T>>(
    new Set(columns.map((col) => col.id))
  );
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Partial<T>>({});
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [rowMenuAnchor, setRowMenuAnchor] = useState<null | HTMLElement>(null);
  const [activeRowIndex, setActiveRowIndex] = useState<number | null>(null);

  const filteredColumns = columns.filter((col) => visibleColumns.has(col.id));

  const handleToggleColumn = (columnId: keyof T) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(columnId)) {
        newSet.delete(columnId);
      } else {
        newSet.add(columnId);
      }
      return newSet;
    });
  };

  const handleStartEdit = (index: number, row: T) => {
    setEditingRow(index);
    setEditedData(row);
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const handleSaveEdit = (index: number) => {
    if (onRowEdit && editedData) {
      onRowEdit(index, editedData as T);
    }
    setEditingRow(null);
    setEditedData({});
  };

  const handleFieldChange = (columnId: keyof T, value: any) => {
    setEditedData((prev) => ({
      ...prev,
      [columnId]: value,
    }));
  };

  const handleOpenRowMenu = (event: React.MouseEvent<HTMLElement>, index: number) => {
    setRowMenuAnchor(event.currentTarget);
    setActiveRowIndex(index);
  };

  const handleCloseRowMenu = () => {
    setRowMenuAnchor(null);
    setActiveRowIndex(null);
  };

  const handleRowAction = (action: string) => {
    if (activeRowIndex !== null) {
      if (onRowAction) {
        onRowAction(action, activeRowIndex);
      }
      rowActions?.find((a) => a.label === action)?.onClick(activeRowIndex);
    }
    handleCloseRowMenu();
  };

  return (
    <Box>
      {/* Toolbar */}
      {columnManagement && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            startIcon={<ViewColumnIcon />}
            onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
            variant="outlined"
            size="small"
          >
            Columns
          </Button>
          <Menu
            anchorEl={columnMenuAnchor}
            open={Boolean(columnMenuAnchor)}
            onClose={() => setColumnMenuAnchor(null)}
          >
            <Box sx={{ p: 2, minWidth: 200 }}>
              <FormGroup>
                {columns.map((column) => (
                  <FormControlLabel
                    key={String(column.id)}
                    control={
                      <Checkbox
                        checked={visibleColumns.has(column.id)}
                        onChange={() => handleToggleColumn(column.id)}
                        size="small"
                      />
                    }
                    label={column.label}
                  />
                ))}
              </FormGroup>
            </Box>
          </Menu>
        </Box>
      )}

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {filteredColumns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
              {(editable || rowActions) && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => {
              const isEditing = editingRow === index;

              return (
                <TableRow key={index} hover={hover && !isEditing}>
                  {filteredColumns.map((column) => {
                    const value = isEditing ? editedData[column.id] : row[column.id];

                    return (
                      <TableCell key={String(column.id)} align={column.align || 'left'}>
                        {isEditing ? (
                          <TextField
                            value={value || ''}
                            onChange={(e) => handleFieldChange(column.id, e.target.value)}
                            size="small"
                            fullWidth
                          />
                        ) : column.format ? (
                          column.format(value)
                        ) : (
                          value
                        )}
                      </TableCell>
                    );
                  })}

                  {(editable || rowActions) && (
                    <TableCell align="right">
                      {isEditing ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton size="small" color="primary" onClick={() => handleSaveEdit(index)}>
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={handleCancelEdit}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {editable && (
                            <IconButton size="small" onClick={() => handleStartEdit(index, row)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                          {rowActions && rowActions.length > 0 && (
                            <>
                              <IconButton size="small" onClick={(e) => handleOpenRowMenu(e, index)}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Stack>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Row Actions Menu */}
      {rowActions && (
        <Menu anchorEl={rowMenuAnchor} open={Boolean(rowMenuAnchor)} onClose={handleCloseRowMenu}>
          {rowActions.map((action) => (
            <MenuItem key={action.label} onClick={() => handleRowAction(action.label)}>
              {action.icon && <Box sx={{ mr: 1, display: 'flex' }}>{action.icon}</Box>}
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </Box>
  );
}

/**
 * Render a status chip based on value
 */
export function StatusChip({ status }: { status: string }) {
  const getColor = (): 'success' | 'warning' | 'error' | 'default' => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'success':
        return 'success';
      case 'pending':
      case 'warning':
        return 'warning';
      case 'failed':
      case 'error':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return <Chip label={status} color={getColor()} size="small" />;
}

/**
 * Format date for table display
 */
export function formatTableDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

/**
 * Format number with thousands separator
 */
export function formatTableNumber(num: number, decimals = 0): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
