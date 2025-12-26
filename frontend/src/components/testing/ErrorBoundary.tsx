import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ExpandMore as ExpandIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * Error boundary component for graceful error handling
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    this.props.onReset?.();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Card>
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <ErrorIcon sx={{ fontSize: 80, color: 'error.main' }} />

                <Typography variant="h4" align="center">
                  Oops! Something went wrong
                </Typography>

                <Typography variant="body1" color="text.secondary" align="center">
                  We're sorry, but something unexpected happened. The error has been logged and
                  we'll look into it.
                </Typography>

                {this.state.errorCount > 1 && (
                  <Alert severity="warning">
                    This error has occurred {this.state.errorCount} times. Try reloading the page
                    or returning to the home page.
                  </Alert>
                )}

                {/* Error Details */}
                {this.state.error && (
                  <Accordion sx={{ width: '100%' }}>
                    <AccordionSummary expandIcon={<ExpandIcon />}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BugIcon />
                        <Typography variant="subtitle2">Error Details</Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Error Type
                          </Typography>
                          <Typography variant="body2">
                            {this.state.error.name || 'Error'}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Message
                          </Typography>
                          <Alert severity="error" sx={{ mt: 0.5 }}>
                            {this.state.error.message}
                          </Alert>
                        </Box>

                        {this.state.error.stack && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Stack Trace
                            </Typography>
                            <Box
                              component="pre"
                              sx={{
                                bgcolor: 'grey.100',
                                p: 2,
                                borderRadius: 1,
                                overflow: 'auto',
                                fontSize: '0.75rem',
                                maxHeight: 300,
                              }}
                            >
                              {this.state.error.stack}
                            </Box>
                          </Box>
                        )}

                        {this.state.errorInfo && (
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Component Stack
                            </Typography>
                            <Box
                              component="pre"
                              sx={{
                                bgcolor: 'grey.100',
                                p: 2,
                                borderRadius: 1,
                                overflow: 'auto',
                                fontSize: '0.75rem',
                                maxHeight: 200,
                              }}
                            >
                              {this.state.errorInfo.componentStack}
                            </Box>
                          </Box>
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                )}

                {/* Action Buttons */}
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleReset}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleReload}
                  >
                    Reload Page
                  </Button>
                  <Button variant="outlined" startIcon={<HomeIcon />} onClick={this.handleGoHome}>
                    Go Home
                  </Button>
                </Stack>

                {/* Additional Info */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Error ID: {Date.now().toString(36)}
                  </Typography>
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    If this problem persists, please contact support.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary wrapper for functional components
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

/**
 * Compact error fallback for smaller components
 */
export function CompactErrorFallback({
  error,
  onReset,
}: {
  error: Error;
  onReset?: () => void;
}) {
  return (
    <Alert
      severity="error"
      action={
        onReset && (
          <Button color="inherit" size="small" onClick={onReset}>
            Retry
          </Button>
        )
      }
    >
      <Typography variant="subtitle2">Error</Typography>
      <Typography variant="body2">{error.message}</Typography>
    </Alert>
  );
}
