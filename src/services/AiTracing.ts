import { Config, Effect } from "effect";
import { Langfuse } from 'langfuse';

export class AiTracing extends Effect.Service<AiTracing>()(
	"AiTracing",
	{
		effect: Effect.gen(function* () {

			const secretKey = yield* Config.string('LANGFUSE_SECRET_KEY')
			const publicKey = yield* Config.string('LANGFUSE_PUBLIC_KEY')
			const baseUrl = yield* Config.string('LANGFUSE_BASE_URL')



			const langfuse = new Langfuse({
				secretKey,
				publicKey,
				baseUrl
			});

			const trace = langfuse.trace({
				name: "deep-research-service",
			});


			const traceGeneration = (input: string, name: string | undefined) => Effect.gen(function* () {
				return trace.generation({
					name,
					model: "o1",
					// modelParameters: {
					// 	temperature: 0.9,
					// 	maxTokens: 2000,
					// },
					input,
				});
			})





			return {
				traceGeneration
			}
		}),
		accessors: true
	}
) { } 
