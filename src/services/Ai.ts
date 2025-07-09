import { tool } from "ai"
import { generateEnum, generateObject, generateText } from "./utils.js"
import {
	Effect,
	Schema
} from "effect"
import z from "zod"
import { AiModels } from "./AiModels.js"
import { WebSearch } from "./WebSearch.js"
import type { WebSearchResult } from "./WebSearch.js"
import {
	SEARCH_CONFIG,
	SYSTEM_PROMPTS,
	TOOL_DESCRIPTIONS,
	PROMPTS
} from "../constants/index.js"
import { runtime } from "./runtime.js"

const GenerateSearchQueriesObject = Schema.Struct({
	queries: Schema.Array(Schema.String).pipe(Schema.minItems(SEARCH_CONFIG.MIN_QUERIES), Schema.maxItems(SEARCH_CONFIG.MAX_QUERIES))
})
const generateSearchQueriesObjectDecoder = Schema.decodeUnknown(GenerateSearchQueriesObject)

const GenerateLearningsObject = Schema.Struct({
	learning: Schema.String,
	followUpQuestions: Schema.Array(Schema.String)
})
export type Learning = typeof GenerateLearningsObject.Type;

const generateLearningsObjectDecoder = Schema.decodeUnknown(GenerateLearningsObject)

// const ToolParameterObject = Schema.Struct({
// 	queryParam: Schema.String.pipe(Schema.minLength(1))
// })
// const toolParameterObjectDecoder = Schema.decodeUnknown(ToolParameterObject)



export class Ai extends Effect.Service<Ai>()("AiService",
	{
		effect: Effect.gen(function* () {
			const generateSearchQueries = Effect.fn("generateSearchQueries")(function* (query: string, n: number = SEARCH_CONFIG.DEFAULT_SEARCH_QUERIES_COUNT) {
				const { openai } = yield* AiModels;

				const { object: queries } = yield* generateObject({
					model: openai('gpt-4.1-mini'),
					prompt: `Generate ${n} search queries for the following query: ${query}`,

				}, z.object({
					queries: z.array(z.string()).min(SEARCH_CONFIG.MIN_QUERIES).max(SEARCH_CONFIG.MAX_QUERIES),
				}), {
					calledFrom: 'ai-service-generateSearchQueries-function'
				}).pipe(
					Effect.catchTags({
						GenerateObjectError: () => Effect.succeed({ object: { queries: [] } })
					})
				)

				return yield* generateSearchQueriesObjectDecoder(queries).pipe(
					Effect.catchTags({
						ParseError: () => Effect.succeed({ queries: [] })
					})
				)
			})

			const searchAndProcess = Effect.fn("searchAndProcess")(function* (query: string, accumulatedSources: WebSearchResult[]) {
				const pendingSearchResults: WebSearchResult[] = []
				const finalSearchResults: WebSearchResult[] = []
				const { openai } = yield* AiModels;
				const { searchWeb } = yield* WebSearch;



				yield* generateText({
					model: openai('gpt-4.1-mini'),
					prompt: `Search the web for information about ${query}`,
					system: SYSTEM_PROMPTS.RESEARCHER,
					maxSteps: SEARCH_CONFIG.MAX_STEPS,
					tools: {
						searchWeb: tool({
							description: TOOL_DESCRIPTIONS.SEARCH_WEB,
							parameters: z.object({
								queryParam: z.string().min(1),
							}),
							execute: ({ queryParam }): Promise<{
								readonly title: string;
								readonly url: string;
								readonly content: string;
							}[] | never[]> => Effect.gen(function* () {
								const searchResults = yield* searchWeb(queryParam)

								pendingSearchResults.push(...searchResults)
								yield* Effect.log(`searchResults count: ${searchResults.length}`)

								return searchResults

							}).pipe(runtime.runPromise)
						}),
						evaluate: tool({
							description: TOOL_DESCRIPTIONS.EVALUATE,
							parameters: z.object({}),
							execute: (): Promise<string> => Effect.gen(function* () {
								const pendingResult = pendingSearchResults.pop()!
								const { object: evaluation } = yield* generateEnum({
									model: openai('gpt-4.1-mini'),
									prompt: PROMPTS.EVALUATE_QUERIES({ query, pendingResult, accumulatedSources })
								}, ['relevant', 'irrelevant'], {
									calledFrom: 'ai-service-evaluate-tool-function'
								})

								yield* Effect.log(`Evaluation --> ${evaluation}`)

								if (evaluation === 'relevant') {
									finalSearchResults.push(pendingResult)
								}

								yield* Effect.log('Found:', pendingResult.url)
								yield* Effect.log('Evaluation completed:', evaluation)

								return evaluation === 'irrelevant'
									? 'Search results are irrelevant. Please search again with a more specific query.'
									: 'Search results are relevant. End research for this query.'

							}).pipe(
								Effect.catchTags({
									GenerateObjectError: (_error) => {
										Effect.log(`Evaluate failed: ${_error}`);
										return Effect.succeed('GenerateObjectError so this result is irrelevant')
									}
								}),
								runtime.runPromise)
						})
					}

				}, {
					calledFrom: 'ai-service-searchAndProcess-function'
				}).pipe(
					Effect.catchTags({
						GenerateTextError: () => Effect.succeed('')
					})
				)

				yield* Effect.log(`finalSearchResult: ${finalSearchResults.length}`)

				return finalSearchResults;

			})

			const generateLearnings = Effect.fn("generate-learnings-ai-service")(function* (query: string, searchResult: WebSearchResult) {
				const { object: learnings } = yield* generateObject({
					prompt: PROMPTS.GENERATE_LEARNINGS({ query, searchResult })
				}, z.object({
					learning: z.string(),
					followUpQuestions: z.array(z.string())
				}), {
					calledFrom: 'ai-service-generateLearnings-function'
				}).pipe(
					Effect.catchAll(() => Effect.succeed({
						object: {
							learnings: {
								learning: '',
								followUpQuestions: []

							}
						}
					}))
				)


				return yield* generateLearningsObjectDecoder(learnings).pipe(
					Effect.catchAll(() => Effect.succeed({
						learning: '',
						followUpQuestions: []

					}))
				)

			})



			return {
				generateSearchQueries,
				searchAndProcess,
				generateLearnings
			}
		}),
		dependencies: [AiModels.Default]
	}
) { }
