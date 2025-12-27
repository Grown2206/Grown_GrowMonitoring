import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Tab,
  Tabs,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Button,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon,
  LiveHelp as FaqIcon,
  ContactSupport as SupportIcon,
} from '@mui/icons-material';

export interface HelpArticle {
  id: string;
  title: string;
  category: HelpCategory;
  content: string;
  tags: string[];
  views: number;
  helpful: number;
  lastUpdated: Date;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail: string;
  url: string;
  views: number;
}

export type HelpCategory =
  | 'getting-started'
  | 'plants'
  | 'monitoring'
  | 'reports'
  | 'settings'
  | 'troubleshooting'
  | 'integrations'
  | 'api';

export interface HelpCenterProps {
  articles?: HelpArticle[];
  faqs?: FAQ[];
  videos?: VideoTutorial[];
  onContactSupport?: () => void;
}

export function HelpCenter({
  articles: initialArticles,
  faqs: initialFaqs,
  videos: initialVideos,
  onContactSupport,
}: HelpCenterProps) {
  const [articles] = useState<HelpArticle[]>(initialArticles || getSampleArticles());
  const [faqs] = useState<FAQ[]>(initialFaqs || getSampleFAQs());
  const [videos] = useState<VideoTutorial[]>(initialVideos || getSampleVideos());

  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | 'all'>('all');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  const categories: { value: HelpCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All Topics' },
    { value: 'getting-started', label: 'Getting Started' },
    { value: 'plants', label: 'Plant Management' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'reports', label: 'Reports & Analytics' },
    { value: 'settings', label: 'Settings' },
    { value: 'troubleshooting', label: 'Troubleshooting' },
    { value: 'integrations', label: 'Integrations' },
    { value: 'api', label: 'API Documentation' },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Help Center</Typography>
          <Typography variant="body2" color="text.secondary">
            Find answers, tutorials, and documentation
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<SupportIcon />}
          onClick={onContactSupport}
        >
          Contact Support
        </Button>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search for help articles, FAQs, tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {categories.map((category) => (
              <Chip
                key={category.value}
                label={category.label}
                onClick={() => setSelectedCategory(category.value)}
                color={selectedCategory === category.value ? 'primary' : 'default'}
                variant={selectedCategory === category.value ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<ArticleIcon />} label="Articles" iconPosition="start" />
        <Tab icon={<FaqIcon />} label="FAQs" iconPosition="start" />
        <Tab icon={<VideoIcon />} label="Video Tutorials" iconPosition="start" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={selectedArticle ? 4 : 12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Help Articles ({filteredArticles.length})
                </Typography>
                <List>
                  {filteredArticles.map((article) => (
                    <ListItem key={article.id} disablePadding>
                      <ListItemButton
                        selected={selectedArticle?.id === article.id}
                        onClick={() => setSelectedArticle(article)}
                      >
                        <ListItemText
                          primary={article.title}
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                {article.views} views
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                •
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {article.lastUpdated.toLocaleDateString()}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {filteredArticles.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="No articles found"
                        secondary="Try adjusting your search or category filter"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
          {selectedArticle && (
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        {selectedArticle.title}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {selectedArticle.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </Stack>
                    </Box>
                    <Divider />
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {selectedArticle.content}
                    </Typography>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Last updated: {selectedArticle.lastUpdated.toLocaleDateString()}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button size="small">Was this helpful?</Button>
                        <Button size="small" variant="outlined">
                          {selectedArticle.helpful} found helpful
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Frequently Asked Questions ({filteredFAQs.length})
            </Typography>
            {filteredFAQs.map((faq) => (
              <Accordion key={faq.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {faq.answer}
                    </Typography>
                    <Stack direction="row" justifyContent="flex-end">
                      <Button size="small">
                        {faq.helpful} found this helpful
                      </Button>
                    </Stack>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
            {filteredFAQs.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No FAQs found. Try adjusting your search or category filter.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          {filteredVideos.map((video) => (
            <Grid item xs={12} md={6} lg={4} key={video.id}>
              <Card>
                <Box
                  sx={{
                    height: 200,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <VideoIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                </Box>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {video.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {video.description}
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                      {video.duration} • {video.views} views
                    </Typography>
                    <Button size="small" variant="outlined">
                      Watch
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {filteredVideos.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    No video tutorials found. Try adjusting your search or category filter.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}

function getSampleArticles(): HelpArticle[] {
  return [
    {
      id: '1',
      title: 'Getting Started with Grow Monitoring',
      category: 'getting-started',
      content: `Welcome to the Grow Monitoring System!

This guide will help you get started with monitoring your plants and tracking their growth.

Step 1: Add Your First Plant
Navigate to the Plants section and click "Add Plant". Fill in the basic information including species, strain, and planting date.

Step 2: Set Up Monitoring
Configure sensors and monitoring schedules for your plants. You can track temperature, humidity, pH levels, and more.

Step 3: View Dashboard
Check your dashboard regularly to monitor plant health, growth progress, and environmental conditions.

Step 4: Generate Reports
Use the reporting tools to analyze growth patterns and optimize your cultivation process.`,
      tags: ['basics', 'setup', 'introduction'],
      views: 1250,
      helpful: 98,
      lastUpdated: new Date('2024-12-01'),
    },
    {
      id: '2',
      title: 'Understanding Sensor Data',
      category: 'monitoring',
      content: `Learn how to interpret sensor readings and optimize growing conditions.

Temperature Readings:
- Optimal range: 20-28°C (68-82°F)
- Monitor daily fluctuations
- Adjust climate control as needed

Humidity Levels:
- Vegetative stage: 60-70%
- Flowering stage: 40-50%
- Use dehumidifiers or humidifiers to maintain levels

pH Monitoring:
- Soil: 6.0-7.0
- Hydroponic: 5.5-6.5
- Regular calibration is essential`,
      tags: ['sensors', 'data', 'monitoring', 'environmental'],
      views: 890,
      helpful: 75,
      lastUpdated: new Date('2024-12-10'),
    },
    {
      id: '3',
      title: 'Creating Custom Reports',
      category: 'reports',
      content: `Generate detailed reports to track and analyze plant growth.

Report Types:
1. Growth Reports - Track plant development over time
2. Environmental Reports - Monitor conditions and trends
3. Harvest Reports - Document yields and quality metrics
4. Compliance Reports - Maintain regulatory documentation

Customization Options:
- Select date ranges
- Choose specific plants or batches
- Filter by growth stage
- Export to PDF or Excel`,
      tags: ['reports', 'analytics', 'data-export'],
      views: 654,
      helpful: 62,
      lastUpdated: new Date('2024-12-15'),
    },
    {
      id: '4',
      title: 'Troubleshooting Common Issues',
      category: 'troubleshooting',
      content: `Solutions to common problems you may encounter.

Issue: Sensor Not Responding
- Check power connection
- Verify network connectivity
- Restart the sensor
- Contact support if issue persists

Issue: Inaccurate Readings
- Calibrate sensors regularly
- Check sensor placement
- Clean sensor components
- Replace if necessary

Issue: Missing Data
- Check data connection
- Verify backup systems
- Review system logs
- Restore from backup if needed`,
      tags: ['troubleshooting', 'sensors', 'support'],
      views: 432,
      helpful: 45,
      lastUpdated: new Date('2024-12-18'),
    },
  ];
}

function getSampleFAQs(): FAQ[] {
  return [
    {
      id: '1',
      question: 'How often should I calibrate my sensors?',
      answer: `Sensor calibration frequency depends on the type of sensor:

pH Sensors: Weekly calibration recommended
Temperature Sensors: Monthly calibration
Humidity Sensors: Bi-weekly calibration
EC/TDS Sensors: Weekly calibration

Always calibrate before critical measurements and after any maintenance.`,
      category: 'monitoring',
      helpful: 156,
    },
    {
      id: '2',
      question: 'Can I export my data to other systems?',
      answer: `Yes! The system supports multiple export formats:

- CSV for spreadsheet applications
- JSON for API integration
- PDF for reports and documentation
- Excel for advanced analysis

You can also use our REST API to integrate with third-party systems.`,
      category: 'integrations',
      helpful: 142,
    },
    {
      id: '3',
      question: 'How do I set up automated alerts?',
      answer: `To configure automated alerts:

1. Navigate to Settings > Notifications
2. Click "Add Alert Rule"
3. Select the condition (e.g., temperature threshold)
4. Set the trigger value
5. Choose notification method (email, SMS, in-app)
6. Save the rule

Alerts will be sent when conditions are met.`,
      category: 'settings',
      helpful: 128,
    },
    {
      id: '4',
      question: 'What is the recommended backup schedule?',
      answer: `We recommend the following backup schedule:

Daily: Incremental backups of current data
Weekly: Full system backup
Monthly: Archive to long-term storage

Enable automatic backups in Settings > Backup Configuration.
Always test restore procedures regularly.`,
      category: 'settings',
      helpful: 95,
    },
    {
      id: '5',
      question: 'How many plants can I monitor simultaneously?',
      answer: `The number of plants depends on your subscription plan:

Basic: Up to 50 plants
Professional: Up to 500 plants
Enterprise: Unlimited plants

Contact sales for custom enterprise solutions.`,
      category: 'getting-started',
      helpful: 203,
    },
  ];
}

function getSampleVideos(): VideoTutorial[] {
  return [
    {
      id: '1',
      title: 'Quick Start Guide',
      description: 'Learn the basics of the Grow Monitoring System in under 5 minutes',
      duration: '4:32',
      category: 'getting-started',
      thumbnail: '/videos/quick-start.jpg',
      url: '/videos/quick-start.mp4',
      views: 2340,
    },
    {
      id: '2',
      title: 'Setting Up Sensors',
      description: 'Complete guide to installing and configuring environmental sensors',
      duration: '12:15',
      category: 'monitoring',
      thumbnail: '/videos/sensor-setup.jpg',
      url: '/videos/sensor-setup.mp4',
      views: 1876,
    },
    {
      id: '3',
      title: 'Advanced Reporting Techniques',
      description: 'Master the report builder and create custom analytics dashboards',
      duration: '18:45',
      category: 'reports',
      thumbnail: '/videos/advanced-reports.jpg',
      url: '/videos/advanced-reports.mp4',
      views: 1234,
    },
    {
      id: '4',
      title: 'Mobile App Tutorial',
      description: 'Access your grow monitoring system from anywhere with the mobile app',
      duration: '8:20',
      category: 'getting-started',
      thumbnail: '/videos/mobile-app.jpg',
      url: '/videos/mobile-app.mp4',
      views: 1567,
    },
    {
      id: '5',
      title: 'API Integration Guide',
      description: 'Connect external systems using our REST API',
      duration: '22:10',
      category: 'integrations',
      thumbnail: '/videos/api-integration.jpg',
      url: '/videos/api-integration.mp4',
      views: 892,
    },
    {
      id: '6',
      title: 'Troubleshooting Common Issues',
      description: 'Solutions to frequently encountered problems and error messages',
      duration: '15:30',
      category: 'troubleshooting',
      thumbnail: '/videos/troubleshooting.jpg',
      url: '/videos/troubleshooting.mp4',
      views: 1045,
    },
  ];
}
