import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
} from '@mui/material';
import { useBulkActions } from '../hooks/useBulkActions';
import { BulkActionBar, BulkAction } from './BulkActionBar';

interface Column<T> {
  id: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  width?: string | number;
}

interface SelectableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getItemId: (item: T) => string | number;
  onBulkAction?: (action: string, items: T[]) => Promise<void>;
  bulkActions?: BulkAction[];
  showBulkBar?: boolean;
}

/**
 * Example selectable table component with bulk actions
 *
 * @example
 * <SelectableTable
 *   data={plants}
 *   columns={[
 *     { id: 'name', label: 'Name' },
 *     { id: 'phase', label: 'Phase' },
 *   ]}
 *   getItemId={(plant) => plant.id}
 *   onBulkAction={async (action, items) => {
 *     if (action === 'delete') {
 *       await deletePlants(items.map(p => p.id));
 *     }
 *   }}
 * />
 */
export function SelectableTable<T extends Record<string, any>>({
  data,
  columns,
  getItemId,
  onBulkAction,
  bulkActions,
  showBulkBar = true,
}: SelectableTableProps<T>) {
  const {
    selectedIds,
    selectedCount,
    allSelected,
    someSelected,
    toggleItem,
    toggleAll,
    isSelected,
    executeAction,
    isExecuting,
    error,
    deselectAll,
  } = useBulkActions({
    items: data,
    getItemId,
    onAction: onBulkAction,
  });

  const handleAction = async (actionId: string) => {
    await executeAction(actionId);
  };

  return (
    <div>
      {showBulkBar && (
        <BulkActionBar
          selectedCount={selectedCount}
          totalCount={data.length}
          allSelected={allSelected}
          someSelected={someSelected}
          onSelectAll={toggleAll}
          onDeselectAll={deselectAll}
          onAction={handleAction}
          actions={bulkActions}
          isExecuting={isExecuting}
          error={error}
        />
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onChange={toggleAll}
                />
              </TableCell>
              {columns.map((column) => (
                <TableCell
                  key={String(column.id)}
                  style={{ width: column.width }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => {
              const id = getItemId(item);
              const selected = isSelected(id);

              return (
                <TableRow
                  key={String(id)}
                  hover
                  selected={selected}
                  onClick={() => toggleItem(id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox checked={selected} />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={String(column.id)}>
                      {column.render
                        ? column.render(item)
                        : item[column.id as keyof T]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

/**
 * Selectable List Item Component
 */
interface SelectableListItemProps {
  selected: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function SelectableListItem({
  selected,
  onToggle,
  children,
}: SelectableListItemProps) {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 1,
        cursor: 'pointer',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
      onClick={onToggle}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Checkbox checked={selected} onChange={onToggle} onClick={(e) => e.stopPropagation()} />
        <div style={{ flexGrow: 1 }}>{children}</div>
      </div>
    </Paper>
  );
}
