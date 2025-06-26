import { generateObject, generateText, tool } from "ai"
import { Data, Effect, pipe } from "effect"
import z from "zod"
import { AiModels } from "./AiModels"
import { WebSearch, WebSearchResult } from "./WebSearch"
import { AiTracing } from "./AiTracing"
import { ERROR_TYPES, OPENAI_MODELS, TRACE_NAMES, SEARCH_CONFIG } from "../constants"
import { SYSTEM_PROMPTS, TOOL_DESCRIPTIONS } from "../constants/prompts"


class GenerateObjectError extends Data.TaggedError(ERROR_TYPES.GENERATE_OBJECT_ERROR)<
	{
		data: unknown
	}
> { }

class GenerateTextError extends Data.TaggedError(ERROR_TYPES.GENERATE_TEXT_ERROR)<
	{
		data: unknown
	}
> { }



export class Ai extends Effect.Service<Ai>()("AiService",
	{
		effect: Effect.gen(function* () {
			const generateSearchQueries = (query: string, n: number = SEARCH_CONFIG.DEFAULT_SEARCH_QUERIES_COUNT) => Effect.gen(function* () {
				const { openai } = yield* AiModels;
				const trace = yield* AiTracing.traceGeneration(query, TRACE_NAMES.GENERATE_SEARCH_QUERIES);
				const { object: queries } = yield* Effect.tryPromise({
					try: () => generateObject({
						model: openai(OPENAI_MODELS.O1),
						prompt: `Generate ${n} search queries for the following query: ${query}`,
						schema: z.object({
							queries: z.array(z.string()).min(SEARCH_CONFIG.MIN_QUERIES).max(SEARCH_CONFIG.MAX_QUERIES),
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
						model: openai(OPENAI_MODELS.O1),
						prompt: `Search the web for information about ${query}`,
						system: SYSTEM_PROMPTS.RESEARCHER,
						maxSteps: SEARCH_CONFIG.MAX_STEPS,
						tools: {
							searchWeb: tool({
								description: TOOL_DESCRIPTIONS.SEARCH_WEB,
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

