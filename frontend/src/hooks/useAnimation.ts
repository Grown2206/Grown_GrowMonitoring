import { useState, useEffect, useRef, CSSProperties } from 'react';

export type AnimationType =
  | 'fade'
  | 'slide-up'
  | 'slide-down'
  | 'slide-left'
  | 'slide-right'
  | 'scale'
  | 'rotate'
  | 'bounce';

export type AnimationDuration = 'fast' | 'normal' | 'slow';

export interface AnimationOptions {
  type?: AnimationType;
  duration?: AnimationDuration | number;
  delay?: number;
  easing?: string;
  repeat?: boolean;
  autoPlay?: boolean;
}

const DURATION_MAP: Record<AnimationDuration, number> = {
  fast: 200,
  normal: 300,
  slow: 500,
};

const EASING_MAP: Record<string, string> = {
  linear: 'linear',
  ease: 'ease',
  'ease-in': 'ease-in',
  'ease-out': 'ease-out',
  'ease-in-out': 'ease-in-out',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
};

/**
 * Hook for creating CSS-based animations
 *
 * @example
 * const { style, play, reset } = useAnimation({
 *   type: 'fade',
 *   duration: 'normal',
 *   delay: 100
 * });
 */
export function useAnimation(options: AnimationOptions = {}) {
  const {
    type = 'fade',
    duration = 'normal',
    delay = 0,
    easing = 'ease-out',
    repeat = false,
    autoPlay = true,
  } = options;

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isComplete, setIsComplete] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const durationMs = typeof duration === 'number' ? duration : DURATION_MAP[duration];
  const easingCurve = EASING_MAP[easing] || easing;

  useEffect(() => {
    if (isPlaying && !repeat) {
      timeoutRef.current = setTimeout(() => {
        setIsComplete(true);
        setIsPlaying(false);
      }, durationMs + delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, durationMs, delay, repeat]);

  const getTransform = (): string => {
    if (!isPlaying && !isComplete) {
      switch (type) {
        case 'slide-up':
          return 'translateY(20px)';
        case 'slide-down':
          return 'translateY(-20px)';
        case 'slide-left':
          return 'translateX(20px)';
        case 'slide-right':
          return 'translateX(-20px)';
        case 'scale':
          return 'scale(0.9)';
        case 'rotate':
          return 'rotate(-180deg)';
        default:
          return 'none';
      }
    }
    return 'none';
  };

  const getOpacity = (): number => {
    if (!isPlaying && !isComplete && type === 'fade') {
      return 0;
    }
    return 1;
  };

  const style: CSSProperties = {
    opacity: getOpacity(),
    transform: getTransform(),
    transition: isPlaying
      ? `all ${durationMs}ms ${easingCurve} ${delay}ms`
      : 'none',
  };

  const play = () => {
    setIsComplete(false);
    setIsPlaying(true);
  };

  const reset = () => {
    setIsComplete(false);
    setIsPlaying(false);
  };

  return {
    style,
    isPlaying,
    isComplete,
    play,
    reset,
  };
}

/**
 * Hook for staggered animations (animating list items with delay)
 */
export function useStaggeredAnimation(
  count: number,
  baseDelay: number = 50,
  options: AnimationOptions = {}
) {
  const animations = Array.from({ length: count }, (_, index) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimation({
      ...options,
      delay: (options.delay || 0) + index * baseDelay,
    })
  );

  return animations;
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation(
  options: AnimationOptions = {},
  threshold: number = 0.1
) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(elementRef.current);
      }
    };
  }, [hasAnimated, threshold]);

  const animation = useAnimation({
    ...options,
    autoPlay: isVisible,
  });

  return {
    ...animation,
    elementRef,
    isVisible,
  };
}

/**
 * Hook for hover animations
 */
export function useHoverAnimation(options: AnimationOptions = {}) {
  const [isHovered, setIsHovered] = useState(false);

  const animation = useAnimation({
    ...options,
    autoPlay: isHovered,
  });

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  return {
    ...animation,
    isHovered,
    hoverProps,
  };
}

/**
 * Spring physics animation hook
 */
export function useSpring(
  target: number,
  stiffness: number = 170,
  damping: number = 26,
  mass: number = 1
) {
  const [value, setValue] = useState(0);
  const velocityRef = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      const delta = target - value;
      const acceleration = (delta * stiffness - velocityRef.current * damping) / mass;

      velocityRef.current += acceleration * 0.016; // 60fps
      const newValue = value + velocityRef.current * 0.016;

      setValue(newValue);

      // Continue if not at rest
      if (Math.abs(delta) > 0.01 || Math.abs(velocityRef.current) > 0.01) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [target, value, stiffness, damping, mass]);

  return value;
}

/**
 * Counter animation hook
 */
export function useCountAnimation(
  end: number,
  duration: number = 1000,
  start: number = 0,
  autoStart: boolean = true
) {
  const [count, setCount] = useState(start);
  const [isAnimating, setIsAnimating] = useState(false);
  const startTimeRef = useRef<number>(0);
  const animationRef = useRef<number>();

  const startAnimation = () => {
    setIsAnimating(true);
    startTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (autoStart) {
      startAnimation();
    }
  }, [autoStart]);

  useEffect(() => {
    if (!isAnimating) return;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentCount = start + (end - start) * easeOut;

      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, start, end, duration]);

  return {
    count: Math.round(count),
    isAnimating,
    start: startAnimation,
  };
}
