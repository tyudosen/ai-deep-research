import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { LangfuseExporter } from "langfuse-vercel";
import 'dotenv/config'


export const sdk = new NodeSDK({
	traceExporter: new LangfuseExporter(),
	instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start()
