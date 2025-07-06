import { Effect, Layer } from "effect";
import { HttpApiBuilder } from "@effect/platform";
import { DeepResearchApi } from "../api/deep-research";
import { appLayers, runtime } from "../services/runtime";
import { Ai } from "../services/Ai";
import { HttpApiDecodeError } from "@effect/platform/HttpApiError";

const deepResearch = Effect.fn('deep-research')(function* (
	query: string,
	depth: number = 1,
	breadth: number = 3
) {
	const { generateSearchQueries, searchAndProcess, generateLearnings } = yield* Ai
	const res = [];

	const { queries } = yield* generateSearchQueries(query)

	for (const query of queries) {
		yield* Effect.log(`Searching the web for: ${query}`)
		const searchResults = yield* searchAndProcess(query)
		for (const searchResult of searchResults) {
			console.log(`Processing search result: ${searchResult.url}`)
			const learnings = yield* generateLearnings(query, searchResult)
			// call deepResearch recursively with decrementing depth and breadth
			res.push(learnings)
		}
	}

	return res;
})






export const DeepResearchApiGroupLive = HttpApiBuilder.group(DeepResearchApi, "DeepResearchApiGroup", (handlers) =>
	handlers.handle(
		"research",
		({ urlParams }) => {
			const prompt = urlParams.query;
			return deepResearch(prompt).pipe(Effect.mapError(() => new HttpApiDecodeError({
				message: 'test',
				issues: []
			})))

		}
	)
).pipe(Layer.provide(appLayers));

export const DeepResearchApiLive = HttpApiBuilder.api(DeepResearchApi).pipe(Layer.provide(DeepResearchApiGroupLive));
