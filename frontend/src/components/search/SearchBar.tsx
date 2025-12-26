import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  InputAdornment,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Chip,
  Stack,
  Typography,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

export interface SearchSuggestion {
  id: string;
  text: string;
  category?: string;
  count?: number;
}

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  popularSearches?: string[];
  showSuggestions?: boolean;
  debounceMs?: number;
  autoFocus?: boolean;
  fullWidth?: boolean;
}

/**
 * Advanced search bar with suggestions and history
 */
export function SearchBar({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Search...',
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  showSuggestions = true,
  debounceMs = 300,
  autoFocus = false,
  fullWidth = true,
}: SearchBarProps) {
  const [value, setValue] = useState(controlledValue || '');
  const [focused, setFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setValue(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onChange) {
        onChange(value);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setShowDropdown(true);
  };

  const handleClear = () => {
    setValue('');
    if (onChange) {
      onChange('');
    }
    setShowDropdown(false);
  };

  const handleSearch = (searchValue?: string) => {
    const finalValue = searchValue || value;
    if (onSearch) {
      onSearch(finalValue);
    }
    setShowDropdown(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setValue(suggestion);
    handleSearch(suggestion);
  };

  const filteredSuggestions = suggestions.filter((s) =>
    s.text.toLowerCase().includes(value.toLowerCase())
  );

  const hasDropdownContent =
    showSuggestions &&
    showDropdown &&
    focused &&
    (filteredSuggestions.length > 0 || recentSearches.length > 0 || popularSearches.length > 0);

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        onFocus={() => {
          setFocused(true);
          setShowDropdown(true);
        }}
        onBlur={() => {
          setTimeout(() => {
            setFocused(false);
            setShowDropdown(false);
          }, 200);
        }}
        placeholder={placeholder}
        autoFocus={autoFocus}
        fullWidth={fullWidth}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {hasDropdownContent && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 0.5,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 1000,
          }}
        >
          <List>
            {/* Suggestions */}
            {filteredSuggestions.length > 0 && (
              <>
                <ListItem>
                  <Typography variant="caption" color="text.secondary">
                    Suggestions
                  </Typography>
                </ListItem>
                {filteredSuggestions.slice(0, 5).map((suggestion) => (
                  <ListItemButton key={suggestion.id} onClick={() => handleSuggestionClick(suggestion.text)}>
                    <ListItemText
                      primary={suggestion.text}
                      secondary={suggestion.category}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    {suggestion.count !== undefined && (
                      <Chip label={suggestion.count} size="small" sx={{ ml: 1 }} />
                    )}
                  </ListItemButton>
                ))}
                {(recentSearches.length > 0 || popularSearches.length > 0) && <Divider />}
              </>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && value === '' && (
              <>
                <ListItem>
                  <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Recent Searches
                  </Typography>
                </ListItem>
                {recentSearches.slice(0, 3).map((search, index) => (
                  <ListItemButton key={index} onClick={() => handleSuggestionClick(search)}>
                    <ListItemText primary={search} />
                  </ListItemButton>
                ))}
                {popularSearches.length > 0 && <Divider />}
              </>
            )}

            {/* Popular Searches */}
            {popularSearches.length > 0 && value === '' && (
              <>
                <ListItem>
                  <TrendingIcon fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Popular Searches
                  </Typography>
                </ListItem>
                {popularSearches.slice(0, 3).map((search, index) => (
                  <ListItemButton key={index} onClick={() => handleSuggestionClick(search)}>
                    <ListItemText primary={search} />
                  </ListItemButton>
                ))}
              </>
            )}
          </List>
        </Paper>
      )}
    </Box>
  );
}

/**
 * Compact search bar for inline use
 */
export function CompactSearchBar({
  value,
  onChange,
  placeholder = 'Search...',
}: Pick<SearchBarProps, 'value' | 'onChange' | 'placeholder'>) {
  return (
    <TextField
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
    />
  );
}
