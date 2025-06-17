import { env } from "../env";

export const liveConfig = new Map([
	['OPENAI_API_KEY', env.OPENAI_API_KEY],
	['EXA_API_KEY', env.EXA_API_KEY]
]); 
