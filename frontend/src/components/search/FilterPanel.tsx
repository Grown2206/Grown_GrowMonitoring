import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
  Collapse,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from '@mui/icons-material';

export interface FilterOption {
  id: string;
  label: string;
  value: any;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'range' | 'date' | 'select';
  options?: FilterOption[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
}

export interface ActiveFilter {
  groupId: string;
  value: any;
}

export interface FilterPanelProps {
  filterGroups: FilterGroup[];
  activeFilters?: ActiveFilter[];
  onFiltersChange?: (filters: ActiveFilter[]) => void;
  onClear?: () => void;
  showActiveCount?: boolean;
  collapsible?: boolean;
}

/**
 * Advanced filter panel with multiple filter types
 */
export function FilterPanel({
  filterGroups,
  activeFilters: controlledFilters,
  onFiltersChange,
  onClear,
  showActiveCount = true,
  collapsible = true,
}: FilterPanelProps) {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>(controlledFilters || []);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filterGroups.map((g) => g.id))
  );

  const handleFilterChange = (groupId: string, value: any) => {
    const newFilters = activeFilters.filter((f) => f.groupId !== groupId);

    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value) && value.length === 0) {
        // Don't add empty arrays
      } else {
        newFilters.push({ groupId, value });
      }
    }

    setActiveFilters(newFilters);
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleCheckboxChange = (groupId: string, optionId: string, checked: boolean) => {
    const currentFilter = activeFilters.find((f) => f.groupId === groupId);
    const currentValues = (currentFilter?.value as string[]) || [];

    const newValues = checked
      ? [...currentValues, optionId]
      : currentValues.filter((v) => v !== optionId);

    handleFilterChange(groupId, newValues);
  };

  const handleClear = () => {
    setActiveFilters([]);
    if (onClear) {
      onClear();
    }
    if (onFiltersChange) {
      onFiltersChange([]);
    }
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const getFilterValue = (groupId: string) => {
    return activeFilters.find((f) => f.groupId === groupId)?.value;
  };

  const renderFilterGroup = (group: FilterGroup) => {
    const isExpanded = expandedGroups.has(group.id);
    const currentValue = getFilterValue(group.id);

    return (
      <Box key={group.id} sx={{ mb: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1, cursor: collapsible ? 'pointer' : 'default' }}
          onClick={() => collapsible && toggleGroup(group.id)}
        >
          <FormLabel>
            {group.label}
            {currentValue !== undefined && currentValue !== null && (
              <Chip label="Active" size="small" color="primary" sx={{ ml: 1 }} />
            )}
          </FormLabel>
          {collapsible && (
            <IconButton size="small">
              {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          )}
        </Stack>

        <Collapse in={isExpanded || !collapsible}>
          {group.type === 'checkbox' && (
            <FormGroup>
              {group.options?.map((option) => (
                <FormControlLabel
                  key={option.id}
                  control={
                    <Checkbox
                      checked={(currentValue as string[])?.includes(option.id) || false}
                      onChange={(e) => handleCheckboxChange(group.id, option.id, e.target.checked)}
                    />
                  }
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2">{option.label}</Typography>
                      {option.count !== undefined && (
                        <Chip label={option.count} size="small" variant="outlined" />
                      )}
                    </Stack>
                  }
                />
              ))}
            </FormGroup>
          )}

          {group.type === 'select' && (
            <FormControl fullWidth size="small">
              <Select
                value={currentValue || ''}
                onChange={(e) => handleFilterChange(group.id, e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All</MenuItem>
                {group.options?.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                    {option.count !== undefined && ` (${option.count})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {group.type === 'range' && (
            <Box sx={{ px: 1 }}>
              <Slider
                value={currentValue || [group.min || 0, group.max || 100]}
                onChange={(_, value) => handleFilterChange(group.id, value)}
                min={group.min}
                max={group.max}
                step={group.step || 1}
                marks={[
                  { value: group.min || 0, label: group.min },
                  { value: group.max || 100, label: group.max },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          )}

          {group.type === 'date' && (
            <Stack spacing={1}>
              <TextField
                type="date"
                label="From"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={(currentValue as any)?.start || ''}
                onChange={(e) =>
                  handleFilterChange(group.id, {
                    ...(currentValue as any),
                    start: e.target.value,
                  })
                }
              />
              <TextField
                type="date"
                label="To"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={(currentValue as any)?.end || ''}
                onChange={(e) =>
                  handleFilterChange(group.id, {
                    ...(currentValue as any),
                    end: e.target.value,
                  })
                }
              />
            </Stack>
          )}
        </Collapse>
      </Box>
    );
  };

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterIcon />
            <Typography variant="h6">Filters</Typography>
            {showActiveCount && activeFilters.length > 0 && (
              <Chip label={activeFilters.length} color="primary" size="small" />
            )}
          </Stack>
          {activeFilters.length > 0 && (
            <Button size="small" startIcon={<ClearIcon />} onClick={handleClear}>
              Clear All
            </Button>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {filterGroups.map(renderFilterGroup)}
      </CardContent>
    </Card>
  );
}

/**
 * Active filters display with chips
 */
export function ActiveFilters({
  filters,
  filterGroups,
  onRemove,
  onClear,
}: {
  filters: ActiveFilter[];
  filterGroups: FilterGroup[];
  onRemove?: (groupId: string) => void;
  onClear?: () => void;
}) {
  if (filters.length === 0) return null;

  const getFilterLabel = (filter: ActiveFilter) => {
    const group = filterGroups.find((g) => g.id === filter.groupId);
    if (!group) return filter.groupId;

    let valueLabel = String(filter.value);
    if (Array.isArray(filter.value)) {
      const labels = filter.value.map((v) => {
        const option = group.options?.find((o) => o.id === v);
        return option?.label || v;
      });
      valueLabel = labels.join(', ');
    } else if (group.options) {
      const option = group.options.find((o) => o.id === filter.value);
      valueLabel = option?.label || filter.value;
    }

    return `${group.label}: ${valueLabel}`;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Typography variant="subtitle2" sx={{ mr: 1 }}>
          Active Filters:
        </Typography>
        {filters.map((filter) => (
          <Chip
            key={filter.groupId}
            label={getFilterLabel(filter)}
            onDelete={() => onRemove?.(filter.groupId)}
            color="primary"
            size="small"
          />
        ))}
        <Button size="small" onClick={onClear} startIcon={<ClearIcon />}>
          Clear All
        </Button>
      </Stack>
    </Paper>
  );
}
