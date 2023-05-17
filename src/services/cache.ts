import { ISettingsService } from "src/domain/settings";
import { Redis } from "ioredis";
import { Logger } from "./logger";

export type Config = {
  connectionString: string;
  timeout: number;
};

export class RedisCache implements ISettingsService {
  private readonly client: Redis;
  private static readonly keyPrefix = "settings:";

  constructor(config: Config, private readonly logger: Logger) {
    this.client = new Redis(config.connectionString, {
      commandTimeout: config.timeout,
      keyPrefix: RedisCache.keyPrefix,
      reconnectOnError: () => true,
      retryStrategy: () => config.timeout,
    });
    this.client.on("error", (err) => this.logger.error(err));
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async set(key: string, value: string | null) {
    if (value) await this.client.set(key, value);
    else await this.client.del(key);

    return value;
  }
}
