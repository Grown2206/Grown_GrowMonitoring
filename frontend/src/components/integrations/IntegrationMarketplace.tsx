import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Rating,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  TrendingUp as PopularIcon,
  Star as FeaturedIcon,
  Check as InstalledIcon,
  GetApp as InstallIcon,
  Settings as ConfigureIcon,
  OpenInNew as ExternalIcon,
} from '@mui/icons-material';

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'automation' | 'analytics' | 'communication' | 'storage' | 'monitoring';
  developer: string;
  rating: number;
  reviews: number;
  installs: number;
  installed?: boolean;
  featured?: boolean;
  verified?: boolean;
  tags?: string[];
  pricing: 'free' | 'paid' | 'freemium';
}

export interface IntegrationMarketplaceProps {
  integrations?: Integration[];
  onInstall?: (integrationId: string) => Promise<void>;
  onConfigure?: (integrationId: string) => void;
}

const defaultIntegrations: Integration[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get real-time notifications about your plants and sensors in Slack channels',
    icon: '💬',
    category: 'communication',
    developer: 'Slack Technologies',
    rating: 4.8,
    reviews: 1234,
    installs: 5600,
    installed: true,
    featured: true,
    verified: true,
    tags: ['notifications', 'alerts', 'team'],
    pricing: 'free',
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5,000+ apps and automate your workflows',
    icon: '⚡',
    category: 'automation',
    developer: 'Zapier Inc.',
    rating: 4.7,
    reviews: 892,
    installs: 4200,
    featured: true,
    verified: true,
    tags: ['automation', 'workflows', 'integration'],
    pricing: 'freemium',
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Export sensor data and reports directly to Google Sheets',
    icon: '📊',
    category: 'storage',
    developer: 'Google LLC',
    rating: 4.6,
    reviews: 756,
    installs: 3800,
    verified: true,
    tags: ['export', 'data', 'spreadsheet'],
    pricing: 'free',
  },
  {
    id: 'grafana',
    name: 'Grafana',
    description: 'Advanced data visualization and monitoring dashboards',
    icon: '📈',
    category: 'analytics',
    developer: 'Grafana Labs',
    rating: 4.9,
    reviews: 445,
    installs: 2100,
    verified: true,
    tags: ['visualization', 'monitoring', 'dashboards'],
    pricing: 'freemium',
  },
  {
    id: 'mqtt',
    name: 'MQTT Broker',
    description: 'Publish sensor data to MQTT topics for IoT integration',
    icon: '🔌',
    category: 'monitoring',
    developer: 'Eclipse Foundation',
    rating: 4.5,
    reviews: 334,
    installs: 1800,
    verified: true,
    tags: ['iot', 'mqtt', 'sensors'],
    pricing: 'free',
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    description: 'Receive alerts and control your system via Telegram',
    icon: '🤖',
    category: 'communication',
    developer: 'Telegram',
    rating: 4.7,
    reviews: 523,
    installs: 2900,
    verified: true,
    tags: ['bot', 'notifications', 'mobile'],
    pricing: 'free',
  },
  {
    id: 'influxdb',
    name: 'InfluxDB',
    description: 'Time-series database for sensor data storage and analysis',
    icon: '💾',
    category: 'storage',
    developer: 'InfluxData',
    rating: 4.6,
    reviews: 289,
    installs: 1500,
    verified: true,
    tags: ['database', 'timeseries', 'storage'],
    pricing: 'freemium',
  },
  {
    id: 'ifttt',
    name: 'IFTTT',
    description: 'Create powerful automation with if-this-then-that logic',
    icon: '🔄',
    category: 'automation',
    developer: 'IFTTT Inc.',
    rating: 4.4,
    reviews: 612,
    installs: 3200,
    verified: true,
    tags: ['automation', 'triggers', 'actions'],
    pricing: 'freemium',
  },
];

/**
 * Integration marketplace to discover and install integrations
 */
export function IntegrationMarketplace({
  integrations: customIntegrations,
  onInstall,
  onConfigure,
}: IntegrationMarketplaceProps) {
  const integrations = customIntegrations || defaultIntegrations;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'All Integrations', count: integrations.length },
    { id: 'automation', label: 'Automation', count: integrations.filter(i => i.category === 'automation').length },
    { id: 'analytics', label: 'Analytics', count: integrations.filter(i => i.category === 'analytics').length },
    { id: 'communication', label: 'Communication', count: integrations.filter(i => i.category === 'communication').length },
    { id: 'storage', label: 'Storage', count: integrations.filter(i => i.category === 'storage').length },
    { id: 'monitoring', label: 'Monitoring', count: integrations.filter(i => i.category === 'monitoring').length },
  ];

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      searchQuery === '' ||
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const featuredIntegrations = filteredIntegrations.filter((i) => i.featured);
  const popularIntegrations = [...filteredIntegrations].sort((a, b) => b.installs - a.installs).slice(0, 6);

  const handleInstall = async (integration: Integration) => {
    try {
      if (onInstall) {
        await onInstall(integration.id);
      }
      // Update local state
    } catch (error) {
      console.error('Failed to install integration:', error);
    }
  };

  const handleViewDetails = (integration: Integration) => {
    setSelectedIntegration(integration);
    setDetailsDialogOpen(true);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Integration Marketplace
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Extend your Grow Monitoring System with powerful integrations
          </Typography>
        </Box>

        {/* Search */}
        <TextField
          placeholder="Search integrations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Categories */}
        <Tabs
          value={selectedCategory}
          onChange={(_, value) => setSelectedCategory(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map((cat) => (
            <Tab
              key={cat.id}
              value={cat.id}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography>{cat.label}</Typography>
                  <Chip label={cat.count} size="small" />
                </Stack>
              }
            />
          ))}
        </Tabs>

        {/* Featured Integrations */}
        {searchQuery === '' && selectedCategory === 'all' && featuredIntegrations.length > 0 && (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <FeaturedIcon color="primary" />
              <Typography variant="h6">Featured</Typography>
            </Stack>
            <Grid container spacing={2}>
              {featuredIntegrations.map((integration) => (
                <Grid item xs={12} sm={6} md={4} key={integration.id}>
                  {renderIntegrationCard(integration)}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Popular Integrations */}
        {searchQuery === '' && selectedCategory === 'all' && (
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <PopularIcon color="primary" />
              <Typography variant="h6">Popular</Typography>
            </Stack>
            <Grid container spacing={2}>
              {popularIntegrations.map((integration) => (
                <Grid item xs={12} sm={6} md={4} key={integration.id}>
                  {renderIntegrationCard(integration)}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* All Integrations */}
        {(searchQuery !== '' || selectedCategory !== 'all') && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {filteredIntegrations.length} {filteredIntegrations.length === 1 ? 'Integration' : 'Integrations'}
            </Typography>
            <Grid container spacing={2}>
              {filteredIntegrations.map((integration) => (
                <Grid item xs={12} sm={6} md={4} key={integration.id}>
                  {renderIntegrationCard(integration)}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Stack>

      {/* Details Dialog */}
      {selectedIntegration && (
        <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ width: 56, height: 56, fontSize: '2rem' }}>
                {selectedIntegration.icon}
              </Avatar>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6">{selectedIntegration.name}</Typography>
                  {selectedIntegration.verified && (
                    <Chip label="Verified" size="small" color="primary" />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  by {selectedIntegration.developer}
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3}>
              <Typography variant="body1">{selectedIntegration.description}</Typography>

              <Divider />

              <Stack direction="row" spacing={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Rating
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Rating value={selectedIntegration.rating} readOnly precision={0.1} size="small" />
                    <Typography variant="body2">
                      {selectedIntegration.rating} ({formatNumber(selectedIntegration.reviews)})
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Installs
                  </Typography>
                  <Typography variant="body2">{formatNumber(selectedIntegration.installs)}+</Typography>
                </Box>
              </Stack>

              {selectedIntegration.tags && (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Tags
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                    {selectedIntegration.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            {selectedIntegration.installed ? (
              <Button
                variant="contained"
                startIcon={<ConfigureIcon />}
                onClick={() => onConfigure?.(selectedIntegration.id)}
              >
                Configure
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={<InstallIcon />}
                onClick={() => handleInstall(selectedIntegration)}
              >
                Install
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );

  function renderIntegrationCard(integration: Integration) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Avatar sx={{ width: 48, height: 48, fontSize: '1.5rem' }}>
                {integration.icon}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="h6" noWrap>
                    {integration.name}
                  </Typography>
                  {integration.verified && (
                    <Chip label="✓" size="small" color="primary" sx={{ height: 20, minWidth: 20, '& .MuiChip-label': { px: 0.5 } }} />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  by {integration.developer}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
              {integration.description}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Rating value={integration.rating} readOnly precision={0.1} size="small" />
              <Typography variant="caption">
                {integration.rating} ({formatNumber(integration.reviews)})
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
              <Chip label={integration.category} size="small" />
              <Chip label={integration.pricing} size="small" variant="outlined" />
              {integration.installed && (
                <Chip icon={<InstalledIcon />} label="Installed" size="small" color="success" />
              )}
            </Stack>
          </Stack>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => handleViewDetails(integration)}>
            Learn More
          </Button>
          {integration.installed ? (
            <Button
              size="small"
              startIcon={<ConfigureIcon />}
              onClick={() => onConfigure?.(integration.id)}
            >
              Configure
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              startIcon={<InstallIcon />}
              onClick={() => handleInstall(integration)}
            >
              Install
            </Button>
          )}
        </CardActions>
      </Card>
    );
  }
}
