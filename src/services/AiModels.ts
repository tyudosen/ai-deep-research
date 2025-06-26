import { Effect } from "effect";
import { openai as sdkopenai } from "@ai-sdk/openai";
import { OpenAIChatModelId } from "@ai-sdk/openai/internal";


export class AiModels extends Effect.Service<AiModels>()("AiModels",
	{
		effect: Effect.gen(function* () {

			const getOpenAiModel = (model: OpenAIChatModelId) => sdkopenai(model)



			return {
				openai: getOpenAiModel
			}
		})
	}
) { }
