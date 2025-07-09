import { generateObject as aiGenerateObject, generateText as aiGenerateText } from "ai";
import { Data, Effect } from "effect";
import { ERROR_TYPES } from "../constants/index.js";
import type { Research } from "../constants/index.js";
import { ZodSchema } from "zod";
import { AiModels } from "./AiModels.js";
import { randomUUID } from "crypto";
import { Langfuse } from "langfuse";

const langfuse = new Langfuse();
const parentTraceId = randomUUID();

langfuse.trace({
	id: parentTraceId,
	name: "deep-research",
});


class GenerateObjectError extends Data.TaggedError(ERROR_TYPES.GENERATE_OBJECT_ERROR)<
	{
		error: unknown
	}
> { }

class GenerateTextError extends Data.TaggedError(ERROR_TYPES.GENERATE_TEXT_ERROR)<
	{
		error: unknown
	}
> { }

type GenerateObjectOptions = Parameters<typeof aiGenerateObject>[0]
type GenerateTextOptions = Parameters<typeof aiGenerateText>[0];
type ObjectOptions =
	// start by dropping `output`, `model` and `schema` all at once
	Omit<GenerateObjectOptions, 'output' | 'model'>
	// now re‐add `model` and `schema`, but make them optional
	& Partial<Pick<GenerateObjectOptions, 'model'>>
	;
type TextOptions =
	// start by dropping `output`, `model` and `schema` all at once
	Omit<GenerateTextOptions, 'output' | 'model'>
	// now re‐add `model` and `schema`, but make them optional
	& Partial<Pick<GenerateTextOptions, 'model'>>
	;


interface TraceMetadata {
	calledFrom: string;
	[key: string]: any
}




export const generateObject = Effect.fn("generateObject")(function* (options: ObjectOptions, schema: ZodSchema, metadata: TraceMetadata) {
	const { openai } = yield* AiModels
	return yield* Effect.tryPromise({
		try: () => {

			const res = aiGenerateObject({

				model: openai('gpt-4.1-mini'),
				output: 'object',
				schema,
				experimental_telemetry: {
					isEnabled: true,
					functionId: `generate-object-function-${randomUUID()}`,
					metadata: {
						...metadata,
						langfuseTraceId: parentTraceId,
						langfuseUpdateParent: false
					}
				},
				...options,
			})

			return res
		},
		catch: (error) => new GenerateObjectError({ error })
	})

})


export const generateEnum = Effect.fn("generateEnum")(function* (options: ObjectOptions, enums: string[], metadata: TraceMetadata) {
	const { openai } = yield* AiModels
	return yield* Effect.tryPromise({
		try: () => {

			const res = aiGenerateObject({

				model: openai('gpt-4.1-mini'),
				output: 'enum',
				enum: enums,
				experimental_telemetry: {
					isEnabled: true,
					functionId: `generate-enum-function-${randomUUID()}`,
					metadata: {
						...metadata,
						langfuseTraceId: parentTraceId,
						langfuseUpdateParent: false
					}
				},
				...options,
			})


			return res
		},
		catch: (error) => new GenerateObjectError({ error })
	})

})


export const generateText = Effect.fn("generateText")(function* (options: TextOptions, metadata: TraceMetadata) {
	const { openai } = yield* AiModels;
	return yield* Effect.tryPromise({
		try: () => {

			const res = aiGenerateText({
				model: openai('gpt-4.1-mini'),
				experimental_telemetry: {
					isEnabled: true,
					functionId: `generate-text-function-${randomUUID()}`,
					metadata: {
						...metadata,
						langfuseTraceId: parentTraceId,
						langfuseUpdateParent: false
					}
				},
				...options,
			})


			return res
		},
		catch: (error) => new GenerateTextError({ error })
	})
})

export const generateReport = Effect.fn('generate-report')(function* (research: Research, metadata: TraceMetadata) {
	const { openai } = yield* AiModels;
	const { text } = yield* generateText({
		model: openai('gpt-4.1-mini'),
		prompt: 'Generate a report based on the following research data:\n\n' +
			JSON.stringify(research, null, 2),
		experimental_telemetry: {
			isEnabled: true,
			functionId: `generate-object-function-${randomUUID()}`,
			metadata: {
				...metadata,
				langfuseTraceId: parentTraceId,
				langfuseUpdateParent: false
			}
		},
	}, {
		calledFrom: 'generate-report-ai-service'
	})

	return text


})

