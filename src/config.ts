import "dotenv/config";
import { version } from "../package.json";

import { Config as AuthConfig } from "./services/auth";
import { Config as DbConfig } from "./services/db";
import { Config as CacheConfig } from "./services/cache";
import { Config as QueueConfig } from "./services/queue";
import { Config as LoggerConfig } from "./services/logger";
import { Config as ApiConfig } from "./api/index";

import { Config as AuthUseCaseConfig } from "./useCases/auth";

type Config = {
  services: {
    db: DbConfig;
    cache: CacheConfig;
    queue: QueueConfig;
    logger: LoggerConfig;
    auth: AuthConfig;
  };
  useCases: {
    auth: AuthUseCaseConfig;
  };
  api: ApiConfig;
  gracefulShutdownTimeoutMs: number;
};

export default {
  services: {
    db: {
      connectionString:
        process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/db",
      timeout: Number(process.env.DATABASE_TIMEOUT_MS || 5000),
    },
    cache: {
      connectionString: process.env.CACHE_URL || "redis://localhost:6379/0",
      timeout: Number(process.env.CACHE_TIMEOUT_MS || 5000),
    },
    queue: {
      connectionString: process.env.QUEUE_URL || "redis://localhost:6379/1",
      timeout: Number(process.env.QUEUE_TIMEOUT_MS || 5000),
    },
    logger: {
      level: process.env.LOG_LEVEL || "info",
      version,
    },
    auth: {
      privateKey: process.env.PASETO_PRIVATE_KEY || "",
      publicKey: process.env.PASETO_PUBLIC_KEY || "",
    },
  },
  useCases: {
    auth: {
      expirationMs: Number(
        process.env.AUTH_TOKEN_EXPIRATION_MS || 5 * 60 * 1000
      ),
    },
  },
  api: {
    port: Number(process.env.PORT || 80),
    openapi:
      !!process.env.EXPOSE_OPENAPI || process.env.NODE_ENV != "production",
  },
  gracefulShutdownTimeoutMs: Number(
    process.env.GRACEFUL_SHUTDOWN_TIMEOUT_MS || 30 * 1000
  ),
} satisfies Config;
