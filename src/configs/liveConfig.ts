import { env } from "../env";

export const liveConfig = new Map([
	['OPENAI_API_KEY', env.OPENAI_API_KEY],
	['EXA_API_KEY', env.EXA_API_KEY],
	['LANGFUSE_BASE_URL', env.LANGFUSE_BASE_URL],
	['LANGFUSE_SECRET_KEY', env.LANGFUSE_SECRET_KEY],
	['LANGFUSE_PUBLIC_KEY', env.LANGFUSE_PUBLIC_KEY],
]); 
