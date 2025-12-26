import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { useAnimation, useScrollAnimation, AnimationType, AnimationDuration } from '../../hooks/useAnimation';

export interface AnimatedContainerProps extends Omit<BoxProps, 'ref'> {
  animation?: AnimationType;
  duration?: AnimationDuration | number;
  delay?: number;
  children: React.ReactNode;
}

/**
 * Animated container component
 *
 * @example
 * <AnimatedContainer animation="fade" duration="normal" delay={100}>
 *   <Card>...</Card>
 * </AnimatedContainer>
 */
export function AnimatedContainer({
  animation = 'fade',
  duration = 'normal',
  delay = 0,
  children,
  sx,
  ...props
}: AnimatedContainerProps) {
  const { style } = useAnimation({
    type: animation,
    duration,
    delay,
    easing: 'ease-out',
    autoPlay: true,
  });

  return (
    <Box
      sx={{
        ...style,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

/**
 * Scroll-triggered animated container
 */
export interface ScrollAnimatedContainerProps extends AnimatedContainerProps {
  threshold?: number;
}

export function ScrollAnimatedContainer({
  animation = 'slide-up',
  duration = 'normal',
  delay = 0,
  threshold = 0.1,
  children,
  sx,
  ...props
}: ScrollAnimatedContainerProps) {
  const { style, elementRef } = useScrollAnimation(
    {
      type: animation,
      duration,
      delay,
      easing: 'ease-out',
    },
    threshold
  );

  return (
    <Box
      ref={elementRef as React.Ref<HTMLDivElement>}
      sx={{
        ...style,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
}

/**
 * Staggered list animation
 */
export interface StaggeredListProps extends Omit<BoxProps, 'ref'> {
  children: React.ReactNode[];
  animation?: AnimationType;
  duration?: AnimationDuration | number;
  staggerDelay?: number;
  baseDelay?: number;
}

export function StaggeredList({
  children,
  animation = 'slide-up',
  duration = 'normal',
  staggerDelay = 50,
  baseDelay = 0,
  sx,
  ...props
}: StaggeredListProps) {
  return (
    <Box sx={sx} {...props}>
      {React.Children.map(children, (child, index) => (
        <AnimatedContainer
          key={index}
          animation={animation}
          duration={duration}
          delay={baseDelay + index * staggerDelay}
        >
          {child}
        </AnimatedContainer>
      ))}
    </Box>
  );
}
