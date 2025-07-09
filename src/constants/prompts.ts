import type { Learning } from "../services/Ai.js";
import type { WebSearchResult } from "../services/WebSearch.js";

export type Research = {
        query: string | undefined
        queries: readonly string[]
        searchResults: WebSearchResult[]
        learnings: Learning[]
        completedQueries: string[]
}

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
        EVALUATE_QUERIES: ({ query, pendingResult, accumulatedSources }: { query: string; pendingResult: WebSearchResult; accumulatedSources: WebSearchResult[] }) => `Evaluate whether the search results are relevant and will help answer the following query: ${query}. If the page already exists in the existing results, mark it as irrelevant.
 
            <search_results>
            ${JSON.stringify(pendingResult)}
            </search_results>
 
            <existing_results>
            ${JSON.stringify(accumulatedSources.map((result) => result.url))}
            </existing_results>
 
            `,
        GENERATE_LEARNINGS: ({ searchResult, query }: { searchResult: WebSearchResult; query: string }) => `The user is researching "${query}". The following search result were deemed relevant.
    Generate a learning and a follow-up question from the following search result:
 
    <search_result>
    ${JSON.stringify(searchResult)}
    </search_result>
    `,
        DEEP_RESEARCH: ({ accumulatedResearch, learnings, prompt }: { accumulatedResearch: Research, learnings: Learning, prompt: string }) => `You are conducting deep research on: "${prompt}"

Based on the current research progress, generate a single, specific follow-up research query that will help answer the original question.

<research_context>
Original goal: ${prompt}
Previous queries completed: ${accumulatedResearch.completedQueries.join(', ')}
Current learnings: ${learnings.learning}
Follow-up questions identified: ${learnings.followUpQuestions.join(', ')}
</research_context>

<instructions>
1. Generate ONE specific, focused research query that hasn't been asked before
2. The query should build on current learnings and address gaps in knowledge
3. Make it more specific than previous queries to avoid duplication
4. Focus on actionable questions that can be answered through web search
5. Avoid repeating any query from the "Previous queries completed" list
</instructions>

New research query:`

} as const
