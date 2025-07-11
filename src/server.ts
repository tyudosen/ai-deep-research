import { Layer } from "effect";
import { HttpApiBuilder, HttpApiSwagger, HttpServer } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";
import { appLayers } from "./services/runtime.js";
import { DeepResearchApiGroupLive } from "./handlers/deep-research.js";
import { AuthApiGroupLive } from "./handlers/auth.js";
import { Api } from "./api/index.js";



export const ApiLive = HttpApiBuilder.api(Api).pipe(
	Layer.provide(
		DeepResearchApiGroupLive
	),
	Layer.provide((
		AuthApiGroupLive
	))
)



export const ServerLive = HttpApiBuilder.serve().pipe(
	Layer.provide(HttpApiSwagger.layer()),
	Layer.provide(ApiLive),
	Layer.provide(appLayers),
	HttpServer.withLogAddress,
	Layer.provide(NodeHttpServer.layer(createServer, { port: 3007 })),
);

export const startServer = () => Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
