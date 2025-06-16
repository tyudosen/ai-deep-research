import { Schema, Effect } from "effect";
import { openai as sdkopenai } from "@ai-sdk/openai";

const OpenAIModelSchema = Schema.Literal('gpt-4o-mini', 'gpt-4-turbo', 'o1');
type OpenAIModelType = Schema.Schema.Type<typeof OpenAIModelSchema>

export class AiModels extends Effect.Service<AiModels>()(
	"AiModels",
	{
		effect: Effect.gen(function* () {

			const getOpenAiModel = (model: OpenAIModelType) => sdkopenai(model)



			return {
				openai: getOpenAiModel
			}
		})
	}
) { }
