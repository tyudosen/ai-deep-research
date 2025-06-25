import { generateObject, generateText, tool } from "ai"
import { Data, Effect, pipe } from "effect"
import z from "zod"
import { AiModels } from "./AiModels"
import { WebSearch, WebSearchResult } from "./WebSearch"
import { AiTracing } from "./AiTracing"


class GenerateObjectError extends Data.TaggedError("GenerateObjectError")<
	{
		data: unknown
	}
> { }

class GenerateTextError extends Data.TaggedError("GenerateTextError")<
	{
		data: unknown
	}
> { }



export class Ai extends Effect.Service<Ai>()(
	"AiService",
	{
		effect: Effect.gen(function* () {
			const generateSearchQueries = (query: string, n: number = 3) => Effect.gen(function* () {
				const { openai } = yield* AiModels;
				const trace = yield* AiTracing.traceGeneration(query, 'generateSearchQueries');
				const { object: queries } = yield* Effect.tryPromise({
					try: () => generateObject({
						model: openai('o1'),
						prompt: `Generate ${n} search queries for the following query: ${query}`,
						schema: z.object({
							queries: z.array(z.string()).min(1).max(5),
						})
					}),
					catch: (e) => new GenerateObjectError({ data: e })
				})

				trace.end({
					output: queries
				})
				return queries
			})


			const searchAndProcess = (query: string) => Effect.gen(function* () {

				const pendingSearchResults: WebSearchResult[] = []
				const finalSearchResults: WebSearchResult[] = []
				const { openai } = yield* AiModels;
				const { searchWeb } = yield* WebSearch;


				return yield* Effect.tryPromise({
					try: () => generateText({
						model: openai('o1'),
						prompt: `Search the web for information about ${query}`,
						system:
							'You are a researcher. For each query, search the web and then evaluate if the results are relevant and will help answer the following query',
						maxSteps: 5,
						tools: {
							searchWeb: tool({
								description: 'Search the web for information about a given query',
								parameters: z.object({
									query: z.string().min(1),
								}),
								execute: ({ query }) => pipe(
									query,
									searchWeb,
									Effect.tap((res) => pendingSearchResults.push(...res)),
									Effect.andThen((res) => res),
									Effect.runPromise
								)
							})
						}
					}),
					catch: (e) => new GenerateTextError({ data: e })
				})
			})


			return { generateSearchQueries, searchAndProcess }
		}),
		dependencies: [AiModels.Default]
	}
) { }

