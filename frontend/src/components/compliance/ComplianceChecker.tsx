import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ExpandMore as ExpandIcon,
  Refresh as RefreshIcon,
  Assignment as ReportIcon,
  Security as SecurityIcon,
  Lock as PrivacyIcon,
  Policy as PolicyIcon,
  Gavel as RegulatoryIcon,
  VerifiedUser as CertificationIcon,
} from '@mui/icons-material';

export type ComplianceStatus = 'pass' | 'fail' | 'warning' | 'not-applicable';
export type ComplianceStandard = 'gdpr' | 'iso27001' | 'soc2' | 'hipaa' | 'custom';

export interface ComplianceCheck {
  id: string;
  standard: ComplianceStandard;
  category: string;
  requirement: string;
  description: string;
  status: ComplianceStatus;
  lastChecked: Date;
  evidence?: string[];
  notes?: string;
  recommendations?: string[];
}

export interface ComplianceReport {
  standard: ComplianceStandard;
  checks: ComplianceCheck[];
  overallStatus: ComplianceStatus;
  passRate: number;
  lastAudit: Date;
}

export interface ComplianceCheckerProps {
  reports?: ComplianceReport[];
  onRunCheck?: (standard: ComplianceStandard) => Promise<void>;
  onGenerateReport?: (standard: ComplianceStandard) => void;
}

/**
 * Compliance checker and reporting tool
 */
export function ComplianceChecker({
  reports: initialReports = [],
  onRunCheck,
  onGenerateReport,
}: ComplianceCheckerProps) {
  const [reports, setReports] = useState<ComplianceReport[]>(
    initialReports.length > 0 ? initialReports : getSampleReports()
  );
  const [running, setRunning] = useState<ComplianceStandard | null>(null);

  const handleRunCheck = async (standard: ComplianceStandard) => {
    setRunning(standard);
    try {
      await onRunCheck?.(standard);
      // Update last checked time
      setReports(
        reports.map((r) =>
          r.standard === standard
            ? {
                ...r,
                lastAudit: new Date(),
                checks: r.checks.map((c) => ({ ...c, lastChecked: new Date() })),
              }
            : r
        )
      );
    } finally {
      setRunning(null);
    }
  };

  const getStatusIcon = (status: ComplianceStatus) => {
    switch (status) {
      case 'pass':
        return <PassIcon color="success" />;
      case 'fail':
        return <FailIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'not-applicable':
        return <InfoIcon color="disabled" />;
    }
  };

  const getStatusColor = (status: ComplianceStatus) => {
    switch (status) {
      case 'pass':
        return 'success';
      case 'fail':
        return 'error';
      case 'warning':
        return 'warning';
      case 'not-applicable':
        return 'default';
    }
  };

  const getStandardIcon = (standard: ComplianceStandard) => {
    switch (standard) {
      case 'gdpr':
        return <PrivacyIcon />;
      case 'iso27001':
        return <SecurityIcon />;
      case 'soc2':
        return <CertificationIcon />;
      case 'hipaa':
        return <PolicyIcon />;
      case 'custom':
        return <RegulatoryIcon />;
    }
  };

  const getStandardName = (standard: ComplianceStandard) => {
    switch (standard) {
      case 'gdpr':
        return 'GDPR';
      case 'iso27001':
        return 'ISO 27001';
      case 'soc2':
        return 'SOC 2';
      case 'hipaa':
        return 'HIPAA';
      case 'custom':
        return 'Custom Policy';
    }
  };

  const groupChecksByCategory = (checks: ComplianceCheck[]) => {
    const grouped: Record<string, ComplianceCheck[]> = {};
    checks.forEach((check) => {
      if (!grouped[check.category]) {
        grouped[check.category] = [];
      }
      grouped[check.category].push(check);
    });
    return grouped;
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5">Compliance Checker</Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and verify regulatory compliance
          </Typography>
        </Box>
      </Stack>

      {/* Overall Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {reports.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.standard}>
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                      {getStandardIcon(report.standard)}
                      <Typography variant="h6">{getStandardName(report.standard)}</Typography>
                    </Stack>
                    <Chip
                      icon={getStatusIcon(report.overallStatus)}
                      label={report.overallStatus}
                      size="small"
                      color={getStatusColor(report.overallStatus) as any}
                    />
                  </Stack>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Pass Rate
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {report.passRate}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={report.passRate}
                      color={report.passRate >= 80 ? 'success' : report.passRate >= 60 ? 'warning' : 'error'}
                    />
                  </Box>
                  <Divider />
                  <Stack direction="row" spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Last audit: {report.lastAudit.toLocaleDateString()}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={() => handleRunCheck(report.standard)}
                      disabled={running === report.standard}
                    >
                      {running === report.standard ? 'Running...' : 'Run Check'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ReportIcon />}
                      onClick={() => onGenerateReport?.(report.standard)}
                    >
                      Report
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Detailed Checks */}
      <Stack spacing={2}>
        {reports.map((report) => {
          const groupedChecks = groupChecksByCategory(report.checks);

          return (
            <Card key={report.standard}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {getStandardIcon(report.standard)}
                    <span>{getStandardName(report.standard)} Requirements</span>
                  </Stack>
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {Object.entries(groupedChecks).map(([category, checks]) => (
                  <Accordion key={category}>
                    <AccordionSummary expandIcon={<ExpandIcon />}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                        <Typography variant="subtitle1">{category}</Typography>
                        <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                          <Chip
                            label={`${checks.filter((c) => c.status === 'pass').length}/${checks.length} Pass`}
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </Stack>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List>
                        {checks.map((check) => (
                          <React.Fragment key={check.id}>
                            <ListItem
                              sx={{
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                py: 2,
                              }}
                            >
                              <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                  {getStatusIcon(check.status)}
                                </ListItemIcon>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle2">{check.requirement}</Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {check.description}
                                  </Typography>

                                  {check.notes && (
                                    <Alert severity="info" sx={{ mt: 1 }}>
                                      <Typography variant="caption">{check.notes}</Typography>
                                    </Alert>
                                  )}

                                  {check.recommendations && check.recommendations.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Recommendations:
                                      </Typography>
                                      <List dense>
                                        {check.recommendations.map((rec, idx) => (
                                          <ListItem key={idx} sx={{ py: 0 }}>
                                            <Typography variant="caption">• {rec}</Typography>
                                          </ListItem>
                                        ))}
                                      </List>
                                    </Box>
                                  )}

                                  {check.evidence && check.evidence.length > 0 && (
                                    <Box sx={{ mt: 1 }}>
                                      <Typography variant="caption" color="text.secondary">
                                        Evidence:
                                      </Typography>
                                      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                                        {check.evidence.map((ev, idx) => (
                                          <Chip key={idx} label={ev} size="small" variant="outlined" />
                                        ))}
                                      </Stack>
                                    </Box>
                                  )}

                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Last checked: {check.lastChecked.toLocaleString()}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={check.status}
                                  size="small"
                                  color={getStatusColor(check.status) as any}
                                />
                              </Stack>
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))}
                      </List>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}

/**
 * Generate sample compliance reports
 */
function getSampleReports(): ComplianceReport[] {
  return [
    {
      standard: 'gdpr',
      overallStatus: 'pass',
      passRate: 85,
      lastAudit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      checks: [
        {
          id: 'gdpr-1',
          standard: 'gdpr',
          category: 'Data Protection',
          requirement: 'Data Encryption at Rest',
          description: 'All personal data must be encrypted when stored',
          status: 'pass',
          lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          evidence: ['AES-256 encryption enabled', 'Database encryption verified'],
        },
        {
          id: 'gdpr-2',
          standard: 'gdpr',
          category: 'Data Protection',
          requirement: 'Data Encryption in Transit',
          description: 'All data transmissions must use TLS/SSL',
          status: 'pass',
          lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          evidence: ['TLS 1.3 configured', 'HTTPS enforced'],
        },
        {
          id: 'gdpr-3',
          standard: 'gdpr',
          category: 'User Rights',
          requirement: 'Right to Access',
          description: 'Users must be able to access their personal data',
          status: 'pass',
          lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          evidence: ['Data export feature available', 'User profile access'],
        },
        {
          id: 'gdpr-4',
          standard: 'gdpr',
          category: 'User Rights',
          requirement: 'Right to Deletion',
          description: 'Users must be able to request data deletion',
          status: 'warning',
          lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          notes: 'Deletion process takes up to 30 days',
          recommendations: ['Reduce deletion timeframe to 7 days', 'Add automated deletion workflow'],
        },
        {
          id: 'gdpr-5',
          standard: 'gdpr',
          category: 'Consent Management',
          requirement: 'Explicit Consent',
          description: 'Users must provide explicit consent for data processing',
          status: 'pass',
          lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          evidence: ['Consent forms implemented', 'Opt-in mechanisms verified'],
        },
        {
          id: 'gdpr-6',
          standard: 'gdpr',
          category: 'Audit & Logging',
          requirement: 'Audit Trail',
          description: 'All data access must be logged',
          status: 'pass',
          lastChecked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          evidence: ['Comprehensive audit logging', 'Log retention policy active'],
        },
      ],
    },
    {
      standard: 'iso27001',
      overallStatus: 'warning',
      passRate: 72,
      lastAudit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      checks: [
        {
          id: 'iso-1',
          standard: 'iso27001',
          category: 'Access Control',
          requirement: 'Multi-Factor Authentication',
          description: 'MFA must be enabled for all users',
          status: 'warning',
          lastChecked: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          notes: 'MFA optional for standard users',
          recommendations: ['Make MFA mandatory for all users', 'Enforce MFA at system level'],
        },
        {
          id: 'iso-2',
          standard: 'iso27001',
          category: 'Access Control',
          requirement: 'Password Policy',
          description: 'Strong password requirements must be enforced',
          status: 'pass',
          lastChecked: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          evidence: ['Min 8 characters', 'Complexity requirements', 'Password history'],
        },
        {
          id: 'iso-3',
          standard: 'iso27001',
          category: 'Security Monitoring',
          requirement: 'Intrusion Detection',
          description: 'System must monitor for security threats',
          status: 'pass',
          lastChecked: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          evidence: ['IDS/IPS configured', '24/7 monitoring active'],
        },
        {
          id: 'iso-4',
          standard: 'iso27001',
          category: 'Incident Response',
          requirement: 'Incident Response Plan',
          description: 'Documented incident response procedures',
          status: 'pass',
          lastChecked: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          evidence: ['IRP documented', 'Team trained', 'Regular drills conducted'],
        },
      ],
    },
  ];
}
