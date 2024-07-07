import { env } from "./env";
import { handleArchiveRequest } from "./queue";

console.log(`Hello from ${env.NODE_ENV}`);

const matchIds = [
	111451190, 105294878, 114207815, 111350765, 111352735, 111356742, 111360796,
];

async function main() {
	const results = await Promise.allSettled(
		matchIds.map((id) => handleArchiveRequest(id)),
	);
	console.log(results);
}
main();
