import { OpenAIChatModelId } from "@ai-sdk/openai/internal";

// Error types
export const ERROR_TYPES = {
	WEB_SEARCH_ERROR: "WebSearchErrr",
	WEB_SEARCH_RESULT_DECODE_ERROR: "WebSearchErrr",
	GENERATE_OBJECT_ERROR: "GenerateObjectError",
	GENERATE_TEXT_ERROR: "GenerateTextError"
} as const;

// AI Model types
export const OPENAI_MODELS = {
	GPT_4O_MINI: "gpt-4o-mini",
	GPT_4_TURBO: "gpt-4-turbo",
	O1: "o1"
} as const;

// Tracing names
export const TRACE_NAMES = {
	DEEP_RESEARCH_SERVICE: "deep-research-service",
	GENERATE_SEARCH_QUERIES: "generateSearchQueries",
	SEARCH_AND_PROCESS: "searchAndProcess"
} as const;


// Search configuration
export const SEARCH_CONFIG = {
	DEFAULT_NUM_RESULTS: 1,
	LIVECRAWL: "always",
	MAX_STEPS: 5,
	DEFAULT_SEARCH_QUERIES_COUNT: 3,
	MIN_QUERIES: 1,
	MAX_QUERIES: 5
} as const;
