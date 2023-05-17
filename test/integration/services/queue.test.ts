import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { logger } from "test/mocks";
import { cacheConfig } from "test/integration/mocks";

import { BullQueue } from "src/services/queue";
import { Job, JobResult } from "src/domain/job";

const queue = new BullQueue(cacheConfig, logger);

describe("BullMQ queue service", () => {
  beforeEach(async () => {
    await queue["queue"].drain(true);

    await queue["queue"].resume();
    await queue["worker"].resume();
  });

  afterEach(async () => {
    await queue["queue"].pause();
    await queue["worker"].pause();

    queue["failedListener"] = null;
    queue["completedListener"] = null;
    queue["processListener"] = null;
  });

  test("add job -> process listener called -> job succeeds -> complete listener called", async () => {
    const job: Omit<Job, "id"> = {
      data: [1, 2, 3],
      operation: "add",
    };

    const jobResult: JobResult = 6;

    let resolveProcessPromise: (value: unknown) => void;
    const processPromise = new Promise((resolve) => {
      resolveProcessPromise = resolve;
    });
    let resolveCompletePromise: (value: unknown) => void;
    const completePromise = new Promise((resolve) => {
      resolveCompletePromise = resolve;
    });

    const processListener = vi.fn().mockImplementationOnce(async () => {
      resolveProcessPromise("ok");
      return jobResult;
    });
    const completeListener = vi.fn().mockImplementationOnce(async () => {
      resolveCompletePromise("ok");
    });

    queue.onProcess(processListener);
    queue.onCompleted(completeListener);

    const id = await queue.add(job);

    await expect(processPromise).resolves.toBe("ok");
    await expect(completePromise).resolves.toBe("ok");
    expect(processListener).toHaveBeenCalledOnce();
    expect(processListener).toHaveBeenCalledWith({ id, ...job });
    expect(completeListener).toHaveBeenCalledOnce();
    expect(completeListener).toHaveBeenCalledWith(id, jobResult);
  });

  test("add job -> process listener called -> job fails -> failed listener called", async () => {
    const job: Omit<Job, "id"> = {
      data: [1, 2, 3],
      operation: "add",
    };

    const error = new Error("processing error");

    let resolveProcessPromise: (value: unknown) => void;
    const processPromise = new Promise((resolve) => {
      resolveProcessPromise = resolve;
    });
    let resolveFailPromise: (value: unknown) => void;
    const failPromise = new Promise((resolve) => {
      resolveFailPromise = resolve;
    });

    const processListener = vi.fn().mockImplementationOnce(async () => {
      resolveProcessPromise("ok");
      throw error;
    });
    const failedListener = vi.fn().mockImplementationOnce(async () => {
      resolveFailPromise("ok");
    });

    queue.onProcess(processListener);
    queue.onFailed(failedListener);

    const id = await queue.add(job);

    await expect(processPromise).resolves.toBe("ok");
    await expect(failPromise).resolves.toBe("ok");

    expect(processListener).toHaveBeenCalledOnce();
    expect(processListener).toHaveBeenCalledWith({ id, ...job });
    expect(failedListener).toHaveBeenCalledOnce();
    expect(failedListener).toHaveBeenCalledWith(id, error);
  });
});
