import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Divider,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LocalFlorist as PlantIcon,
  Sensors as SensorIcon,
  DeviceHub as DeviceIcon,
  Agriculture as HarvestIcon,
  PlayCircle as AutomationIcon,
  MenuBook as RecipeIcon,
  Assessment as ReportIcon,
  Category as StrainIcon,
  Notifications as AlertIcon,
  Note as NoteIcon,
  Delete as DeleteIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface Bookmark {
  id: number;
  itemType: 'plant' | 'sensor' | 'device' | 'harvest' | 'automation' | 'recipe' | 'report' | 'strain' | 'alert' | 'note';
  itemId: number;
  itemName: string;
  metadata?: any;
  createdAt: string;
}

const ITEM_ICONS: Record<string, React.ReactElement> = {
  plant: <PlantIcon fontSize="small" color="success" />,
  sensor: <SensorIcon fontSize="small" color="primary" />,
  device: <DeviceIcon fontSize="small" color="info" />,
  harvest: <HarvestIcon fontSize="small" color="secondary" />,
  automation: <AutomationIcon fontSize="small" color="warning" />,
  recipe: <RecipeIcon fontSize="small" />,
  report: <ReportIcon fontSize="small" />,
  strain: <StrainIcon fontSize="small" />,
  alert: <AlertIcon fontSize="small" />,
  note: <NoteIcon fontSize="small" />,
};

const ITEM_ROUTES: Record<string, string> = {
  plant: '/plants',
  sensor: '/sensors',
  device: '/devices',
  harvest: '/harvests',
  automation: '/automation',
  recipe: '/recipes',
  report: '/reports',
  strain: '/strains',
  alert: '/alerts',
  note: '/notes',
};

export function Bookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarks();
  }, [filterType]);

  const fetchBookmarks = async () => {
    try {
      const params: any = { limit: 50 };
      if (filterType !== 'all') {
        params.itemType = filterType;
      }

      const response = await api.get('/bookmarks', { params });
      setBookmarks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const handleItemClick = (bookmark: Bookmark) => {
    const route = ITEM_ROUTES[bookmark.itemType];
    if (route) {
      navigate(`${route}/${bookmark.itemId}`);
    }
  };

  const handleRemoveBookmark = async (bookmark: Bookmark, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/bookmarks/${bookmark.itemType}/${bookmark.itemId}`);
      fetchBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  };

  // Get unique item types from bookmarks
  const itemTypes = ['all', ...new Set(bookmarks.map(b => b.itemType))];

  return (
    <Paper sx={{ width: '100%', maxWidth: 320, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <BookmarkIcon color="primary" />
          <Typography variant="h6">
            Bookmarks
          </Typography>
        </Box>
        <Tabs
          value={filterType}
          onChange={(_, value) => setFilterType(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 40 }}
        >
          {itemTypes.map((type) => (
            <Tab
              key={type}
              label={type === 'all' ? 'All' : type}
              value={type}
              sx={{ minHeight: 40, py: 0.5, textTransform: 'capitalize' }}
            />
          ))}
        </Tabs>
      </Box>

      <List sx={{ overflow: 'auto', flexGrow: 1, py: 0 }}>
        {bookmarks.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No bookmarks yet"
              secondary="Click the bookmark icon to save items"
              sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}
            />
          </ListItem>
        ) : (
          bookmarks.map((bookmark) => (
            <React.Fragment key={`${bookmark.itemType}-${bookmark.itemId}`}>
              <ListItemButton onClick={() => handleItemClick(bookmark)}>
                <ListItemIcon>{ITEM_ICONS[bookmark.itemType] || <BookmarkIcon />}</ListItemIcon>
                <ListItemText
                  primary={bookmark.itemName}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip label={bookmark.itemType} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.7rem' }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(bookmark.createdAt)}
                      </Typography>
                    </Box>
                  }
                  primaryTypographyProps={{ noWrap: true, fontSize: '0.9rem' }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleRemoveBookmark(bookmark, e)}
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))
        )}
      </List>
    </Paper>
  );
}
