import { beforeEach, describe, expect, test, vi } from "vitest";

import { logger } from "test/mocks";

import { UnrecoverableError, Job as BullMQJob } from "bullmq";

import { BullQueue, Config } from "src/services/queue";
import { Job, JobResult } from "src/domain/job";

const config: Config = {
  connectionString: "connectionString",
  timeout: 0,
};

vi.mock("bullmq");

describe("Bullmq queue service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("processJob()", () => {
    test("calls listener and returns correct value", async () => {
      const listener = vi.fn().mockResolvedValueOnce(10);
      const job: Job = {
        id: "id",
        data: [1, 2, 3],
        operation: "add",
      };

      const queue = new BullQueue(config, logger);
      queue.onProcess(listener);

      const result = await queue["processJob"]({
        name: job.id,
        data: { data: job.data, operation: job.operation },
      } as BullMQJob<Omit<Job, "id">, JobResult>);

      expect(result).toEqual(10);
      expect(listener).toHaveBeenCalledOnce();
      expect(listener).toHaveBeenCalledWith(job);
    });

    test("fails when listener is not set", async () => {
      await expect(
        new BullQueue(config, logger)["processJob"]({
          name: "id",
          data: { data: [1, 2, 3], operation: "add" },
        } as BullMQJob<Omit<Job, "id">, JobResult>)
      ).rejects.toThrowError(UnrecoverableError);
    });
  });

  describe("onProcess()", () => {
    test("listener is registered only once", async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const queue = new BullQueue(config, logger);

      queue.onProcess(listener1);
      queue.onProcess(listener2);

      expect(queue).toHaveProperty("processListener", listener1);
    });
  });

  describe("onCompleted()", () => {
    test("listener is registered only once", async () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      const queue = new BullQueue(config, logger);

      queue.onCompleted(listener1);
      queue.onCompleted(listener2);

      expect(queue).toHaveProperty("completedListener", listener1);
    });
  });
});
