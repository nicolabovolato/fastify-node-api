import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import { logger } from "test/mocks";

import { Job, IQueueService } from "src/domain/job";
import { Jobs } from "src/useCases/jobs";

const service = {
  add: vi.fn(),
  onCompleted: vi.fn(),
  onProcess: vi.fn(),
  onFailed: vi.fn(),
} satisfies IQueueService;

describe("Jobs use case", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("constructor()", () => {
    test("registers event handlers", async () => {
      await new Jobs(logger, service);

      expect(service.onCompleted).toHaveBeenCalledOnce();
      expect(service.onProcess).toHaveBeenCalledOnce();
      expect(service.onFailed).toHaveBeenCalledOnce();
    });
  });

  describe("enqueue()", () => {
    test("works", async () => {
      const job: Omit<Job, "id"> = {
        data: [1, 2, 3],
        operation: "add",
      };
      service.add.mockResolvedValueOnce("id");

      const result = await new Jobs(logger, service).enqueue(job);

      expect(result).toBe("id");
      expect(service.add).toHaveBeenCalledOnce();
      expect(service.add).toHaveBeenCalledWith(job);
    });
  });

  describe("onProcess()", () => {
    beforeAll(() => {
      vi.useFakeTimers();
    });
    afterAll(() => {
      vi.useRealTimers();
    });
    test.each([
      [[1, 2, 3], "add", 6],
      [[3, 2, 1], "subtract", 0],
      [[4, 2, 3], "multiply", 24],
      [[4, 2, 1], "divide", 2],
    ] as const)("%s -> %s = %d", async (data, operation, result) => {
      const job: Job = {
        id: "id",
        data: [...data],
        operation,
      };

      let jobResult: number | undefined = undefined;

      service.onProcess.mockImplementation(async (listener) => {
        jobResult = await listener(job);
      });

      new Jobs(logger, service);

      await vi.advanceTimersByTimeAsync(5000);

      expect(jobResult).toBe(result);
    });
  });
});
