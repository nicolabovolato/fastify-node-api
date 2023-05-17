export type Job = {
  id: string;
  operation: "add" | "subtract" | "multiply" | "divide";
  data: number[];
};

export type JobResult = number;

export type IQueueService = {
  add: (job: Omit<Job, "id">) => Promise<Job["id"]>;
  onProcess: (listener: (job: Job) => Promise<JobResult>) => void;
  onCompleted: (
    listener: (jobId: Job["id"], jobResult: JobResult) => void
  ) => void;
  onFailed: (listener: (jobId: Job["id"], error: Error) => void) => void;
};
