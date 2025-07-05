import { Data, Effect, pipe, Schema, Config } from "effect";
import Exa from 'exa-js'
import { ERROR_TYPES, SEARCH_CONFIG } from "../constants";

const WebSearchResultSchema = Schema.Struct({
	title: Schema.NonEmptyString,
	url: Schema.NonEmptyString,
	text: Schema.NonEmptyString
}).pipe(
	Schema.transform(
		Schema.Struct({
			title: Schema.NonEmptyString,
			url: Schema.NonEmptyString,
			content: Schema.NonEmptyString

		}),
		{
			decode: ({ title, url, text }) => ({
				title,
				url,
				content: text
			}),
			encode: ({ title, url, content }) => ({
				title,
				url,
				text: content
			})
		}
	)
)

export type WebSearchResult = typeof WebSearchResultSchema.Type

const webSearchResultDecoder = Schema.decodeUnknown(WebSearchResultSchema)


class WebSearchError extends Data.TaggedError(ERROR_TYPES.WEB_SEARCH_ERROR)<
	{
		cause: unknown
	}
> { }

class WebSearchResultDecodeError extends Data.TaggedError(ERROR_TYPES.WEB_SEARCH_RESULT_DECODE_ERROR)<
	{
		cause: unknown
	}
> { }


export class WebSearch extends Effect.Service<WebSearch>()("WebSearch",
	{
		effect: Effect.gen(function* () {
			const exaApiKey = yield* Config.string('EXA_API_KEY')
			const exa = new Exa(exaApiKey)


			const searchWeb = (query: string) => pipe(
				Effect.tryPromise({
					try: () => exa.searchAndContents(query, {
						numResults: SEARCH_CONFIG.DEFAULT_NUM_RESULTS,
						livecrawl: SEARCH_CONFIG.LIVECRAWL
					}),
					catch: (e) => new WebSearchError({ cause: e })
				}),
				Effect.flatMap(({ results }) =>
					Effect.all(
						results.map((r) =>
							webSearchResultDecoder(r).pipe(
								Effect.mapError((e) => new WebSearchResultDecodeError({ cause: e }))
							)
						)
					)
				)
			)


			return {
				searchWeb
			}


		})
	}
) { }
