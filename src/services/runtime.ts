import { Layer, ManagedRuntime, ConfigProvider } from "effect";
import { AiModels } from "./AiModels";
import { Ai } from "./Ai";
import { liveConfig } from "../configs/liveConfig";
import { WebSearch } from "./WebSearch";
import { AiTracing } from "./AiTracing";

const LiveConfigProvider = Layer.setConfigProvider(
	ConfigProvider.fromMap(liveConfig)
)

const appLayers = Layer.mergeAll(
	AiModels.Default,
	Ai.Default,
	WebSearch.Default,
	AiTracing.Default
).pipe(
	Layer.provide(LiveConfigProvider)
)


export const runtime = ManagedRuntime.make(appLayers)
