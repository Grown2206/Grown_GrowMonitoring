import React, { useRef, useEffect, ReactNode } from 'react';
import { Box, SxProps, Theme } from '@mui/material';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface TouchGestureHandlers {
  onSwipe?: (direction: SwipeDirection) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  onPinch?: (scale: number) => void;
  onDragStart?: (x: number, y: number) => void;
  onDragMove?: (x: number, y: number, deltaX: number, deltaY: number) => void;
  onDragEnd?: (x: number, y: number) => void;
}

export interface TouchGesturesProps {
  children: ReactNode;
  handlers?: TouchGestureHandlers;
  swipeThreshold?: number; // Minimum distance for swipe detection (px)
  longPressDelay?: number; // Long press duration (ms)
  doubleTapDelay?: number; // Max time between taps (ms)
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Touch gesture detection component for mobile interactions
 */
export function TouchGestures({
  children,
  handlers = {},
  swipeThreshold = 50,
  longPressDelay = 500,
  doubleTapDelay = 300,
  disabled = false,
  sx,
}: TouchGesturesProps) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pinchDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  const getDistance = (touch1: React.Touch, touch2: React.Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;

    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // Long press detection
    if (handlers.onLongPress) {
      longPressTimerRef.current = setTimeout(() => {
        handlers.onLongPress?.();
      }, longPressDelay);
    }

    // Drag start
    if (handlers.onDragStart) {
      handlers.onDragStart(touch.clientX, touch.clientY);
    }

    // Pinch detection
    if (e.touches.length === 2 && handlers.onPinch) {
      pinchDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled) return;

    // Cancel long press on move
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touch = e.touches[0];

    // Drag move
    if (handlers.onDragMove && touchStartRef.current) {
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      handlers.onDragMove(touch.clientX, touch.clientY, deltaX, deltaY);
    }

    // Pinch zoom
    if (e.touches.length === 2 && handlers.onPinch && pinchDistanceRef.current) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / pinchDistanceRef.current;
      handlers.onPinch(scale);
      pinchDistanceRef.current = currentDistance;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || !touchStartRef.current) return;

    // Cancel long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Swipe detection
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (Math.max(absX, absY) > swipeThreshold) {
      // Swipe gesture
      let direction: SwipeDirection;

      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      handlers.onSwipe?.(direction);

      // Call specific direction handlers
      switch (direction) {
        case 'left':
          handlers.onSwipeLeft?.();
          break;
        case 'right':
          handlers.onSwipeRight?.();
          break;
        case 'up':
          handlers.onSwipeUp?.();
          break;
        case 'down':
          handlers.onSwipeDown?.();
          break;
      }
    } else if (deltaTime < 200 && absX < 10 && absY < 10) {
      // Tap detection (quick and minimal movement)
      const now = Date.now();
      const timeSinceLastTap = now - lastTapRef.current;

      if (timeSinceLastTap < doubleTapDelay) {
        // Double tap
        handlers.onDoubleTap?.();
        lastTapRef.current = 0; // Reset to prevent triple tap triggering another double tap
      } else {
        // Single tap (might become double tap)
        lastTapRef.current = now;
      }
    }

    // Drag end
    if (handlers.onDragEnd) {
      handlers.onDragEnd(touch.clientX, touch.clientY);
    }

    // Reset pinch
    pinchDistanceRef.current = null;
    touchStartRef.current = null;
  };

  return (
    <Box
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Custom hook for touch gestures without component wrapper
 */
export function useTouchGestures(
  elementRef: React.RefObject<HTMLElement>,
  handlers: TouchGestureHandlers,
  options: {
    swipeThreshold?: number;
    longPressDelay?: number;
    doubleTapDelay?: number;
    disabled?: boolean;
  } = {}
) {
  const {
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    disabled = false,
  } = options;

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pinchDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || disabled) return;

    const getDistance = (touch1: Touch, touch2: Touch): number => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };

      if (handlers.onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          handlers.onLongPress?.();
        }, longPressDelay);
      }

      if (handlers.onDragStart) {
        handlers.onDragStart(touch.clientX, touch.clientY);
      }

      if (e.touches.length === 2 && handlers.onPinch) {
        pinchDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      const touch = e.touches[0];

      if (handlers.onDragMove && touchStartRef.current) {
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = touch.clientY - touchStartRef.current.y;
        handlers.onDragMove(touch.clientX, touch.clientY, deltaX, deltaY);
      }

      if (e.touches.length === 2 && handlers.onPinch && pinchDistanceRef.current) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / pinchDistanceRef.current;
        handlers.onPinch(scale);
        pinchDistanceRef.current = currentDistance;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (Math.max(absX, absY) > swipeThreshold) {
        let direction: SwipeDirection;

        if (absX > absY) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }

        handlers.onSwipe?.(direction);

        switch (direction) {
          case 'left':
            handlers.onSwipeLeft?.();
            break;
          case 'right':
            handlers.onSwipeRight?.();
            break;
          case 'up':
            handlers.onSwipeUp?.();
            break;
          case 'down':
            handlers.onSwipeDown?.();
            break;
        }
      } else if (deltaTime < 200 && absX < 10 && absY < 10) {
        const now = Date.now();
        const timeSinceLastTap = now - lastTapRef.current;

        if (timeSinceLastTap < doubleTapDelay) {
          handlers.onDoubleTap?.();
          lastTapRef.current = 0;
        } else {
          lastTapRef.current = now;
        }
      }

      if (handlers.onDragEnd) {
        handlers.onDragEnd(touch.clientX, touch.clientY);
      }

      pinchDistanceRef.current = null;
      touchStartRef.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);

      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [
    elementRef,
    handlers,
    swipeThreshold,
    longPressDelay,
    doubleTapDelay,
    disabled,
  ]);
}

/**
 * Example: Swipeable Card Component
 */
export function SwipeableCard() {
  return (
    <TouchGestures
      handlers={{
        onSwipeLeft: () => console.log('Swiped left - Next'),
        onSwipeRight: () => console.log('Swiped right - Previous'),
        onDoubleTap: () => console.log('Double tapped - Favorite'),
        onLongPress: () => console.log('Long pressed - Options'),
      }}
      sx={{
        width: '100%',
        height: 200,
        bgcolor: 'primary.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <div>Swipe, tap, or long press</div>
        <div style={{ fontSize: '0.875rem', marginTop: 8 }}>
          Left/Right: Navigate | Double Tap: Favorite | Long Press: Options
        </div>
      </Box>
    </TouchGestures>
  );
}
