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
  Close as CloseIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface RecentItem {
  id: number;
  itemType: 'plant' | 'sensor' | 'device' | 'harvest' | 'automation' | 'recipe' | 'report';
  itemId: number;
  itemName: string;
  metadata?: any;
  lastAccessedAt: string;
  accessCount: number;
}

const ITEM_ICONS: Record<string, React.ReactElement> = {
  plant: <PlantIcon fontSize="small" color="success" />,
  sensor: <SensorIcon fontSize="small" color="primary" />,
  device: <DeviceIcon fontSize="small" color="info" />,
  harvest: <HarvestIcon fontSize="small" color="secondary" />,
  automation: <AutomationIcon fontSize="small" color="warning" />,
  recipe: <RecipeIcon fontSize="small" />,
  report: <ReportIcon fontSize="small" />,
};

const ITEM_ROUTES: Record<string, string> = {
  plant: '/plants',
  sensor: '/sensors',
  device: '/devices',
  harvest: '/harvests',
  automation: '/automation',
  recipe: '/recipes',
  report: '/reports',
};

export function RecentItems() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [tab, setTab] = useState<'recent' | 'most-accessed'>('recent');
  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
    // Refresh every 30 seconds
    const interval = setInterval(fetchItems, 30000);
    return () => clearInterval(interval);
  }, [tab]);

  const fetchItems = async () => {
    try {
      const endpoint = tab === 'recent' ? '/recent-items' : '/recent-items/most-accessed';
      const response = await api.get(endpoint, {
        params: { limit: 15 },
      });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching recent items:', error);
    }
  };

  const handleItemClick = (item: RecentItem) => {
    const route = ITEM_ROUTES[item.itemType];
    if (route) {
      navigate(`${route}/${item.itemId}`);
    }
  };

  const handleRemoveItem = async (item: RecentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/recent-items/${item.itemType}/${item.itemId}`);
      fetchItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Paper sx={{ width: '100%', maxWidth: 320, height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, pt: 1 }}>
        <Typography variant="h6" gutterBottom>
          Recent Items
        </Typography>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="fullWidth">
          <Tab label="Recent" value="recent" />
          <Tab label="Most Used" value="most-accessed" />
        </Tabs>
      </Box>

      <List sx={{ overflow: 'auto', flexGrow: 1, py: 0 }}>
        {items.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No recent items"
              secondary="Items you access will appear here"
              sx={{ textAlign: 'center', color: 'text.secondary' }}
            />
          </ListItem>
        ) : (
          items.map((item) => (
            <React.Fragment key={`${item.itemType}-${item.itemId}`}>
              <ListItemButton onClick={() => handleItemClick(item)}>
                <ListItemIcon>{ITEM_ICONS[item.itemType] || <TimeIcon />}</ListItemIcon>
                <ListItemText
                  primary={item.itemName}
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip label={item.itemType} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.7rem' }} />
                      {tab === 'most-accessed' && (
                        <Typography variant="caption" color="text.secondary">
                          {item.accessCount} times
                        </Typography>
                      )}
                      {tab === 'recent' && (
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(item.lastAccessedAt)}
                        </Typography>
                      )}
                    </Box>
                  }
                  primaryTypographyProps={{ noWrap: true, fontSize: '0.9rem' }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => handleRemoveItem(item, e)}
                  sx={{ ml: 1 }}
                >
                  <CloseIcon fontSize="small" />
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
