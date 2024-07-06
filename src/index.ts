import { archiveMatch } from "./crawler";
import { env } from "./env";

console.log(`Hello from ${env.NODE_ENV}`);

async function main() {
	await archiveMatch(114207815);
}
main();
