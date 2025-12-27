import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  Breadcrumbs,
  Link,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  NavigateNext as NavigateNextIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

export interface DocSection {
  id: string;
  title: string;
  content: string;
  subsections?: DocSection[];
  lastUpdated: Date;
  version: string;
}

export interface Documentation {
  id: string;
  title: string;
  description: string;
  sections: DocSection[];
  category: DocCategory;
  version: string;
}

export type DocCategory =
  | 'api'
  | 'user-guide'
  | 'developer'
  | 'admin'
  | 'integration';

export interface DocumentationViewerProps {
  documentation?: Documentation[];
  onPrint?: (docId: string, sectionId?: string) => void;
  onDownload?: (docId: string, format: 'pdf' | 'markdown') => void;
}

export function DocumentationViewer({
  documentation: initialDocumentation,
  onPrint,
  onDownload,
}: DocumentationViewerProps) {
  const [documentation] = useState<Documentation[]>(
    initialDocumentation || getSampleDocumentation()
  );

  const [selectedDoc, setSelectedDoc] = useState<Documentation | null>(documentation[0] || null);
  const [selectedSection, setSelectedSection] = useState<DocSection | null>(
    documentation[0]?.sections[0] || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const handleSectionClick = (section: DocSection) => {
    setSelectedSection(section);
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getBreadcrumbs = () => {
    if (!selectedDoc || !selectedSection) return [];
    
    const breadcrumbs = [selectedDoc.title];
    const findPath = (sections: DocSection[], target: DocSection, path: string[] = []): string[] | null => {
      for (const section of sections) {
        if (section.id === target.id) {
          return [...path, section.title];
        }
        if (section.subsections) {
          const result = findPath(section.subsections, target, [...path, section.title]);
          if (result) return result;
        }
      }
      return null;
    };

    const path = findPath(selectedDoc.sections, selectedSection);
    return path ? [...breadcrumbs, ...path] : breadcrumbs;
  };

  const renderSectionTree = (sections: DocSection[], level = 0) => {
    return sections.map((section) => (
      <Box key={section.id}>
        <ListItemButton
          selected={selectedSection?.id === section.id}
          onClick={() => handleSectionClick(section)}
          sx={{ pl: 2 + level * 2 }}
        >
          {section.subsections && section.subsections.length > 0 && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                toggleSection(section.id);
              }}
              sx={{ mr: 1 }}
            >
              {expandedSections[section.id] ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </IconButton>
          )}
          <ListItemText primary={section.title} />
        </ListItemButton>
        {section.subsections && section.subsections.length > 0 && (
          <Collapse in={expandedSections[section.id]} timeout="auto" unmountOnExit>
            {renderSectionTree(section.subsections, level + 1)}
          </Collapse>
        )}
      </Box>
    ));
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 200px)' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 280,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 280,
            position: 'relative',
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Documentation
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search docs..."
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
          <List>
            {documentation.map((doc) => (
              <ListItem key={doc.id} disablePadding>
                <ListItemButton
                  selected={selectedDoc?.id === doc.id}
                  onClick={() => {
                    setSelectedDoc(doc);
                    setSelectedSection(doc.sections[0]);
                  }}
                >
                  <ListItemText
                    primary={doc.title}
                    secondary={doc.version}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex' }}>
        {selectedDoc && (
          <>
            <Box
              sx={{
                width: 250,
                borderRight: 1,
                borderColor: 'divider',
                overflowY: 'auto',
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Table of Contents
                </Typography>
                <List dense>
                  {renderSectionTree(selectedDoc.sections)}
                </List>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1, p: 3, overflowY: 'auto' }}>
              {selectedSection && (
                <Card>
                  <CardContent>
                    <Stack spacing={3}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                            {getBreadcrumbs().map((crumb, index) => (
                              <Typography
                                key={index}
                                color={index === getBreadcrumbs().length - 1 ? 'text.primary' : 'text.secondary'}
                                variant={index === getBreadcrumbs().length - 1 ? 'body1' : 'body2'}
                              >
                                {crumb}
                              </Typography>
                            ))}
                          </Breadcrumbs>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => onPrint?.(selectedDoc.id, selectedSection.id)}
                            >
                              <PrintIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => onDownload?.(selectedDoc.id, 'pdf')}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>

                      <Box>
                        <Typography variant="h4" gutterBottom>
                          {selectedSection.title}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`Version ${selectedSection.version}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Last updated: {selectedSection.lastUpdated.toLocaleDateString()}
                          </Typography>
                        </Stack>
                      </Box>

                      <Divider />

                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: 'pre-line',
                          '& code': {
                            bgcolor: 'grey.100',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontFamily: 'monospace',
                          },
                        }}
                      >
                        {selectedSection.content}
                      </Typography>

                      {selectedSection.subsections && selectedSection.subsections.length > 0 && (
                        <>
                          <Divider />
                          <Box>
                            <Typography variant="h6" gutterBottom>
                              In This Section
                            </Typography>
                            <List>
                              {selectedSection.subsections.map((subsection) => (
                                <ListItem key={subsection.id} disablePadding>
                                  <ListItemButton onClick={() => handleSectionClick(subsection)}>
                                    <ChevronRightIcon sx={{ mr: 1 }} />
                                    <ListItemText primary={subsection.title} />
                                  </ListItemButton>
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

function getSampleDocumentation(): Documentation[] {
  return [
    {
      id: '1',
      title: 'API Reference',
      description: 'Complete REST API documentation',
      category: 'api',
      version: '2.0.0',
      sections: [
        {
          id: 'api-intro',
          title: 'Introduction',
          version: '2.0.0',
          lastUpdated: new Date('2024-12-20'),
          content: `Welcome to the Grow Monitoring System API documentation.

This API provides programmatic access to all features of the Grow Monitoring System. The API follows REST principles and returns JSON responses.

Base URL: https://api.growmonitoring.com/v2

Authentication:
All API requests require authentication using an API key. Include your API key in the Authorization header:

Authorization: Bearer YOUR_API_KEY

Rate Limiting:
- Free tier: 100 requests per hour
- Professional: 1,000 requests per hour
- Enterprise: Unlimited

Response Format:
All responses follow a consistent format:

{
  "success": true,
  "data": {...},
  "meta": {
    "timestamp": "2024-12-20T10:30:00Z",
    "version": "2.0.0"
  }
}`,
          subsections: [
            {
              id: 'api-auth',
              title: 'Authentication',
              version: '2.0.0',
              lastUpdated: new Date('2024-12-20'),
              content: `API Key Authentication

To authenticate requests, include your API key in the Authorization header:

Authorization: Bearer YOUR_API_KEY

Obtaining an API Key:
1. Log in to your account
2. Navigate to Settings > API Keys
3. Click "Generate New Key"
4. Copy and securely store your key

Security Best Practices:
- Never commit API keys to version control
- Rotate keys regularly
- Use environment variables for key storage
- Implement IP whitelisting when possible`,
            },
          ],
        },
        {
          id: 'api-plants',
          title: 'Plants Endpoints',
          version: '2.0.0',
          lastUpdated: new Date('2024-12-20'),
          content: `Plant Management API

List All Plants
GET /api/plants

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- status: Filter by status (active, harvested, etc.)

Response:
{
  "success": true,
  "data": {
    "plants": [...],
    "total": 150,
    "page": 1,
    "totalPages": 8
  }
}

Get Plant Details
GET /api/plants/:id

Create New Plant
POST /api/plants

Request Body:
{
  "name": "Plant Name",
  "species": "Cannabis Sativa",
  "strain": "Strain Name",
  "plantedDate": "2024-01-01"
}`,
        },
      ],
    },
    {
      id: '2',
      title: 'User Guide',
      description: 'Complete guide for end users',
      category: 'user-guide',
      version: '2.70.0',
      sections: [
        {
          id: 'ug-getting-started',
          title: 'Getting Started',
          version: '2.70.0',
          lastUpdated: new Date('2024-12-20'),
          content: `Welcome to the Grow Monitoring System!

This comprehensive guide will help you get started with monitoring and managing your grow operations.

Quick Start:
1. Create your account
2. Set up your facility
3. Add plants to the system
4. Configure monitoring devices
5. Start tracking growth

System Requirements:
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Stable internet connection
- Compatible sensors and monitoring devices

Initial Setup:
After creating your account, you'll be guided through a setup wizard that will help you configure your facility, add team members, and connect your monitoring devices.`,
        },
        {
          id: 'ug-dashboard',
          title: 'Dashboard Overview',
          version: '2.70.0',
          lastUpdated: new Date('2024-12-20'),
          content: `Understanding Your Dashboard

The main dashboard provides a real-time overview of your entire grow operation.

Key Metrics:
- Total Active Plants
- Environmental Conditions
- Recent Alerts
- Growth Progress

Customization:
You can customize your dashboard by:
- Adding/removing widgets
- Rearranging layout
- Setting refresh intervals
- Configuring alert thresholds

The dashboard updates in real-time, ensuring you always have the most current information about your grow operation.`,
        },
      ],
    },
    {
      id: '3',
      title: 'Developer Guide',
      description: 'Integration and development documentation',
      category: 'developer',
      version: '2.0.0',
      sections: [
        {
          id: 'dev-intro',
          title: 'Developer Overview',
          version: '2.0.0',
          lastUpdated: new Date('2024-12-20'),
          content: `Developer Documentation

This guide is for developers integrating with the Grow Monitoring System or building custom extensions.

Available Integration Methods:
- REST API
- WebSocket for real-time data
- Webhooks for event notifications
- SDK libraries (JavaScript, Python, Go)

Development Environment:
We provide a sandbox environment for testing integrations without affecting production data.

Sandbox URL: https://sandbox-api.growmonitoring.com/v2

Support:
Developer support is available via:
- API documentation
- Code examples
- Developer forum
- Email support`,
        },
      ],
    },
  ];
}
