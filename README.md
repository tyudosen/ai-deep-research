# Deep Research AI Service

A production-ready Node.js service that provides intelligent deep research capabilities using AI-powered web search and analysis. The service recursively searches and analyzes web content to provide comprehensive research reports on any topic.

## Features

- **Deep Research API**: Performs recursive web searches with AI-powered analysis
- **Multi-layered Search**: Configurable depth and breadth for comprehensive research
- **Web Search Integration**: Uses Exa API for high-quality web content retrieval
- **AI-Powered Analysis**: Leverages multiple AI models (OpenAI, Google, Perplexity) for content processing
- **Structured Output**: Returns organized research data with insights and reports
- **OpenTelemetry Instrumentation**: Built-in observability and monitoring
- **TypeScript**: Fully typed with comprehensive error handling

## API Documentation

Full API documentation is available at `/docs` endpoint when the service is running.

### GET /research

Performs deep research on a given query with recursive web search and AI analysis.

**Query Parameters:**
- `query` (required): Research query (minimum 8 characters)

**Response:**
```json
{
  "research": {
    "query": "original query",
    "queries": ["generated search queries"],
    "searchResults": ["web search results"],
    "learnings": ["AI-generated insights"],
    "completedQueries": ["processed queries"]
  },
  "report": "comprehensive research report"
}
```

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Environment variables:**
   Create a `.env` file with:
   ```
   EXA_API_KEY=your_exa_api_key
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_API_KEY=your_google_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

3. **Development:**
   ```bash
   pnpm dev
   ```

4. **Production build:**
   ```bash
   pnpm build
   pnpm start
   ```

## Configuration

The service includes configurable search parameters in `src/constants/config.ts`:

- `DEFAULT_DEPTH`: How many recursive research layers (default: 3)
- `DEFAULT_NUM_RESULTS`: Number of search results per query (default: 1)
- `DEFAULT_SEARCH_QUERIES_COUNT`: Number of search queries to generate (default: 3)

## Architecture

- **Effect-based**: Built with Effect framework for functional programming
- **Modular Services**: Separate services for AI, web search, and utilities
- **Type Safety**: Comprehensive TypeScript coverage with Zod validation
- **Observability**: OpenTelemetry integration for monitoring and tracing

## Development

```bash
# Development server with hot reload
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Formatting
pnpm format

# Testing
pnpm test
```
