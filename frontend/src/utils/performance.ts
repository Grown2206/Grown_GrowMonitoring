import { useEffect, useRef } from 'react';

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();
  private static measures: Array<{ name: string; duration: number; timestamp: number }> = [];

  /**
   * Start a performance measurement
   */
  static mark(name: string) {
    this.marks.set(name, performance.now());
  }

  /**
   * End a performance measurement and log it
   */
  static measure(name: string, startMark: string) {
    const startTime = this.marks.get(startMark);
    if (!startTime) {
      console.warn(`No mark found for: ${startMark}`);
      return;
    }

    const duration = performance.now() - startTime;
    this.measures.push({
      name,
      duration,
      timestamp: Date.now(),
    });

    // Log slow operations
    if (duration > 100) {
      console.warn(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
    }

    this.marks.delete(startMark);
  }

  /**
   * Get all measurements
   */
  static getMeasures() {
    return [...this.measures];
  }

  /**
   * Clear all measurements
   */
  static clear() {
    this.marks.clear();
    this.measures = [];
  }

  /**
   * Get average duration for a measurement
   */
  static getAverage(name: string): number {
    const filtered = this.measures.filter((m) => m.name === name);
    if (filtered.length === 0) return 0;

    const total = filtered.reduce((sum, m) => sum + m.duration, 0);
    return total / filtered.length;
  }
}

/**
 * Hook to measure component render time
 */
export function useRenderTime(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(0);

  useEffect(() => {
    renderCount.current++;
  });

  // Mark start of render
  startTime.current = performance.now();

  // Measure after render
  useEffect(() => {
    const duration = performance.now() - startTime.current;

    if (duration > 16) { // Longer than 1 frame (60fps)
      console.log(
        `[Render] ${componentName} #${renderCount.current} took ${duration.toFixed(2)}ms`
      );
    }

    PerformanceMonitor.measure(`${componentName}_render`, `${componentName}_start`);
  });

  PerformanceMonitor.mark(`${componentName}_start`);
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Check if component should update (for class components)
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return false;
  }

  if (obj1 === null || obj2 === null) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (obj1[key] !== obj2[key]) return false;
  }

  return true;
}

/**
 * Memory usage monitoring
 */
export function logMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('[Memory]', {
      used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
}

/**
 * FPS monitor
 */
export class FPSMonitor {
  private frames: number[] = [];
  private lastTime = performance.now();
  private rafId: number | null = null;

  start() {
    const measure = () => {
      const now = performance.now();
      const delta = now - this.lastTime;
      const fps = 1000 / delta;

      this.frames.push(fps);
      if (this.frames.length > 60) {
        this.frames.shift();
      }

      this.lastTime = now;

      // Log if FPS drops below 30
      if (fps < 30) {
        console.warn(`[FPS] Low FPS: ${fps.toFixed(1)}`);
      }

      this.rafId = requestAnimationFrame(measure);
    };

    this.rafId = requestAnimationFrame(measure);
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  getAverage(): number {
    if (this.frames.length === 0) return 0;
    const sum = this.frames.reduce((a, b) => a + b, 0);
    return sum / this.frames.length;
  }
}
