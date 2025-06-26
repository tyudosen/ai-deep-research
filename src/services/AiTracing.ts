import { Config, Effect } from "effect";
import { Langfuse } from 'langfuse';
import { TRACE_NAMES, OPENAI_MODELS } from "../constants";

export class AiTracing extends Effect.Service<AiTracing>()("AiTracing",
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
				name: TRACE_NAMES.DEEP_RESEARCH_SERVICE,
			});


			const traceGeneration = (input: string, name: string | undefined) => Effect.gen(function* () {
				return trace.generation({
					name,
					model: OPENAI_MODELS.O1,
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
