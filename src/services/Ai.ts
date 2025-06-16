import { generateText, generateObject } from "ai"
import { Data, Effect } from "effect"
import z from "zod"
import { AiModels } from "./AiModels"

class GenerateTextError extends Data.TaggedError("GenerateTextError")<
	{
		data: unknown
	}
> { }

class GenerateObjectError extends Data.TaggedError("GenerateTextError")<
	{
		data: unknown
	}
> { }


export class Ai extends Effect.Service<Ai>()(
	"AiService",
	{
		effect: Effect.gen(function* () {
			const { openai } = yield* AiModels

			const generateTextEffect = Effect.tryPromise({
				try: () => generateText({
					model: openai('gpt-4-turbo'),
					prompt: "What is love?"
				}),
				catch: (e) => new GenerateTextError({ data: e })
			})

			const generateSearchQueries = (query: string, n: number = 3) => Effect.gen(function* () {
				const { openai } = yield* AiModels;
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


				return queries
			})


			return { generateTextEffect }
		}),
		dependencies: [AiModels.Default]
	}
) { }

