import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  Star as StarIcon,
  StarOutline as StarOutlineIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

export interface SavedSearch {
  id: string;
  name: string;
  query: any;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  isFavorite: boolean;
}

export interface SavedSearchesProps {
  searches?: SavedSearch[];
  onLoadSearch?: (search: SavedSearch) => void;
  onSaveSearch?: (name: string, query: any) => void;
  onDeleteSearch?: (searchId: string) => void;
  onUpdateSearch?: (searchId: string, updates: Partial<SavedSearch>) => void;
}

/**
 * Saved searches management component
 */
export function SavedSearches({
  searches: initialSearches = [],
  onLoadSearch,
  onSaveSearch,
  onDeleteSearch,
  onUpdateSearch,
}: SavedSearchesProps) {
  const [searches, setSearches] = useState<SavedSearch[]>(
    initialSearches.length > 0 ? initialSearches : getSampleSearches()
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentSearch, setCurrentSearch] = useState<SavedSearch | null>(null);
  const [newName, setNewName] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSearchId, setSelectedSearchId] = useState<string | null>(null);

  const handleLoadSearch = (search: SavedSearch) => {
    const updatedSearches = searches.map((s) =>
      s.id === search.id
        ? {
            ...s,
            lastUsed: new Date(),
            usageCount: s.usageCount + 1,
          }
        : s
    );
    setSearches(updatedSearches);
    onLoadSearch?.(search);
  };

  const handleToggleFavorite = (searchId: string) => {
    const updatedSearches = searches.map((s) =>
      s.id === searchId ? { ...s, isFavorite: !s.isFavorite } : s
    );
    setSearches(updatedSearches);

    const search = updatedSearches.find((s) => s.id === searchId);
    if (search) {
      onUpdateSearch?.(searchId, { isFavorite: search.isFavorite });
    }
  };

  const handleEditSearch = (search: SavedSearch) => {
    setCurrentSearch(search);
    setNewName(search.name);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleSaveEdit = () => {
    if (!currentSearch || !newName.trim()) return;

    const updatedSearches = searches.map((s) =>
      s.id === currentSearch.id ? { ...s, name: newName } : s
    );
    setSearches(updatedSearches);

    onUpdateSearch?.(currentSearch.id, { name: newName });
    setEditDialogOpen(false);
    setCurrentSearch(null);
    setNewName('');
  };

  const handleDeleteSearch = (searchId: string) => {
    setSearches(searches.filter((s) => s.id !== searchId));
    onDeleteSearch?.(searchId);
    handleMenuClose();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, searchId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedSearchId(searchId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSearchId(null);
  };

  const favoriteSearches = searches.filter((s) => s.isFavorite);
  const recentSearches = [...searches]
    .sort((a, b) => {
      const aTime = a.lastUsed?.getTime() || 0;
      const bTime = b.lastUsed?.getTime() || 0;
      return bTime - aTime;
    })
    .slice(0, 5);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Saved Searches
      </Typography>

      {searches.length === 0 ? (
        <Alert severity="info">
          No saved searches yet. Save your search criteria to quickly access them later.
        </Alert>
      ) : (
        <Stack spacing={3}>
          {favoriteSearches.length > 0 && (
            <Card>
              <CardHeader
                avatar={<StarIcon color="primary" />}
                title="Favorites"
                subheader={favoriteSearches.length + ' favorite searches'}
              />
              <Divider />
              <List>
                {favoriteSearches.map((search) => (
                  <ListItem
                    key={search.id}
                    secondaryAction={
                      <IconButton onClick={(e) => handleMenuOpen(e, search.id)}>
                        <MoreIcon />
                      </IconButton>
                    }
                  >
                    <ListItemButton onClick={() => handleLoadSearch(search)}>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle1">{search.name}</Typography>
                            <Chip label={'Used ' + search.usageCount + 'x'} size="small" />
                          </Stack>
                        }
                        secondary={
                          search.lastUsed && 'Last used: ' + search.lastUsed.toLocaleDateString()
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Card>
          )}

          <Card>
            <CardHeader
              avatar={<HistoryIcon />}
              title="Recent Searches"
              subheader="Recently used searches"
            />
            <Divider />
            <List>
              {recentSearches.map((search) => (
                <ListItem
                  key={search.id}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleFavorite(search.id)}
                      >
                        {search.isFavorite ? <StarIcon color="primary" /> : <StarOutlineIcon />}
                      </IconButton>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, search.id)}>
                        <MoreIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemButton onClick={() => handleLoadSearch(search)}>
                    <ListItemText
                      primary={search.name}
                      secondary={
                        <Stack direction="row" spacing={2}>
                          <Typography variant="caption">
                            Created: {search.createdAt.toLocaleDateString()}
                          </Typography>
                          {search.lastUsed && (
                            <Typography variant="caption">
                              Used: {search.lastUsed.toLocaleDateString()}
                            </Typography>
                          )}
                          <Typography variant="caption">Count: {search.usageCount}</Typography>
                        </Stack>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>

          <Card>
            <CardHeader
              avatar={<SaveIcon />}
              title="All Saved Searches"
              subheader={searches.length + ' total'}
            />
            <Divider />
            <List>
              {searches.map((search) => (
                <ListItem
                  key={search.id}
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleFavorite(search.id)}
                      >
                        {search.isFavorite ? <StarIcon color="primary" /> : <StarOutlineIcon />}
                      </IconButton>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, search.id)}>
                        <MoreIcon />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemButton onClick={() => handleLoadSearch(search)}>
                    <ListItemText
                      primary={search.name}
                      secondary={'Created ' + search.createdAt.toLocaleDateString() + ' " Used ' + search.usageCount + 'x'}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Card>
        </Stack>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem
          onClick={() => {
            const search = searches.find((s) => s.id === selectedSearchId);
            if (search) handleEditSearch(search);
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Rename
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedSearchId) handleToggleFavorite(selectedSearchId);
            handleMenuClose();
          }}
        >
          {searches.find((s) => s.id === selectedSearchId)?.isFavorite ? (
            <>
              <StarOutlineIcon fontSize="small" sx={{ mr: 1 }} />
              Remove from Favorites
            </>
          ) : (
            <>
              <StarIcon fontSize="small" sx={{ mr: 1 }} />
              Add to Favorites
            </>
          )}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (selectedSearchId) handleDeleteSearch(selectedSearchId);
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Rename Search</DialogTitle>
        <DialogContent>
          <TextField
            label="Search Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={!newName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function getSampleSearches(): SavedSearch[] {
  return [
    {
      id: '1',
      name: 'Healthy Plants in Greenhouse A',
      query: { status: 'healthy', location: 'greenhouse-a' },
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      usageCount: 45,
      isFavorite: true,
    },
    {
      id: '2',
      name: 'Temperature Alerts Last Week',
      query: { type: 'alert', sensor: 'temperature', dateRange: '7d' },
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      usageCount: 23,
      isFavorite: true,
    },
    {
      id: '3',
      name: 'Inactive Sensors',
      query: { category: 'sensors', status: 'inactive' },
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      lastUsed: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      usageCount: 12,
      isFavorite: false,
    },
  ];
}
