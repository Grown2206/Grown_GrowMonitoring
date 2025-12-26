import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
  Breadcrumbs,
  Link,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  MenuBook as GuideIcon,
  Help as HelpIcon,
  ArrowBack as BackIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  Home as HomeIcon,
  LocalFlorist as PlantIcon,
  Sensors as SensorIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  type: 'article' | 'video' | 'guide';
  tags?: string[];
  views?: number;
  helpful?: number;
  lastUpdated?: Date;
}

export interface HelpCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  articleCount: number;
}

export interface HelpCenterProps {
  articles?: HelpArticle[];
  categories?: HelpCategory[];
  onArticleView?: (articleId: string) => void;
  onArticleFeedback?: (articleId: string, helpful: boolean) => void;
}

const defaultCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    icon: <HomeIcon />,
    description: 'Learn the basics of the Grow Monitoring System',
    articleCount: 8,
  },
  {
    id: 'plants',
    name: 'Plant Management',
    icon: <PlantIcon />,
    description: 'Managing plants, growth tracking, and health monitoring',
    articleCount: 12,
  },
  {
    id: 'sensors',
    name: 'Sensors & Devices',
    icon: <SensorIcon />,
    description: 'Setting up and configuring environmental sensors',
    articleCount: 10,
  },
  {
    id: 'dashboard',
    name: 'Dashboard & Analytics',
    icon: <DashboardIcon />,
    description: 'Customizing dashboards and viewing analytics',
    articleCount: 15,
  },
  {
    id: 'settings',
    name: 'Settings & Configuration',
    icon: <SettingsIcon />,
    description: 'System settings, preferences, and advanced configuration',
    articleCount: 9,
  },
];

const defaultArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'Welcome to Grow Monitoring System',
    category: 'getting-started',
    type: 'guide',
    tags: ['introduction', 'overview'],
    views: 1250,
    helpful: 98,
    lastUpdated: new Date('2024-01-15'),
    content: `
# Welcome to Grow Monitoring System

Thank you for choosing our Grow Monitoring System! This guide will help you get started.

## What is Grow Monitoring System?

The Grow Monitoring System is a comprehensive platform for tracking and managing plant growth. It integrates with environmental sensors to provide real-time monitoring, analytics, and insights.

## Key Features

- **Real-time Monitoring**: Track temperature, humidity, light levels, and more
- **Growth Analytics**: Visualize growth patterns and trends over time
- **Smart Alerts**: Get notified when conditions fall outside optimal ranges
- **Custom Dashboards**: Create personalized views of your data
- **Automated Reports**: Schedule and receive regular performance reports

## Getting Started

1. Set up your profile and preferences
2. Connect your sensors and devices
3. Add your plants to the system
4. Configure monitoring schedules
5. Customize your dashboard

## Need Help?

Browse our help articles by category or use the search function to find specific topics.
    `,
  },
  {
    id: '2',
    title: 'How to Add a New Plant',
    category: 'plants',
    type: 'article',
    tags: ['plants', 'setup', 'tutorial'],
    views: 890,
    helpful: 85,
    lastUpdated: new Date('2024-01-10'),
    content: `
# How to Add a New Plant

Follow these steps to add a new plant to your monitoring system.

## Step 1: Navigate to Plant Management

Click on the "Plants" menu item in the main navigation.

## Step 2: Click "Add Plant"

Look for the "Add Plant" button in the top-right corner.

## Step 3: Enter Plant Information

Fill in the following details:
- **Plant Name**: A unique identifier for your plant
- **Species**: Select from the dropdown or add a custom species
- **Location**: Where the plant is growing
- **Planting Date**: When the plant was planted

## Step 4: Configure Monitoring

Set optimal ranges for:
- Temperature
- Humidity
- Light levels
- Soil moisture

## Step 5: Assign Sensors

Link relevant sensors to monitor your plant's environment.

## Step 6: Save

Click "Save" to add the plant to your system.

Your plant is now being monitored! You can view its dashboard from the Plants page.
    `,
  },
  {
    id: '3',
    title: 'Connecting Environmental Sensors',
    category: 'sensors',
    type: 'guide',
    tags: ['sensors', 'setup', 'hardware'],
    views: 654,
    helpful: 72,
    lastUpdated: new Date('2024-01-08'),
    content: `
# Connecting Environmental Sensors

Learn how to connect and configure your environmental sensors.

## Supported Sensors

Our system supports various sensor types:
- Temperature sensors
- Humidity sensors
- Light/PAR sensors
- Soil moisture sensors
- pH sensors
- CO2 sensors

## Connection Process

### 1. Prepare Your Sensor

Ensure your sensor is powered and functioning correctly.

### 2. Access Sensor Settings

Navigate to Settings > Devices & Integrations

### 3. Add New Device

Click "Add Device" and select your sensor type.

### 4. Configure Connection

Enter connection details:
- Device name
- Connection method (WiFi, Bluetooth, USB)
- Network credentials if needed

### 5. Test Connection

Use the "Test Connection" button to verify sensor connectivity.

### 6. Calibrate

Follow the calibration wizard to ensure accurate readings.

## Troubleshooting

**Sensor not detected?**
- Check power supply
- Verify network connection
- Ensure sensor is within range

**Inaccurate readings?**
- Recalibrate the sensor
- Check sensor placement
- Update sensor firmware
    `,
  },
  {
    id: '4',
    title: 'Creating Custom Dashboards',
    category: 'dashboard',
    type: 'video',
    tags: ['dashboard', 'customization', 'widgets'],
    views: 445,
    helpful: 67,
    lastUpdated: new Date('2024-01-05'),
    content: `
# Creating Custom Dashboards

Personalize your monitoring experience with custom dashboards.

## Dashboard Basics

Dashboards consist of widgets that display different types of information:
- Charts and graphs
- Metric cards
- Tables
- Alerts and notifications

## Creating a Dashboard

### Step 1: Open Dashboard Manager

Click on "Dashboards" in the main menu.

### Step 2: Create New Dashboard

Click "New Dashboard" and give it a name.

### Step 3: Add Widgets

Click "Add Widget" and choose from:
- Temperature Chart
- Humidity Graph
- Growth Metrics
- Alert Summary
- Recent Activity

### Step 4: Arrange Layout

Drag and drop widgets to arrange them. Resize by dragging corners.

### Step 5: Configure Widgets

Click the settings icon on each widget to customize:
- Data source
- Time range
- Display options
- Refresh interval

### Step 6: Save Dashboard

Click "Save" to keep your configuration.

## Dashboard Templates

Use pre-built templates for common scenarios:
- Overview Dashboard
- Sensor Monitoring
- Growth Analytics
- System Status

## Sharing Dashboards

Share your dashboard with team members by clicking the share icon.
    `,
  },
];

/**
 * Comprehensive help center with articles, search, and navigation
 */
export function HelpCenter({
  articles: customArticles,
  categories: customCategories,
  onArticleView,
  onArticleFeedback,
}: HelpCenterProps) {
  const articles = customArticles || defaultArticles;
  const categories = customCategories || defaultCategories;

  const [view, setView] = useState<'home' | 'category' | 'article'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFeedback, setUserFeedback] = useState<Record<string, boolean | null>>({});

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setView('category');
  };

  const handleArticleClick = (article: HelpArticle) => {
    setSelectedArticle(article);
    setView('article');
    if (onArticleView) {
      onArticleView(article.id);
    }
  };

  const handleBackToHome = () => {
    setView('home');
    setSelectedCategory(null);
    setSelectedArticle(null);
  };

  const handleBackToCategory = () => {
    setView('category');
    setSelectedArticle(null);
  };

  const handleFeedback = (helpful: boolean) => {
    if (!selectedArticle) return;
    setUserFeedback({ ...userFeedback, [selectedArticle.id]: helpful });
    if (onArticleFeedback) {
      onArticleFeedback(selectedArticle.id, helpful);
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = !selectedCategory || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getArticleIcon = (type: HelpArticle['type']) => {
    switch (type) {
      case 'video':
        return <VideoIcon />;
      case 'guide':
        return <GuideIcon />;
      default:
        return <ArticleIcon />;
    }
  };

  const renderBreadcrumbs = () => {
    return (
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={handleBackToHome}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <HomeIcon fontSize="small" />
          Help Center
        </Link>
        {selectedCategory && (
          <Link component="button" variant="body2" onClick={handleBackToCategory}>
            {categories.find((c) => c.id === selectedCategory)?.name}
          </Link>
        )}
        {selectedArticle && <Typography color="text.primary">{selectedArticle.title}</Typography>}
      </Breadcrumbs>
    );
  };

  const renderHome = () => (
    <Stack spacing={4}>
      {/* Search */}
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        <Typography variant="h4" gutterBottom>
          How can we help you?
        </Typography>
        <TextField
          placeholder="Search for help articles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          sx={{ maxWidth: 600, mx: 'auto', mt: 2, bgcolor: 'background.paper' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Categories */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Browse by Category
        </Typography>
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  '&:hover': { boxShadow: 4 },
                }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                      {category.icon}
                    </Avatar>
                    <Typography variant="h6">{category.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category.description}
                    </Typography>
                    <Chip label={`${category.articleCount} articles`} size="small" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Popular Articles */}
      {searchQuery === '' && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Popular Articles
          </Typography>
          <Grid container spacing={2}>
            {articles
              .sort((a, b) => (b.views || 0) - (a.views || 0))
              .slice(0, 6)
              .map((article) => (
                <Grid item xs={12} sm={6} key={article.id}>
                  <Card
                    sx={{ cursor: 'pointer', '&:hover': { boxShadow: 2 } }}
                    onClick={() => handleArticleClick(article)}
                  >
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar>{getArticleIcon(article.type)}</Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" noWrap>
                            {article.title}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="caption" color="text.secondary">
                              {article.views} views
                            </Typography>
                            <Chip label={article.type} size="small" />
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      )}

      {/* Search Results */}
      {searchQuery !== '' && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Search Results ({filteredArticles.length})
          </Typography>
          <Stack spacing={1}>
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => handleArticleClick(article)}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    {getArticleIcon(article.type)}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1">{article.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {categories.find((c) => c.id === article.category)?.name}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Stack>
  );

  const renderCategory = () => {
    const category = categories.find((c) => c.id === selectedCategory);
    if (!category) return null;

    return (
      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64 }}>
              {category.icon}
            </Avatar>
            <Box>
              <Typography variant="h4">{category.name}</Typography>
              <Typography variant="body1" color="text.secondary">
                {category.description}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Typography variant="h6">
          {filteredArticles.length} {filteredArticles.length === 1 ? 'Article' : 'Articles'}
        </Typography>

        <List>
          {filteredArticles.map((article) => (
            <ListItem key={article.id} disablePadding>
              <ListItemButton onClick={() => handleArticleClick(article)}>
                <ListItemIcon>{getArticleIcon(article.type)}</ListItemIcon>
                <ListItemText
                  primary={article.title}
                  secondary={
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      <Chip label={article.type} size="small" />
                      <Typography variant="caption">{article.views} views</Typography>
                    </Stack>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Stack>
    );
  };

  const renderArticle = () => {
    if (!selectedArticle) return null;

    const feedback = userFeedback[selectedArticle.id];

    return (
      <Stack spacing={3}>
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {selectedArticle.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label={selectedArticle.type} size="small" color="primary" />
                <Typography variant="caption" color="text.secondary">
                  {selectedArticle.views} views
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  • Updated {selectedArticle.lastUpdated?.toLocaleDateString()}
                </Typography>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              <IconButton size="small">
                <ShareIcon />
              </IconButton>
              <IconButton size="small">
                <PrintIcon />
              </IconButton>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ '& h1': { fontSize: '2rem', mt: 3, mb: 2 }, '& h2': { fontSize: '1.5rem', mt: 2, mb: 1 }, '& h3': { fontSize: '1.25rem', mt: 2, mb: 1 }, '& p': { mb: 1 }, '& ul, & ol': { pl: 3, mb: 2 } }}>
            <Typography component="div" sx={{ whiteSpace: 'pre-wrap' }}>
              {selectedArticle.content}
            </Typography>
          </Box>
        </Paper>

        {/* Feedback */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Was this article helpful?
          </Typography>
          {feedback === null || feedback === undefined ? (
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<LikeIcon />}
                onClick={() => handleFeedback(true)}
              >
                Yes
              </Button>
              <Button
                variant="outlined"
                startIcon={<DislikeIcon />}
                onClick={() => handleFeedback(false)}
              >
                No
              </Button>
            </Stack>
          ) : (
            <Typography variant="body1" color="success.main">
              Thank you for your feedback!
            </Typography>
          )}
        </Paper>

        {/* Related Articles */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Related Articles
          </Typography>
          <Grid container spacing={2}>
            {articles
              .filter(
                (a) =>
                  a.id !== selectedArticle.id &&
                  a.category === selectedArticle.category
              )
              .slice(0, 3)
              .map((article) => (
                <Grid item xs={12} sm={4} key={article.id}>
                  <Card
                    sx={{ cursor: 'pointer', height: '100%', '&:hover': { boxShadow: 2 } }}
                    onClick={() => handleArticleClick(article)}
                  >
                    <CardContent>
                      <Stack spacing={1}>
                        <Avatar>{getArticleIcon(article.type)}</Avatar>
                        <Typography variant="subtitle2">{article.title}</Typography>
                        <Chip label={article.type} size="small" />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      </Stack>
    );
  };

  return (
    <Box>
      {view !== 'home' && renderBreadcrumbs()}
      {view === 'home' && renderHome()}
      {view === 'category' && renderCategory()}
      {view === 'article' && renderArticle()}
    </Box>
  );
}
