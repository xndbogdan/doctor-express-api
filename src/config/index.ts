// Application configuration
export const appConfig = {
  // Add any application-specific configuration here if needed
  TZ: process.env.TZ || "UTC",
};

// Redis cache configuration
export const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};

// Cache TTL configuration (in seconds)
export const cacheConfig = {
  // 30 days in seconds
  slotsTTL: 30 * 24 * 60 * 60,
  appointmentsTTL: 30 * 24 * 60 * 60,
};
