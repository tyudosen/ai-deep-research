
// Error types
export const ERROR_TYPES = {
	WEB_SEARCH_ERROR: "WebSearchError",
	WEB_SEARCH_RESULT_DECODE_ERROR: "WebSearchResultDecodeError",
	GENERATE_OBJECT_ERROR: "GenerateObjectError",
	GENERATE_TEXT_ERROR: "GenerateTextError"
} as const;

// AI Model types
export const OPENAI_MODELS = {
	GPT_4_TURBO: "gpt-4-turbo",
	O1: "o1"
};

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
	MAX_QUERIES: 5,
	DEFAULT_DEPTH: 3
} as const;
