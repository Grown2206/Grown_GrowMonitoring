import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Link,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Search as SearchIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags?: string[];
  helpful?: number;
  notHelpful?: number;
  relatedLinks?: Array<{
    title: string;
    url: string;
  }>;
}

export interface FAQSectionProps {
  faqs?: FAQItem[];
  categories?: Array<{ id: string; label: string }>;
  onFeedback?: (faqId: string, helpful: boolean) => void;
  defaultExpanded?: string;
}

const defaultCategories = [
  { id: 'all', label: 'All Questions' },
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'plants', label: 'Plants' },
  { id: 'sensors', label: 'Sensors' },
  { id: 'troubleshooting', label: 'Troubleshooting' },
  { id: 'billing', label: 'Billing & Account' },
];

const defaultFAQs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I get started with the Grow Monitoring System?',
    answer: `Getting started is easy! Follow these steps:

1. Complete your profile setup
2. Connect your environmental sensors
3. Add your first plant to the system
4. Configure monitoring schedules
5. Customize your dashboard

We recommend starting with our "Add Your First Plant" tutorial, which walks you through the entire process step-by-step.`,
    category: 'getting-started',
    tags: ['onboarding', 'setup'],
    helpful: 145,
    notHelpful: 8,
    relatedLinks: [
      { title: 'Quick Start Guide', url: '#' },
      { title: 'Video Tutorial', url: '#' },
    ],
  },
  {
    id: 'faq-2',
    question: 'What types of sensors are supported?',
    answer: `We support a wide range of environmental sensors including:

- Temperature sensors (DHT11, DHT22, DS18B20)
- Humidity sensors
- Light/PAR sensors
- Soil moisture sensors
- pH sensors
- CO2 sensors
- Custom sensors via API

All sensors can be connected via WiFi, Bluetooth, or USB depending on the model. Check our sensor compatibility guide for the complete list.`,
    category: 'sensors',
    tags: ['sensors', 'compatibility', 'hardware'],
    helpful: 98,
    notHelpful: 5,
    relatedLinks: [
      { title: 'Sensor Compatibility Guide', url: '#' },
      { title: 'Sensor Setup Tutorial', url: '#' },
    ],
  },
  {
    id: 'faq-3',
    question: 'How do I configure optimal growth ranges for my plants?',
    answer: `To set optimal growth ranges:

1. Go to your plant's detail page
2. Click "Edit Settings"
3. Scroll to "Environmental Ranges"
4. Set min/max values for:
   - Temperature
   - Humidity
   - Light intensity
   - Soil moisture

The system will alert you when conditions fall outside these ranges. We provide default values based on common plant species, but you can customize them based on your specific needs.`,
    category: 'plants',
    tags: ['plants', 'configuration', 'alerts'],
    helpful: 76,
    notHelpful: 3,
  },
  {
    id: 'faq-4',
    question: 'Why am I not receiving sensor data?',
    answer: `If you're not receiving sensor data, try these troubleshooting steps:

1. **Check sensor connection**
   - Verify the sensor is powered on
   - Check WiFi/Bluetooth connection
   - Ensure sensor is within range

2. **Verify sensor configuration**
   - Check sensor settings in the app
   - Ensure correct sensor type is selected
   - Verify calibration settings

3. **Test the connection**
   - Use the "Test Connection" feature
   - Check sensor status in device list
   - Review error logs

4. **Restart if needed**
   - Power cycle the sensor
   - Restart the monitoring system
   - Re-pair the device if necessary

If issues persist, contact support with your sensor model and error logs.`,
    category: 'troubleshooting',
    tags: ['troubleshooting', 'sensors', 'connection'],
    helpful: 134,
    notHelpful: 12,
    relatedLinks: [
      { title: 'Troubleshooting Guide', url: '#' },
      { title: 'Contact Support', url: '#' },
    ],
  },
  {
    id: 'faq-5',
    question: 'Can I export my plant growth data?',
    answer: `Yes! You can export your data in multiple formats:

- **CSV**: For use in spreadsheets
- **JSON**: For developers and API integration
- **Excel**: With charts and formatting
- **PDF**: For reports and documentation

To export data:
1. Navigate to the Reports section
2. Select the data range and plants
3. Choose your preferred format
4. Click "Export"

You can also schedule automatic exports to be delivered via email.`,
    category: 'getting-started',
    tags: ['export', 'data', 'reports'],
    helpful: 89,
    notHelpful: 4,
  },
  {
    id: 'faq-6',
    question: 'How do I change my subscription plan?',
    answer: `To change your subscription plan:

1. Go to Settings > Billing & Account
2. Click "Manage Subscription"
3. Select your new plan
4. Review changes and confirm

Changes take effect immediately. If upgrading, you'll be charged the prorated difference. If downgrading, the credit will be applied to your next billing cycle.

Need help choosing a plan? Contact our sales team for a personalized recommendation.`,
    category: 'billing',
    tags: ['billing', 'subscription', 'account'],
    helpful: 67,
    notHelpful: 2,
  },
  {
    id: 'faq-7',
    question: 'How often should I calibrate my sensors?',
    answer: `Calibration frequency depends on the sensor type:

- **Temperature/Humidity**: Every 6-12 months
- **pH sensors**: Every 1-3 months
- **Soil moisture**: Every 3-6 months
- **Light sensors**: Every 6-12 months

Signs you need recalibration:
- Readings seem inaccurate
- Sudden unexplained changes
- After sensor has been moved
- After extreme environmental conditions

The system will remind you when calibration is recommended based on your sensor usage.`,
    category: 'sensors',
    tags: ['sensors', 'calibration', 'maintenance'],
    helpful: 92,
    notHelpful: 6,
  },
  {
    id: 'faq-8',
    question: 'Can I monitor multiple locations?',
    answer: `Yes! The system supports monitoring multiple locations:

- Create location groups (e.g., "Greenhouse 1", "Indoor Garden")
- Assign plants and sensors to each location
- View data by location or across all locations
- Set location-specific alerts and preferences

Location management is available in all paid plans. Free plans are limited to one location.`,
    category: 'getting-started',
    tags: ['locations', 'organization', 'setup'],
    helpful: 54,
    notHelpful: 1,
  },
];

/**
 * Frequently Asked Questions section with search and categories
 */
export function FAQSection({
  faqs: customFAQs,
  categories: customCategories,
  onFeedback,
  defaultExpanded,
}: FAQSectionProps) {
  const faqs = customFAQs || defaultFAQs;
  const categories = customCategories || defaultCategories;

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<string | false>(defaultExpanded || false);
  const [userFeedback, setUserFeedback] = useState<Record<string, boolean | null>>({});

  const handleAccordionChange = (panel: string) => (
    _: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleFeedback = (faqId: string, helpful: boolean) => {
    setUserFeedback({ ...userFeedback, [faqId]: helpful });
    if (onFeedback) {
      onFeedback(faqId, helpful);
    }
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  // Sort by helpfulness
  const sortedFAQs = [...filteredFAQs].sort((a, b) => {
    const aScore = (a.helpful || 0) - (a.notHelpful || 0);
    const bScore = (b.helpful || 0) - (b.notHelpful || 0);
    return bScore - aScore;
  });

  return (
    <Box>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find answers to common questions about the Grow Monitoring System
          </Typography>
        </Box>

        {/* Search */}
        <Paper sx={{ p: 2 }}>
          <TextField
            placeholder="Search FAQs..."
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
        </Paper>

        {/* Categories */}
        <Paper>
          <Tabs
            value={selectedCategory}
            onChange={(_, value) => setSelectedCategory(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {categories.map((category) => (
              <Tab key={category.id} value={category.id} label={category.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Results count */}
        <Typography variant="body2" color="text.secondary">
          {sortedFAQs.length} {sortedFAQs.length === 1 ? 'question' : 'questions'} found
        </Typography>

        {/* FAQ List */}
        {sortedFAQs.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No questions found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or browse different categories
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={1}>
            {sortedFAQs.map((faq) => {
              const feedback = userFeedback[faq.id];
              return (
                <Accordion
                  key={faq.id}
                  expanded={expanded === faq.id}
                  onChange={handleAccordionChange(faq.id)}
                >
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ flex: 1 }}>
                        {faq.question}
                      </Typography>
                      {faq.tags && faq.tags.length > 0 && (
                        <Stack direction="row" spacing={0.5}>
                          {faq.tags.slice(0, 2).map((tag) => (
                            <Chip key={tag} label={tag} size="small" />
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {/* Answer */}
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {faq.answer}
                      </Typography>

                      {/* Related Links */}
                      {faq.relatedLinks && faq.relatedLinks.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Related Articles
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                            {faq.relatedLinks.map((link, index) => (
                              <Chip
                                key={index}
                                label={link.title}
                                size="small"
                                component="a"
                                href={link.url}
                                clickable
                              />
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {/* Feedback */}
                      <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="body2">Was this helpful?</Typography>
                          {feedback === null || feedback === undefined ? (
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleFeedback(faq.id, true)}
                              >
                                <LikeIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleFeedback(faq.id, false)}
                              >
                                <DislikeIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          ) : (
                            <Typography variant="body2" color="success.main">
                              Thank you for your feedback!
                            </Typography>
                          )}
                        </Stack>
                        {faq.helpful !== undefined && (
                          <Typography variant="caption" color="text.secondary">
                            {faq.helpful} people found this helpful
                          </Typography>
                        )}
                      </Paper>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Stack>
        )}

        {/* Still need help */}
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light' }}>
          <Typography variant="h6" gutterBottom>
            Still need help?
          </Typography>
          <Typography variant="body2" paragraph>
            Can't find what you're looking for? Our support team is here to help.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Link href="#" underline="none">
              <Chip label="Contact Support" clickable />
            </Link>
            <Link href="#" underline="none">
              <Chip label="Browse Help Center" clickable />
            </Link>
          </Stack>
        </Paper>
      </Stack>
    </Box>
  );
}
