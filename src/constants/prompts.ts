import { WebSearchResult } from "../services/WebSearch";

// System prompts
export const SYSTEM_PROMPTS = {
        RESEARCHER: `You are a researcher. For each query, search the web and then evaluate
		     if the results are relevant and will help answer the following query`
} as const;

// Tool descriptions
export const TOOL_DESCRIPTIONS = {
        SEARCH_WEB: `Search the web for information about a given query`,
        EVALUATE: `Evaluate the search results`
} as const;

export const PROMPTS = {
        EVALUATE_QUERIES: ({ query, pendingResult }: { query: string; pendingResult: WebSearchResult }) => `Evaluate whether the search results are relevant and will help answer the following query: ${query}. If the page already exists in the existing results, mark it as irrelevant.
 
            <search_results>
            ${JSON.stringify(pendingResult)}
            </search_results>
            `,
        GENERATE_LEARNINGS: ({ searchResult, query }: { searchResult: WebSearchResult; query: string }) => `The user is researching "${query}". The following search result were deemed relevant.
    Generate a learning and a follow-up question from the following search result:
 
    <search_result>
    ${JSON.stringify(searchResult)}
    </search_result>
    `,

} as const
