import { Effect } from "effect";
import { openai as sdkopenai } from "@ai-sdk/openai";
import { ollama as sdkollama } from 'ollama-ai-provider';
import { OpenAIChatModelId } from "@ai-sdk/openai/internal";

type OllamaChatModelId = Parameters<typeof sdkollama>[0]


export class AiModels extends Effect.Service<AiModels>()("AiModels",
	{
		effect: Effect.gen(function* () {

			const getOpenAiModel = (model: OpenAIChatModelId) => sdkopenai(model)

			const getOllamaModel = (model: OllamaChatModelId) => sdkollama(model);



			return {
				openai: getOpenAiModel,
				ollama: getOllamaModel,
			}
		})
	}
) { }
