import { generateObject as aiGenerateObject, generateText as aiGenerateText } from "ai";
import { Data, Effect } from "effect";
import { ERROR_TYPES, OPENAI_MODELS } from "../constants";
import { ZodSchema } from "zod";
import { AiModels } from "./AiModels";
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
type Options =
	// start by dropping `output`, `model` and `schema` all at once
	Omit<GenerateObjectOptions, 'output' | 'model'>
	// now re‐add `model` and `schema`, but make them optional
	& Partial<Pick<GenerateObjectOptions, 'model'>>
	;

interface TraceMetadata {
	calledFrom: string;
	[key: string]: any
}




export const generateObject = Effect.fn("generateObject")(function* (options: Options, schema: ZodSchema, metadata: TraceMetadata) {
	const { openai } = yield* AiModels
	return yield* Effect.tryPromise({
		try: () => {

			const res = aiGenerateObject({
				...options,
				model: openai(OPENAI_MODELS.O1),
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
			})

			return res
		},
		catch: (error) => new GenerateObjectError({ error })
	})

})


export const generateEnum = Effect.fn("generateEnum")(function* (options: Omit<GenerateObjectOptions, 'output'>, enums: string[], metadata: TraceMetadata) {
	return yield* Effect.tryPromise({
		try: () => {

			const res = aiGenerateObject({
				...options,
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
			})


			return res
		},
		catch: (error) => new GenerateObjectError({ error })
	})

})


export const generateText = Effect.fn("generateText")(function* (options: GenerateTextOptions, metadata: TraceMetadata) {
	return yield* Effect.tryPromise({
		try: () => {

			const res = aiGenerateText({
				...options,
				experimental_telemetry: {
					isEnabled: true,
					functionId: `generate-text-function-${randomUUID()}`,
					metadata: {
						...metadata,
						langfuseTraceId: parentTraceId,
						langfuseUpdateParent: false
					}
				},
			})


			return res
		},
		catch: (error) => new GenerateTextError({ error })
	})
})
