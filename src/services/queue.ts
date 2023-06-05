import { Redis } from "ioredis";
import { Worker, Queue, Job as BullMQJob, UnrecoverableError } from "bullmq";
import { randomUUID } from "node:crypto";

import { Logger } from "./logger";
import { Job, JobResult, IQueueService } from "src/domain/job";

export type Config = {
  connectionString: string;
  timeout: number;
};

export class BullQueue implements IQueueService {
  private readonly queue: Queue;
  private readonly worker: Worker;
  private static readonly pipeline = "jobs";

  private processListener: ((job: Job) => Promise<JobResult>) | null = null;
  private completedListener:
    | ((jobId: Job["id"], jobResult: JobResult) => void)
    | null = null;
  private failedListener: ((jobId: Job["id"], error: Error) => void) | null =
    null;

  constructor(config: Config, private readonly logger: Logger) {
    const connection = new Redis(config.connectionString, {
      reconnectOnError: () => true,
      retryStrategy: () => config.timeout,
      maxRetriesPerRequest: null,
    });
    connection.on("error", (err) => this.logger.error(err));

    this.queue = new Queue<Omit<Job, "id">, JobResult>(BullQueue.pipeline, {
      connection,
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.queue.on("error", () => {});

    this.worker = new Worker<Omit<Job, "id">, JobResult>(
      BullQueue.pipeline,
      (job) => this.processJob(job),
      {
        connection,
      }
    );
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.worker.on("error", () => {});

    this.worker.on(
      "completed",
      (job: BullMQJob<Omit<Job, "id">, JobResult>, result: JobResult) => {
        if (job.id) this.completedListener?.(job.id, result);
      }
    );
    this.worker.on(
      "failed",
      (
        job: BullMQJob<Omit<Job, "id">, JobResult> | undefined,
        error: Error
      ) => {
        if (job && job.id) this.failedListener?.(job.id, error);
      }
    );
  }

  private async processJob(job: BullMQJob<Omit<Job, "id">, JobResult>) {
    if (!job.id) throw new UnrecoverableError(`job has no id`);
    if (this.processListener == null)
      throw new UnrecoverableError(`missing listener for job ${job.id}`);
    return await this.processListener({ id: job.id, ...job.data });
  }

  async add(job: Omit<Job, "id">) {
    const id = randomUUID();
    await this.queue.add("job", job, {
      jobId: id,
      removeOnComplete: true,
      removeOnFail: true,
    });
    return id;
  }

  onProcess(listener: (job: Job) => Promise<JobResult>) {
    if (this.processListener)
      return this.logger.error("process listener is already set");

    this.processListener = listener;
  }

  onCompleted(listener: (jobId: Job["id"], jobResult: JobResult) => void) {
    if (this.completedListener)
      return this.logger.error("completed listener is already set");

    this.completedListener = listener;
  }

  onFailed(listener: (jobId: Job["id"], error: Error) => void) {
    if (this.failedListener)
      return this.logger.error("failed listener is already set");

    this.failedListener = listener;
  }
}
