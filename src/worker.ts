import { type Job, Worker } from "bullmq";
import { archiveMatch } from "./crawler";
import { type MatchJobData, connection } from "./queue";

const worker = new Worker<MatchJobData>(
	"match",
	async (job) => {
		console.log(`Processing job ${job.id}`);
		await archiveMatch(job.data.id);
		return job.data.id;
	},
	{
		connection,
		limiter: {
			max: 1,
			duration: 10000,
		},
	},
);
worker.on("error", (err) => {
	// log the error
	console.error(err);
});
worker.on("failed", (job, error) => {
	// Do something with the return value.
	console.error(`Job ${job?.id} failed with error ${error.message}`);
});
worker.on("completed", (job) => {
	// Do something with the return value.
	console.log(`Job ${job.id} completed`);
});
worker.on("active", (job) => {
	console.log(`Job ${job.id} active`);
});
worker.on("closed", () => {
	console.log("Worker closed");
});
console.log(worker.isRunning());
