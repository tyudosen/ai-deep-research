import "dotenv/config";
import { Effect, Console } from "effect";
import { runtime } from "./services/runtime";
import { WebSearch } from "./services/WebSearch";
import { Ai } from "./services/Ai";
import { sdk } from "../instrumentation";

const foo = Effect.gen(function* () {
	const { generateSearchQueries, searchAndProcess } = yield* Ai

	const { queries } = yield* generateSearchQueries('Explain the difference between romanesco and standard italian', 1)

	for (const query of queries) {
		yield* Effect.log(`Searching ${query}`)
		const searchResults = yield* searchAndProcess(query)
		yield* Effect.log(searchResults)
	}

	yield* Effect.promise(() => sdk.shutdown())
})

const main = async () => {
	runtime.runPromise(foo)
}

main()
