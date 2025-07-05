import { tool } from "ai"
import { generateEnum, generateObject, generateText } from "./utils"
import {
	Effect,
	pipe
} from "effect"
import z from "zod"
import { AiModels } from "./AiModels"
import {
	WebSearch,
	WebSearchResult
} from "./WebSearch"
import {
	OPENAI_MODELS,
	SEARCH_CONFIG,
	SYSTEM_PROMPTS,
	TOOL_DESCRIPTIONS,
	PROMPTS
} from "../constants"



export class Ai extends Effect.Service<Ai>()("AiService",
	{
		effect: Effect.gen(function* () {
			const generateSearchQueries = (query: string, n: number = SEARCH_CONFIG.DEFAULT_SEARCH_QUERIES_COUNT) => Effect.gen(function* () {
				const { openai } = yield* AiModels;

				const { object: queries } = yield* generateObject({
					model: openai(OPENAI_MODELS.O1),
					prompt: `Generate ${n} search queries for the following query: ${query}`,

				}, z.object({
					queries: z.array(z.string()).min(SEARCH_CONFIG.MIN_QUERIES).max(SEARCH_CONFIG.MAX_QUERIES),
				}))

				return queries
			})


			const searchAndProcess = (query: string) => Effect.gen(function* () {

				const pendingSearchResults: WebSearchResult[] = []
				const finalSearchResults: WebSearchResult[] = []
				const { openai } = yield* AiModels;
				const { searchWeb } = yield* WebSearch;



				return yield* generateText({
					model: openai(OPENAI_MODELS.O1),
					prompt: `Search the web for information about ${query}`,
					system: SYSTEM_PROMPTS.RESEARCHER,
					maxSteps: SEARCH_CONFIG.MAX_STEPS,
					tools: {
						searchWeb: tool({
							description: TOOL_DESCRIPTIONS.SEARCH_WEB,
							parameters: z.object({
								queryParam: z.string().min(1),
							}),
							execute: ({ queryParam }) => pipe(
								queryParam,
								searchWeb,
								Effect.tap((res) => pendingSearchResults.push(...res)),
								Effect.andThen((res) => res),
								Effect.runPromise
							)
						}),
						evaluate: tool({
							description: TOOL_DESCRIPTIONS.EVALUATE,
							parameters: z.object({}),
							execute: () => Effect.gen(function* () {
								const pendingResult = pendingSearchResults.pop()!
								const { object: evaluation } = yield* generateEnum({
									model: openai(OPENAI_MODELS.O1),
									prompt: PROMPTS.EVALUATE_QUERIES({ query, pendingResult })
								}, ['relevant', 'irrelevant'])

								if (evaluation === 'relevant') {
									finalSearchResults.push(pendingResult)
								}

								yield* Effect.log('Found:', pendingResult.url)
								yield* Effect.log('Evaluation completed:', evaluation)

								return evaluation === 'irrelevant'
									? 'Search results are irrelevant. Please search again with a more specific query.'
									: 'Search results are relevant. End research for this query.'

							}).pipe(Effect.runPromise)
						})
					}

				})

			})


			return { generateSearchQueries, searchAndProcess }
		}),
		dependencies: [AiModels.Default]
	}
) { }



