# Horase Racing RAG: Official Development Plan

## 1. Project Overview

This document outlines the comprehensive development plan for the Horase Racing RAG project. The goal is to build an edge-first, AI-powered prediction engine for horse racing, providing real-time analysis and recommendations to users. The system is designed with a "guardrail-first" approach, prioritizing security, safety, and reliability.

## 2. System Architecture

### 2.1. Architectural Vision

Edge-first RAG: PDFs and live data feeds are processed by a FastAPI ingestion service, with embeddings stored in Cloudflare Vectorize. A Cloudflare Worker retrieves this data, orchestrates an OpenAI agent, and streams the results to a Vite-based frontend via Server-Sent Events (SSE).

### 2.2. System Components

*   **Frontend (Vite):** A TypeScript-based Single Page Application (SPA) responsible for user interaction, data display, and handling SSE connections. It will use Zod for client-side validation.

*   **Edge Layer (Cloudflare Workers):** The core of the application, responsible for:
    *   User authentication and session management.
    *   Orchestrating the AI agent using the OpenAI Agents SDK.
    *   Executing edge guardrails (input validation, moderation).
    *   Calling tools (RAG query, odds fetching).
    *   Streaming responses to the client via SSE.

*   **Ingestion Service (FastAPI):** A Python-based service for processing data:
    *   Handling PDF uploads.
    *   Chunking and embedding text using LangChain.
    *   Upserting vectors into Cloudflare Vectorize.
    *   Providing a RAG query endpoint for the Worker to use as a tool.

*   **Vector Store (Cloudflare Vectorize):** The primary storage for embeddings, chosen for its low-latency performance at the edge.

*   **Authentication (Supabase):** Google-only OAuth for user authentication.

*   **Database (Supabase/Postgres):** For persisting user data, prediction snapshots, and the Human-in-the-Loop (HITL) queue.

### 2.3. Architecture Diagram

```mermaid
flowchart LR
  A[User (browser)] -->|SSE| B[Cloudflare Worker API]
  B --> C[Vectorize (retrieve)]
  B --> D[OpenAI Agents SDK]
  E[FastAPI ingest] -->|upsert vectors| C
  F[Odds provider] -->|poll/webhook| B
  E --> C
```

## 3. Technology Stack

*   **Frontend:** Vite, React, TypeScript, Tailwind CSS, shadcn/ui, Zod
*   **Edge/Worker:** Cloudflare Workers, Hono, TypeScript, OpenAI Agents SDK
*   **Ingestion Service:** FastAPI, Python, LangChain, Pydantic
*   **Vector Store:** Cloudflare Vectorize
*   **Authentication & DB:** Supabase
*   **CI/CD:** GitHub Actions

## 4. Security & Guardrails

*   **Multi-Layered Approach:**
    1.  **Edge Input Guardrails:** Early rejection of invalid requests (length, blacklisted patterns, moderation API).
    2.  **Relevance Filter:** A fast classifier to ensure queries are in-scope.
    3.  **Tool Risk Rating:** Scoring tools (low, medium, high) to trigger additional checks.
    4.  **Output Validation:** Strict Zod schema validation on all AI outputs.
    5.  **Human-in-the-Loop (HITL):** Escalation for high-risk actions or low-confidence predictions.
*   **Secret Management:** All secrets (API keys, etc.) will be managed through Cloudflare secrets or a similar vault. No secrets will be stored in the frontend.

## 5. Development Plan

### 5.1. Sprint Plan

*   **Sprint 0 (3 days):** Repository scaffold, documentation, secret management setup, and a basic "hello world" dev flow.
*   **Sprint 1 (7 days):** Build the frontend UI with Vite, implement the SSE client, create the basic Worker SSE skeleton, and integrate Google authentication via Supabase.
*   **Sprint 2 (7 days):** Develop the full ingestion pipeline (PDF -> chunk -> embed -> Vectorize), and implement the RAG query tool in the Worker.
*   **Sprint 3 (7 days):** Integrate the OpenAI Agents SDK, implement the full guardrail system, build the HITL UI, and set up CI/CD for deployment and monitoring.

### 5.2. Commit Sequence (First Commits)

1.  `0001/init`: Initialize the repository with the folder structure and initial documentation.
2.  `0002/frontend-bootstrap`: Set up the Vite project with Tailwind CSS and shadcn/ui.
3.  `0003/workers-sse-skeleton`: Create the basic SSE endpoint in the Worker.
4.  `0004/ingest-stub`: Create the FastAPI service skeleton.
5.  `0005/schema-gen`: Implement the schema generation tool and CI check.

### 5.3. Final Folder Structure

/horase-racing-rag
├─ .github/
│  └─ workflows/
├─ docs/
│  └─ ADRs/
├─ infra/
│  └─ terraform/
├─ frontend/
│  └─ src/
│     ├─ pages/
│     ├─ components/
│     └─ lib/
├─ workers/
│  └─ src/
│     ├─ api/
│     ├─ lib/
│     └─ tools/
├─ ingest-service/
│  └─ app/
│     ├─ ingest/
│     └─ query/
├─ tools/
└─ test/
   ├─ frontend/
   ├─ workers/
   └─ ingest-service/

## 6. API Specification

*   **Auth:** `GET /auth/google`, `GET /auth/callback`
*   **Main API (Worker):**
    *   `GET /api/predict?sse=1&race_id=...`: The main SSE endpoint for predictions.
    *   Other endpoints for races, snapshots, etc.
*   **SSE Contract:**
    *   `baseline`: Initial, fast prediction.
    *   `progress`: Streaming updates.
    *   `final`: The final JSON payload, validated against a Zod schema.

## 7. Testing & Evaluation

*   **Unit Tests:** For individual functions, especially guardrails.
*   **Integration Tests:** End-to-end tests for the SSE flow.
*   **Prompt Tests:** Fixture-based tests for prompt templates.
*   **Backtesting:** A harness to evaluate model performance on historical data.

This document will be the single source of truth for our development efforts. All future planning and discussions should reference this plan.
