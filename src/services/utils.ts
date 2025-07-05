import { generateObject as aiGenerateObject, generateText as aiGenerateText } from "ai";
import { Data, Effect } from "effect";
import { ERROR_TYPES } from "../constants";
import { ZodSchema } from "zod";


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




export const generateObject = Effect.fn("generateObject")(function* (options: Omit<GenerateObjectOptions, 'output'>, schema: ZodSchema) {
	return yield* Effect.tryPromise({
		try: () => {

			const res = aiGenerateObject({
				...options,
				output: 'object',
				schema,
				experimental_telemetry: {
					isEnabled: true,
					functionId: "generate-object-function",
					// metadata: {
					// 	something: "custom",
					// 	someOtherThing: "other-value",
					// },
				},
			})

			return res
		},
		catch: (error) => new GenerateObjectError({ error })
	})

})


export const generateEnum = Effect.fn("generateEnum")(function* (options: Omit<GenerateObjectOptions, 'output'>, enums: string[]) {
	return yield* Effect.tryPromise({
		try: () => {

			const res = aiGenerateObject({
				...options,
				output: 'enum',
				enum: enums,
				experimental_telemetry: {
					isEnabled: true,
					functionId: "generate-enum-function",
				},
			})


			return res
		},
		catch: (error) => new GenerateObjectError({ error })
	})

})


export const generateText = Effect.fn("generateText")(function* (options: GenerateTextOptions) {
	return yield* Effect.tryPromise({
		try: () => {

			const res = aiGenerateText({
				...options,
				experimental_telemetry: {
					isEnabled: true,
					functionId: "generate-text-function",
				},
			})


			return res
		},
		catch: (error) => new GenerateTextError({ error })
	})
})
