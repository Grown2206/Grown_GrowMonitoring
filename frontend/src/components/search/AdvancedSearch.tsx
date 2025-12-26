import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Autocomplete,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  TuneOutlined as AdvancedIcon,
} from '@mui/icons-material';

export type SearchOperator = 'contains' | 'equals' | 'starts_with' | 'ends_with' | 'regex';
export type LogicalOperator = 'AND' | 'OR';

export interface SearchCriteria {
  id: string;
  field: string;
  operator: SearchOperator;
  value: string;
}

export interface AdvancedSearchQuery {
  criteria: SearchCriteria[];
  logicalOperator: LogicalOperator;
  caseSensitive: boolean;
  includeArchived: boolean;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  highlights?: string[];
  relevance: number;
}

export interface AdvancedSearchProps {
  fields?: string[];
  onSearch?: (query: AdvancedSearchQuery) => Promise<SearchResult[]>;
  onSaveSearch?: (query: AdvancedSearchQuery, name: string) => void;
  recentSearches?: string[];
}

/**
 * Advanced search with multiple criteria and operators
 */
export function AdvancedSearch({
  fields = ['name', 'description', 'category', 'status', 'tags'],
  onSearch,
  onSaveSearch,
  recentSearches = [],
}: AdvancedSearchProps) {
  const [quickSearch, setQuickSearch] = useState('');
  const [advancedMode, setAdvancedMode] = useState(false);
  const [criteria, setCriteria] = useState<SearchCriteria[]>([
    { id: '1', field: 'name', operator: 'contains', value: '' },
  ]);
  const [logicalOperator, setLogicalOperator] = useState<LogicalOperator>('AND');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  const handleQuickSearch = async () => {
    if (!quickSearch.trim()) return;

    setSearching(true);

    const query: AdvancedSearchQuery = {
      criteria: [
        { id: '1', field: 'name', operator: 'contains', value: quickSearch },
      ],
      logicalOperator: 'AND',
      caseSensitive: false,
      includeArchived: false,
    };

    try {
      const searchResults = onSearch ? await onSearch(query) : getSampleResults(quickSearch);
      setResults(searchResults);
    } finally {
      setSearching(false);
    }
  };

  const handleAdvancedSearch = async () => {
    const validCriteria = criteria.filter((c) => c.value.trim() !== '');
    if (validCriteria.length === 0) return;

    setSearching(true);

    const query: AdvancedSearchQuery = {
      criteria: validCriteria,
      logicalOperator,
      caseSensitive,
      includeArchived,
    };

    try {
      const searchResults = onSearch
        ? await onSearch(query)
        : getSampleResults(validCriteria[0].value);
      setResults(searchResults);
    } finally {
      setSearching(false);
    }
  };

  const handleAddCriterion = () => {
    setCriteria([
      ...criteria,
      {
        id: `${Date.now()}`,
        field: 'name',
        operator: 'contains',
        value: '',
      },
    ]);
  };

  const handleRemoveCriterion = (id: string) => {
    setCriteria(criteria.filter((c) => c.id !== id));
  };

  const handleUpdateCriterion = (
    id: string,
    field: keyof SearchCriteria,
    value: string
  ) => {
    setCriteria(
      criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleClear = () => {
    setQuickSearch('');
    setCriteria([{ id: '1', field: 'name', operator: 'contains', value: '' }]);
    setResults([]);
  };

  const handleSaveSearch = () => {
    const validCriteria = criteria.filter((c) => c.value.trim() !== '');
    if (validCriteria.length === 0) return;

    const query: AdvancedSearchQuery = {
      criteria: validCriteria,
      logicalOperator,
      caseSensitive,
      includeArchived,
    };

    onSaveSearch?.(query, searchName);
    setSaveDialogOpen(false);
    setSearchName('');
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Advanced Search</Typography>
          <Typography variant="body2" color="text.secondary">
            Search with multiple criteria and filters
          </Typography>
        </Box>
        <Button
          variant={advancedMode ? 'contained' : 'outlined'}
          startIcon={<AdvancedIcon />}
          onClick={() => setAdvancedMode(!advancedMode)}
        >
          {advancedMode ? 'Simple' : 'Advanced'} Mode
        </Button>
      </Stack>

      {/* Quick Search */}
      {!advancedMode && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search..."
              value={quickSearch}
              onChange={(e) => setQuickSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleQuickSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: quickSearch && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClear}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleQuickSearch}
                disabled={!quickSearch.trim() || searching}
              >
                Search
              </Button>
              {recentSearches.length > 0 && (
                <Autocomplete
                  size="small"
                  options={recentSearches}
                  renderInput={(params) => (
                    <TextField {...params} label="Recent" />
                  )}
                  onChange={(_, value) => value && setQuickSearch(value)}
                  sx={{ width: 250 }}
                />
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Advanced Search */}
      {advancedMode && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle2">Search Criteria</Typography>

              {criteria.map((criterion, index) => (
                <Grid container spacing={2} key={criterion.id} alignItems="center">
                  {index > 0 && (
                    <Grid item xs={12}>
                      <Chip
                        label={logicalOperator}
                        size="small"
                        color="primary"
                        onClick={() => setLogicalOperator(logicalOperator === 'AND' ? 'OR' : 'AND')}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Field</InputLabel>
                      <Select
                        value={criterion.field}
                        onChange={(e) =>
                          handleUpdateCriterion(criterion.id, 'field', e.target.value)
                        }
                      >
                        {fields.map((field) => (
                          <MenuItem key={field} value={field}>
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Operator</InputLabel>
                      <Select
                        value={criterion.operator}
                        onChange={(e) =>
                          handleUpdateCriterion(
                            criterion.id,
                            'operator',
                            e.target.value
                          )
                        }
                      >
                        <MenuItem value="contains">Contains</MenuItem>
                        <MenuItem value="equals">Equals</MenuItem>
                        <MenuItem value="starts_with">Starts with</MenuItem>
                        <MenuItem value="ends_with">Ends with</MenuItem>
                        <MenuItem value="regex">Regex</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Search value..."
                      value={criterion.value}
                      onChange={(e) =>
                        handleUpdateCriterion(criterion.id, 'value', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveCriterion(criterion.id)}
                      disabled={criteria.length === 1}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}

              <Button
                variant="outlined"
                size="small"
                onClick={handleAddCriterion}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Criterion
              </Button>

              <Divider />

              <Stack direction="row" spacing={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={caseSensitive}
                      onChange={(e) => setCaseSensitive(e.target.checked)}
                    />
                  }
                  label="Case sensitive"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeArchived}
                      onChange={(e) => setIncludeArchived(e.target.checked)}
                    />
                  }
                  label="Include archived"
                />
              </Stack>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleAdvancedSearch}
                  disabled={searching}
                >
                  Search
                </Button>
                <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear}>
                  Clear
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SaveIcon />}
                  onClick={() => setSaveDialogOpen(true)}
                >
                  Save Search
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Search Results ({results.length})
            </Typography>
            <List>
              {results.map((result) => (
                <React.Fragment key={result.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="subtitle1">{result.title}</Typography>
                          <Chip label={result.category} size="small" />
                          <Chip
                            label={`${Math.round(result.relevance * 100)}% match`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>
                      }
                      secondary={
                        <Stack spacing={0.5}>
                          <Typography variant="body2" color="text.secondary">
                            {result.description}
                          </Typography>
                          {result.highlights && result.highlights.length > 0 && (
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {result.highlights.map((highlight, idx) => (
                                <Chip
                                  key={idx}
                                  label={highlight}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {results.length === 0 && (quickSearch || criteria.some((c) => c.value)) && !searching && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No results found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or using different keywords.
          </Typography>
        </Paper>
      )}

      {/* Save Search Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Search</DialogTitle>
        <DialogContent>
          <TextField
            label="Search Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            fullWidth
            sx={{ mt: 1 }}
            placeholder="My saved search"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSearch}
            disabled={!searchName.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Generate sample search results
 */
function getSampleResults(query: string): SearchResult[] {
  return [
    {
      id: '1',
      title: `Tomato Plant - ${query}`,
      description: 'Healthy tomato plant in greenhouse section A',
      category: 'Plants',
      highlights: ['tomato', 'healthy', 'greenhouse'],
      relevance: 0.95,
    },
    {
      id: '2',
      title: `Temperature Sensor - ${query}`,
      description: 'Temperature and humidity sensor in zone 2',
      category: 'Sensors',
      highlights: ['temperature', 'sensor', 'zone-2'],
      relevance: 0.82,
    },
    {
      id: '3',
      title: `Growth Report - ${query}`,
      description: 'Monthly growth analysis report for December',
      category: 'Reports',
      highlights: ['growth', 'analysis', 'december'],
      relevance: 0.75,
    },
  ];
}
