import "dotenv/config";
import { Effect, Console } from "effect";
import { runtime } from "./services/runtime";
import { WebSearch } from "./services/WebSearch";
import { Ai } from "./services/Ai";

const foo = Effect.gen(function* () {
	const { generateSearchQueries, searchAndProcess } = yield* Ai

	const { queries } = yield* generateSearchQueries('Explain the difference between romanesco and standard italian')

	for (const query of queries) {
		yield* Effect.log(`Searching ${query}`)
		const searchResults = yield* searchAndProcess(query)
		yield* Effect.log(searchResults)
	}
})

const test = Effect.fn(function* (x: string) {
	yield* Console.log(x)

})


const main = async () => {
	runtime.runPromise(foo)
}

main()
