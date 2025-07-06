import "dotenv/config";
import { Effect } from "effect";
import { runtime } from "./services/runtime";
import { Ai } from "./services/Ai";
import { sdk } from "../instrumentation";

const deepResearch = Effect.fn('deep-research')(function* (
	query: string,
	depth: number = 1,
	breadth: number = 3
) {
	const { generateSearchQueries, searchAndProcess, generateLearnings } = yield* Ai

	const { queries } = yield* generateSearchQueries(query)

	for (const query of queries) {
		yield* Effect.log(`Searching the web for: ${query}`)
		const searchResults = yield* searchAndProcess(query)
		for (const searchResult of searchResults) {
			console.log(`Processing search result: ${searchResult.url}`)
			const learnings = yield* generateLearnings(query, searchResult)
			// call deepResearch recursively with decrementing depth and breadth
		}
	}
})



const main = async () => {
	const prompt = "What does it take to learn an new language fast ?"
	const research = runtime.runPromise(deepResearch(prompt))
}

main()
