import { Layer } from "effect";
import { HttpApiBuilder, HttpApiSwagger } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { createServer } from "node:http";
import { DeepResearchApiLive } from "./handlers/deep-research";


export const ServerLive = HttpApiBuilder.serve().pipe(
	Layer.provide(HttpApiSwagger.layer()),
	Layer.provide(DeepResearchApiLive),
	Layer.provide(NodeHttpServer.layer(createServer, { port: 3007 })),
);

export const startServer = () => Layer.launch(ServerLive).pipe(NodeRuntime.runMain);
