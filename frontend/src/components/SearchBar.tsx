import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingIcon,
} from '@mui/icons-material';

export interface SearchSuggestion {
  label: string;
  value: string;
  category?: string;
  meta?: string;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  showSuggestions?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  suggestions = [],
  recentSearches = [],
  showSuggestions = true,
  fullWidth = true,
  size = 'medium',
  autoFocus = false,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.label.toLowerCase().includes(value.toLowerCase())
  );

  const showDropdown = isFocused && showSuggestions && (value.trim().length > 0 || recentSearches.length > 0);

  const displayItems: Array<{ type: 'suggestion' | 'recent'; item: SearchSuggestion | string }> = [];

  if (value.trim().length > 0) {
    filteredSuggestions.forEach((suggestion) => {
      displayItems.push({ type: 'suggestion', item: suggestion });
    });
  } else {
    recentSearches.slice(0, 5).forEach((search) => {
      displayItems.push({ type: 'recent', item: search });
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === 'Enter' && onSearch) {
        onSearch(value);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < displayItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : displayItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < displayItems.length) {
          const selected = displayItems[highlightedIndex];
          const selectedValue = selected.type === 'suggestion'
            ? (selected.item as SearchSuggestion).value
            : (selected.item as string);
          onChange(selectedValue);
          onSearch?.(selectedValue);
          setIsFocused(false);
        } else if (onSearch) {
          onSearch(value);
        }
        break;
      case 'Escape':
        setIsFocused(false);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleSuggestionClick = (item: SearchSuggestion | string) => {
    const selectedValue = typeof item === 'string' ? item : item.value;
    onChange(selectedValue);
    onSearch?.(selectedValue);
    setIsFocused(false);
  };

  const handleClear = () => {
    onChange('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Box sx={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
      <TextField
        inputRef={inputRef}
        fullWidth={fullWidth}
        size={size}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsFocused(true)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {showDropdown && (
        <Paper
          ref={suggestionsRef}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 0.5,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 1300,
          }}
        >
          {displayItems.length > 0 ? (
            <List dense>
              {value.trim().length === 0 && recentSearches.length > 0 && (
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TrendingIcon fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Recent Searches
                    </Typography>
                  </Box>
                </ListItem>
              )}

              {displayItems.map((displayItem, index) => {
                const isHighlighted = index === highlightedIndex;

                if (displayItem.type === 'recent') {
                  const search = displayItem.item as string;
                  return (
                    <ListItemButton
                      key={`recent-${index}`}
                      selected={isHighlighted}
                      onClick={() => handleSuggestionClick(search)}
                    >
                      <ListItemText
                        primary={search}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItemButton>
                  );
                }

                const suggestion = displayItem.item as SearchSuggestion;
                return (
                  <ListItemButton
                    key={`suggestion-${index}`}
                    selected={isHighlighted}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2">{suggestion.label}</Typography>
                          {suggestion.category && (
                            <Chip label={suggestion.category} size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                      secondary={suggestion.meta}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No suggestions found
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}
