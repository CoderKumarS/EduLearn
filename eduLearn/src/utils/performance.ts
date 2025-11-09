/**
 * Performance Optimization Utilities
 */

/**
 * Debounce function for search and input handlers
 * Delays execution until after wait milliseconds have elapsed since the last call
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
 * Throttle function for scroll and resize handlers
 * Ensures function is called at most once per specified time period
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

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
 * Memoize expensive computations
 */
export function memoize<T extends (...args: any[]) => any>(
    func: T
): (...args: Parameters<T>) => ReturnType<T> {
    const cache = new Map<string, ReturnType<T>>();

    return function memoized(...args: Parameters<T>): ReturnType<T> {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            return cache.get(key)!;
        }

        const result = func(...args);
        cache.set(key, result);
        return result;
    };
}

/**
 * FlatList optimization configuration
 */
export const FlatListOptimizations = {
    // Optimal window size for most lists
    windowSize: 10,

    // Initial number of items to render
    initialNumToRender: 10,

    // Maximum number of items to render in a batch
    maxToRenderPerBatch: 10,

    // Delay before rendering more items (ms)
    updateCellsBatchingPeriod: 50,

    // Remove clipped subviews for better performance
    removeClippedSubviews: true,

    // Get item layout for better performance (if items have fixed height)
    getItemLayout: (data: any, index: number, itemHeight: number) => ({
        length: itemHeight,
        offset: itemHeight * index,
        index,
    }),
};

/**
 * Image caching configuration
 */
export const ImageCacheConfig = {
    // Maximum cache size in bytes (50MB)
    maxCacheSize: 50 * 1024 * 1024,

    // Cache expiration time in seconds (7 days)
    cacheExpiration: 7 * 24 * 60 * 60,

    // Image quality (0-1)
    quality: 0.8,

    // Resize mode
    resizeMode: 'cover' as const,
};

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string): {
    start: () => void;
    end: () => void;
} {
    let startTime: number;

    return {
        start: () => {
            startTime = performance.now();
        },
        end: () => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`);
        },
    };
}

/**
 * Batch state updates to reduce re-renders
 */
export function batchUpdates<T>(
    updates: Array<() => void>,
    callback?: () => void
): void {
    updates.forEach((update) => update());
    if (callback) {
        callback();
    }
}

/**
 * Lazy load images with placeholder
 */
export interface LazyImageConfig {
    uri: string;
    placeholder?: string;
    onLoad?: () => void;
    onError?: (error: any) => void;
}

/**
 * Check if device is low-end
 * Used to adjust performance settings
 */
export function isLowEndDevice(): boolean {
    // This would check device specs in a real implementation
    // For now, return false
    return false;
}

/**
 * Get optimal FlatList configuration based on device
 */
export function getOptimalFlatListConfig(itemCount: number) {
    const isLowEnd = isLowEndDevice();

    return {
        windowSize: isLowEnd ? 5 : 10,
        initialNumToRender: isLowEnd ? 5 : 10,
        maxToRenderPerBatch: isLowEnd ? 5 : 10,
        updateCellsBatchingPeriod: isLowEnd ? 100 : 50,
        removeClippedSubviews: true,
    };
}

/**
 * Optimize search with debouncing
 */
export const optimizedSearch = debounce((query: string, callback: (query: string) => void) => {
    callback(query);
}, 300);

/**
 * Optimize scroll handler with throttling
 */
export const optimizedScroll = throttle((event: any, callback: (event: any) => void) => {
    callback(event);
}, 100);

/**
 * Memory management utilities
 */
export const MemoryUtils = {
    /**
     * Clear cache
     */
    clearCache: () => {
        // Implementation would clear image cache, data cache, etc.
        console.log('[Performance] Cache cleared');
    },

    /**
     * Get memory usage (mock implementation)
     */
    getMemoryUsage: () => {
        return {
            used: 0,
            total: 0,
            percentage: 0,
        };
    },

    /**
     * Check if memory is low
     */
    isMemoryLow: () => {
        const usage = MemoryUtils.getMemoryUsage();
        return usage.percentage > 80;
    },
};

/**
 * Performance monitoring
 */
export class PerformanceMonitor {
    private metrics: Map<string, number[]> = new Map();

    recordMetric(name: string, value: number): void {
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name)!.push(value);
    }

    getAverageMetric(name: string): number {
        const values = this.metrics.get(name);
        if (!values || values.length === 0) return 0;

        const sum = values.reduce((a, b) => a + b, 0);
        return sum / values.length;
    }

    getMetricReport(): string {
        let report = 'Performance Metrics:\n';
        this.metrics.forEach((values, name) => {
            const avg = this.getAverageMetric(name);
            report += `${name}: ${avg.toFixed(2)}ms (${values.length} samples)\n`;
        });
        return report;
    }

    clearMetrics(): void {
        this.metrics.clear();
    }
}

export const performanceMonitor = new PerformanceMonitor();
