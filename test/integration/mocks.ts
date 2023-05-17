import { Config as DbConfig } from "src/services/db";
import { Config as CacheConfig } from "src/services/cache";
import { Config as QueueConfig } from "src/services/queue";

export const dbConfig: DbConfig = {
  connectionString: "postgres://user:pass@localhost:5432/db",
  timeout: 5000,
};

export const cacheConfig: CacheConfig = {
  connectionString: "redis://localhost:6379/0",
  timeout: 5000,
};

export const queueConfig: QueueConfig = {
  connectionString: "redis://localhost:6379/1",
  timeout: 5000,
};
