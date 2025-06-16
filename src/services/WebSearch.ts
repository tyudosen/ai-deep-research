import { Data, Effect, pipe, Schema } from "effect";
import Exa from 'exa-js'

const WebSearchResultSchema = Schema.Struct({
	title: Schema.NonEmptyString,
	url: Schema.NonEmptyString,
	content: Schema.NonEmptyString
})
const webSearchResultDecoder = Schema.decodeUnknown(WebSearchResultSchema)

const exa = new Exa(process.env.EXA_API_KEY)

class WebSearchError extends Data.TaggedError("WebSearchErrr")<
	{
		cause: unknown
	}
> { }

class WebSearchResultDecodeError extends Data.TaggedError("WebSearchErrr")<
	{
		cause: unknown
	}
> { }


export class WebSearch extends Effect.Service<WebSearch>()(
	"WebSearch",
	{
		effect: Effect.gen(function* () {
			const searchWeb = (query: string) => Effect.gen(function* () {
				const { results } = yield* Effect.tryPromise({
					try: () => exa.searchAndContents(query, {
						numResults: 1,
						livecrawl: 'always',
					}),
					catch: (e) => new WebSearchError({ cause: e })
				})

				const decodedResults = results.map((r) => pipe(
					webSearchResultDecoder(r),
					Effect.mapError((error) => new WebSearchResultDecodeError({ cause: error }))
				))

				return decodedResults


			})


			return {
				searchWeb
			}


		})
	}
) { }
