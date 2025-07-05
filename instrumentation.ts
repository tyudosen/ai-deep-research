import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { LangfuseExporter } from "langfuse-vercel";
import 'dotenv/config'

const env = process.env

export const sdk = new NodeSDK({
	traceExporter: new LangfuseExporter({
		secretKey: env.LANGFUSE_SECRET_KEY,
		publicKey: env.LANGFUSE_PUBLIC_KEY,
		baseUrl: env.LANGFUSE_BASEURL, // 🇪🇺 EU region
		// baseUrl: "https://us.cloud.langfuse.com", // 🇺🇸 US region
	}),
	instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start()
