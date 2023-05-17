import { beforeEach, describe, expect, test } from "vitest";

import { logger } from "test/mocks";
import { cacheConfig } from "test/integration/mocks";

import { RedisCache } from "src/services/cache";

const cache = new RedisCache(cacheConfig, logger);

describe("Redis cache service", () => {
  beforeEach(async () => {
    await cache["client"].flushdb();
  });

  test("get non existent -> set value -> get value -> set null -> get non existent", async () => {
    const key = "key";

    let getResult = await cache.get(key);
    expect(getResult).toBe(null);

    let setResult = await cache.set(key, "value");
    expect(setResult).toBe("value");

    getResult = await cache.get(key);
    expect(getResult).toBe(setResult);

    setResult = await cache.set(key, null);
    expect(setResult).toBe(null);

    getResult = await cache.get(key);
    expect(setResult).toBe(null);
  });
});
