import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = '@eduLearn_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheItem<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class CacheManager {
    /**
     * Store data in cache with TTL
     */
    async set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): Promise<void> {
        try {
            const cacheItem: CacheItem<T> = {
                data,
                timestamp: Date.now(),
                ttl,
            };
            await AsyncStorage.setItem(
                `${CACHE_PREFIX}${key}`,
                JSON.stringify(cacheItem)
            );
        } catch (error) {
            console.error('Cache set error:', error);
        }
    }

    /**
     * Get data from cache if not expired
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
            if (!cached) return null;

            const cacheItem: CacheItem<T> = JSON.parse(cached);
            const now = Date.now();
            const age = now - cacheItem.timestamp;

            // Check if cache is expired
            if (age > cacheItem.ttl) {
                await this.remove(key);
                return null;
            }

            return cacheItem.data;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * Get data from cache even if expired (stale-while-revalidate)
     */
    async getStale<T>(key: string): Promise<{ data: T | null; isStale: boolean }> {
        try {
            const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
            if (!cached) return { data: null, isStale: false };

            const cacheItem: CacheItem<T> = JSON.parse(cached);
            const now = Date.now();
            const age = now - cacheItem.timestamp;
            const isStale = age > cacheItem.ttl;

            return { data: cacheItem.data, isStale };
        } catch (error) {
            console.error('Cache getStale error:', error);
            return { data: null, isStale: false };
        }
    }

    /**
     * Remove specific cache entry
     */
    async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
        } catch (error) {
            console.error('Cache remove error:', error);
        }
    }

    /**
     * Clear all cache entries
     */
    async clearAll(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
            await AsyncStorage.multiRemove(cacheKeys);
        } catch (error) {
            console.error('Cache clearAll error:', error);
        }
    }

    /**
     * Get cache age in milliseconds
     */
    async getCacheAge(key: string): Promise<number | null> {
        try {
            const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
            if (!cached) return null;

            const cacheItem: CacheItem<any> = JSON.parse(cached);
            return Date.now() - cacheItem.timestamp;
        } catch (error) {
            console.error('Cache getCacheAge error:', error);
            return null;
        }
    }
}

export const cacheManager = new CacheManager();
export default cacheManager;
