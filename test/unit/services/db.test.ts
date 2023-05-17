import { beforeEach, describe, expect, test, vi } from "vitest";

import { logger } from "test/mocks";

import { Migrator } from "kysely";

import { KyselyDB, Config } from "src/services/db";

const config: Config = {
  connectionString: "connectionString",
  timeout: 0,
};

vi.mock("kysely");

describe("Kysely db service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("migrate()", () => {
    test("migrate works", async () => {
      vi.mocked(Migrator.prototype.migrateToLatest).mockResolvedValueOnce({
        error: undefined,
        results: undefined,
      });

      const db = new KyselyDB(config, logger);
      await db.migrate();
    });

    test("migrate fails", async () => {
      vi.mocked(Migrator.prototype.migrateToLatest).mockResolvedValueOnce({
        error: new Error("migrations failed"),
        results: undefined,
      });

      const db = new KyselyDB(config, logger);
      await expect(db.migrate()).rejects.toThrow();
    });
  });
});
