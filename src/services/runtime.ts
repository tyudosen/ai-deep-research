import { Layer, ManagedRuntime, ConfigProvider } from "effect";
import { AiModels } from "./AiModels";
import { Ai } from "./Ai";
import { liveConfig } from "../configs/liveConfig";
import { WebSearch } from "./WebSearch";

const LiveConfigProvider = Layer.setConfigProvider(
	ConfigProvider.fromMap(liveConfig)
)

export const appLayers = Layer.mergeAll(
	AiModels.Default,
	Ai.Default,
	WebSearch.Default,
).pipe(
	Layer.provide(LiveConfigProvider)
)


export const runtime = ManagedRuntime.make(appLayers)
