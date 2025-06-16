import { Layer, ManagedRuntime } from "effect";
import { AiModels } from "./AiModels";
import { Ai } from "./Ai";

const appLayers = Layer.mergeAll(
	AiModels.Default,
	Ai.Default
)


export const runtime = ManagedRuntime.make(appLayers)
