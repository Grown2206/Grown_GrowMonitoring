import React, { useState } from 'react';
import {
  Box, Card, CardContent, Chip, Grid, Stack, Typography, Paper, List, ListItem, ListItemText,
  Alert, Button, LinearProgress,
} from '@mui/material';
import { CheckCircle as SuccessIcon, Warning as WarningIcon, Error as ErrorIcon, Info as InfoIcon } from '@mui/icons-material';

export interface OptimizationSuggestion {
  id: string;
  category: 'performance' | 'security' | 'scalability' | 'cost';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  implemented: boolean;
}

export interface OptimizationAnalyzerProps {
  suggestions?: OptimizationSuggestion[];
  onImplement?: (id: string) => void;
}

export function OptimizationAnalyzer({ suggestions: initialSuggestions, onImplement }: OptimizationAnalyzerProps) {
  const [suggestions] = useState<OptimizationSuggestion[]>(initialSuggestions || getSampleSuggestions());

  const criticalCount = suggestions.filter(s => s.severity === 'critical' && !s.implemented).length;
  const implementedCount = suggestions.filter(s => s.implemented).length;
  const implementationRate = ((implementedCount / suggestions.length) * 100).toFixed(0);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Optimization Analyzer</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Performance optimization recommendations
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Suggestions</Typography>
                  <Typography variant="h4">{suggestions.length}</Typography>
                </Box>
                <InfoIcon color="primary" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Critical Issues</Typography>
                  <Typography variant="h4" color="error.main">{criticalCount}</Typography>
                </Box>
                <ErrorIcon color="error" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">Implementation Rate</Typography>
                  <Typography variant="h4">{implementationRate}%</Typography>
                </Box>
                <SuccessIcon color="success" sx={{ fontSize: 40 }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Recommendations</Typography>
          <List>
            {suggestions.map(suggestion => (
              <ListItem key={suggestion.id} component={Paper} sx={{ mb: 1, p: 2 }}>
                <Stack spacing={1} sx={{ width: '100%' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="start">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">{suggestion.title}</Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Chip label={suggestion.category} size="small" variant="outlined" />
                        <Chip label={suggestion.severity} size="small" color={getSeverityColor(suggestion.severity)} />
                        <Chip label={`Effort: ${suggestion.effort}`} size="small" />
                      </Stack>
                    </Box>
                    {!suggestion.implemented && (
                      <Button size="small" variant="contained" onClick={() => onImplement?.(suggestion.id)}>
                        Implement
                      </Button>
                    )}
                    {suggestion.implemented && (
                      <Chip icon={<SuccessIcon />} label="Implemented" color="success" />
                    )}
                  </Stack>
                  <Typography variant="body2">{suggestion.description}</Typography>
                  <Alert severity="info" icon={<InfoIcon />}>
                    <strong>Impact:</strong> {suggestion.impact}
                  </Alert>
                </Stack>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}

function getSampleSuggestions(): OptimizationSuggestion[] {
  return [
    {
      id: '1',
      category: 'performance',
      severity: 'critical',
      title: 'Enable Database Query Caching',
      description: 'Implement Redis caching for frequently accessed plant data queries to reduce database load.',
      impact: 'Could reduce database queries by 60% and improve response time by 300ms',
      effort: 'medium',
      implemented: false,
    },
    {
      id: '2',
      category: 'performance',
      severity: 'high',
      title: 'Optimize Image Loading',
      description: 'Implement lazy loading and image compression for plant photos.',
      impact: 'Reduce initial page load time by 40% and bandwidth usage by 50%',
      effort: 'low',
      implemented: true,
    },
    {
      id: '3',
      category: 'scalability',
      severity: 'medium',
      title: 'Implement Load Balancing',
      description: 'Add load balancer to distribute traffic across multiple API servers.',
      impact: 'Support 10x more concurrent users and improve fault tolerance',
      effort: 'high',
      implemented: false,
    },
    {
      id: '4',
      category: 'cost',
      severity: 'medium',
      title: 'Optimize Storage Usage',
      description: 'Archive old sensor data to cold storage after 90 days.',
      impact: 'Reduce storage costs by 30% annually',
      effort: 'medium',
      implemented: false,
    },
  ];
}
