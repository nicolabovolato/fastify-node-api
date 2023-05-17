import { Job, JobResult, IQueueService } from "src/domain/job";
import { Logger } from "src/services/logger";

export type IJobs = {
  enqueue: (job: Omit<Job, "id">) => Promise<Job["id"]>;
};

export class Jobs implements IJobs {
  constructor(
    private readonly logger: Logger,
    private readonly queue: IQueueService
  ) {
    queue.onProcess((job) => this.onProcess(job));
    queue.onCompleted((jobId, result) => this.onCompleted(jobId, result));
    queue.onFailed((jobId, error) => this.onFailed(jobId, error));
  }

  async enqueue(job: Omit<Job, "id">) {
    return await this.queue.add(job);
  }

  private async onProcess(job: Job) {
    this.logger.info(`Processing job ${job.id}`);

    // let's just pretend there's a very expensive task here
    await new Promise((resolve) => setTimeout(resolve, 5000));

    switch (job.operation) {
      case "add":
        return job.data.reduce((acc, cur) => acc + cur);
      case "subtract":
        return job.data.reduce((acc, cur) => acc - cur);
      case "multiply":
        return job.data.reduce((acc, cur) => acc * cur);
      case "divide":
        return job.data.reduce((acc, cur) => acc / cur);
    }
  }

  private onCompleted(jobId: Job["id"], result: JobResult) {
    this.logger.info(`Job ${jobId} completed with result ${result}`);
  }

  private onFailed(jobId: Job["id"], error: Error) {
    this.logger.error(error, `Job ${jobId} failed with error ${error.message}`);
  }
}
