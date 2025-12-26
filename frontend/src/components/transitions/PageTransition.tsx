import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, LinearProgress } from '@mui/material';
import { useAnimation } from '../../hooks/useAnimation';

export interface PageTransitionProps {
  children: React.ReactNode;
  animation?: 'fade' | 'slide-up' | 'scale' | 'none';
  duration?: number;
}

/**
 * Page transition wrapper with route change animations
 */
export function PageTransition({
  children,
  animation = 'fade',
  duration = 300,
}: PageTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<'enter' | 'exit'>('enter');

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage('exit');
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'exit') {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [transitionStage, location, duration]);

  if (animation === 'none') {
    return <>{children}</>;
  }

  const animationConfig = {
    type: animation as 'fade' | 'slide-up' | 'scale',
    duration,
    autoPlay: transitionStage === 'enter',
  };

  const { style } = useAnimation(animationConfig);

  return (
    <Box
      sx={{
        ...style,
        width: '100%',
        minHeight: '100%',
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Navigation progress bar shown during route changes
 */
export function NavigationProgress() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    setIsNavigating(true);
    setProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 10;
      });
    }, 100);

    const timeout = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [location]);

  if (!isNavigating) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 3,
          '& .MuiLinearProgress-bar': {
            transition: 'transform 0.2s linear',
          },
        }}
      />
    </Box>
  );
}

/**
 * Fade transition for route changes
 */
export function FadeTransition({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition animation="fade" duration={200}>
      {children}
    </PageTransition>
  );
}

/**
 * Slide transition for route changes
 */
export function SlideTransition({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition animation="slide-up" duration={300}>
      {children}
    </PageTransition>
  );
}
