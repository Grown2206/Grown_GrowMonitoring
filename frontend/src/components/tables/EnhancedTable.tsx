import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Paper,
  Toolbar,
  Typography,
  IconButton,
  Tooltip,
  Box,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { useTable, SortDirection } from '../../hooks/useTable';

export interface Column<T> {
  /**
   * Unique identifier for the column
   */
  id: keyof T;
  /**
   * Display label for the column header
   */
  label: string;
  /**
   * Minimum width of the column
   */
  minWidth?: number;
  /**
   * Alignment of the column content
   */
  align?: 'left' | 'right' | 'center';
  /**
   * Format the cell value for display
   */
  format?: (value: any) => React.ReactNode;
  /**
   * Enable sorting for this column
   */
  sortable?: boolean;
  /**
   * Enable filtering for this column
   */
  filterable?: boolean;
}

export interface EnhancedTableProps<T> {
  /**
   * Table data
   */
  data: T[];
  /**
   * Column definitions
   */
  columns: Column<T>[];
  /**
   * Title for the table
   */
  title?: string;
  /**
   * Enable row selection
   */
  selectable?: boolean;
  /**
   * Enable pagination
   */
  pagination?: boolean;
  /**
   * Initial rows per page
   */
  initialRowsPerPage?: number;
  /**
   * Rows per page options
   */
  rowsPerPageOptions?: number[];
  /**
   * Enable search/filtering
   */
  searchable?: boolean;
  /**
   * Search placeholder text
   */
  searchPlaceholder?: string;
  /**
   * Dense padding
   */
  dense?: boolean;
  /**
   * Enable export functionality
   */
  exportable?: boolean;
  /**
   * Callback when rows are selected
   */
  onSelectionChange?: (selectedIndices: number[]) => void;
  /**
   * Callback for delete action
   */
  onDelete?: (selectedIndices: number[]) => void;
  /**
   * Callback for export action
   */
  onExport?: () => void;
}

/**
 * Enhanced table component with sorting, filtering, pagination, and selection
 */
export function EnhancedTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  selectable = false,
  pagination = true,
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  searchable = false,
  searchPlaceholder = 'Search...',
  dense = false,
  exportable = false,
  onSelectionChange,
  onDelete,
  onExport,
}: EnhancedTableProps<T>) {
  const {
    paginatedData,
    sortConfig,
    pagination: paginationState,
    selectedRows,
    handleSort,
    handleChangePage,
    handleChangeRowsPerPage,
    handleSelectRow,
    handleSelectAll,
    handleDeselectAll,
    isRowSelected,
  } = useTable({
    initialData: data,
    initialRowsPerPage,
  });

  // Handle selection change callback
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Array.from(selectedRows));
    }
  }, [selectedRows, onSelectionChange]);

  const numSelected = selectedRows.size;
  const rowCount = data.length;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      handleSelectAll();
    } else {
      handleDeselectAll();
    }
  };

  const getSortDirection = (columnId: keyof T): SortDirection => {
    return sortConfig?.key === columnId ? sortConfig.direction : null;
  };

  return (
    <Paper sx={{ width: '100%', mb: 2 }}>
      {/* Toolbar */}
      {(title || selectable || searchable || exportable) && (
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            ...(numSelected > 0 && {
              bgcolor: (theme) =>
                theme.palette.mode === 'light'
                  ? theme.palette.primary.light
                  : theme.palette.primary.dark,
            }),
          }}
        >
          {numSelected > 0 ? (
            <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
              {numSelected} selected
            </Typography>
          ) : (
            <Typography sx={{ flex: '1 1 100%' }} variant="h6" component="div">
              {title}
            </Typography>
          )}

          {searchable && numSelected === 0 && (
            <TextField
              placeholder={searchPlaceholder}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2 }}
            />
          )}

          {numSelected > 0 ? (
            onDelete && (
              <Tooltip title="Delete">
                <IconButton onClick={() => onDelete(Array.from(selectedRows))}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )
          ) : (
            <>
              {exportable && onExport && (
                <Tooltip title="Export">
                  <IconButton onClick={onExport}>
                    <ExportIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Filter">
                <IconButton>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Toolbar>
      )}

      {/* Table */}
      <TableContainer>
        <Table size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortConfig?.key === column.id}
                      direction={getSortDirection(column.id) || 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => {
              const isItemSelected = isRowSelected(index);

              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={index}
                  selected={isItemSelected}
                  onClick={() => selectable && handleSelectRow(index)}
                  sx={{ cursor: selectable ? 'pointer' : 'default' }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox color="primary" checked={isItemSelected} />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={String(column.id)} align={column.align || 'left'}>
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {pagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={data.length}
          rowsPerPage={paginationState.rowsPerPage}
          page={paginationState.page}
          onPageChange={(_, page) => handleChangePage(page)}
          onRowsPerPageChange={(e) => handleChangeRowsPerPage(Number(e.target.value))}
        />
      )}
    </Paper>
  );
}

/**
 * Simple table without advanced features
 */
export interface SimpleTableProps<T> {
  data: T[];
  columns: Column<T>[];
  dense?: boolean;
}

export function SimpleTable<T extends Record<string, any>>({ data, columns, dense = false }: SimpleTableProps<T>) {
  return (
    <TableContainer component={Paper}>
      <Table size={dense ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={String(column.id)} align={column.align || 'left'} style={{ minWidth: column.minWidth }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} hover>
              {columns.map((column) => {
                const value = row[column.id];
                return (
                  <TableCell key={String(column.id)} align={column.align || 'left'}>
                    {column.format ? column.format(value) : value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
