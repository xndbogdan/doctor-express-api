import Redis from "ioredis";
import { redisConfig, cacheConfig } from "@/config";
import { DateTime } from "luxon";

// Initialize Redis client
const redisClient = new Redis({
  host: redisConfig.host,
  port: redisConfig.port,
});

// Cache key prefixes for different entity types
const KEY_PREFIX = {
  AVAILABLE_SLOTS: "available_slots",
};

// Helper to generate cache keys
const generateKey = (prefix: string, ...parts: (string | number)[]): string => {
  return `${prefix}:${parts.join(":")}`;
};

// Available slots cache operations
export const availableSlotsCache = {
  getKey: (doctorId: number, date: string): string => {
    return generateKey(KEY_PREFIX.AVAILABLE_SLOTS, doctorId.toString(), date);
  },

  set: async (doctorId: number, date: string, slots: any[]): Promise<void> => {
    const key = availableSlotsCache.getKey(doctorId, date);
    await redisClient.set(
      key,
      JSON.stringify(slots),
      "EX",
      cacheConfig.slotsTTL
    );
  },

  get: async (doctorId: number, date: string): Promise<any[] | null> => {
    const key = availableSlotsCache.getKey(doctorId, date);
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },

  invalidate: async (doctorId: number, date: string): Promise<void> => {
    const key = availableSlotsCache.getKey(doctorId, date);
    await redisClient.del(key);
  },

  invalidateAll: async (doctorId: number): Promise<void> => {
    const pattern = `${KEY_PREFIX.AVAILABLE_SLOTS}:${doctorId}:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  },
};

// Helper function to extract date from a DateTime object for cache invalidation
export const getDateString = (date: Date | DateTime): string => {
  const dateTime = date instanceof Date ? DateTime.fromJSDate(date) : date;
  return dateTime.toFormat("yyyy-MM-dd");
};

export default redisClient;
