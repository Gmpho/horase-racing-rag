Below I’m wiring everything: full doc templates you can drop into docs/, a references section with authoritative links, the exact tech-stack checklist, CI bits (schema generation + deploy), commit-by-commit plan, and concrete code snippets for the parts that glue this together (auth, SSE, ingest, schema-gen). Copy/paste the markdown files into your repo and you’re golden.

I’ll keep it punchy and practical. Where I cite a source I’ll put the link right after the paragraph so you can jump to the docs. Ready? Let’s ship.

What you’ll get in this message

File-ready doc templates (drop into docs/) — README, ARCHITECTURE.md, API_SPEC.md, SECURITY.md, DATA_INGEST.md, PROMPT_LIBRARY.md, MODEL_EVAL.md, ADRs, CONTRIBUTING.md, DEPLOY.md.

Reference links for the tech stack (OpenAI Agents SDK, Cloudflare Vectorize, Workers, Vite, LangChain, FastAPI, Pydantic, Zod, json-schema-to-zod).

Commit-by-commit plan to wire everything into your existing repo.

CI snippets (GitHub Actions) for schema generation and deploy.

Short code snippets to paste into Worker & ingest service (auth + SSE + ingest + schema-gen).

Final wrap: ✅ Task list, 📂 Folder structure, 🔁 Sprint model, 🧠 Architecture.

1) Docs — copy these into docs/ (file-per-section)

Tip: create docs/ and drop these .md files. Use GitHub Pages or MkDocs to host. I kept each doc short and actionable.

docs/README.md
# Horase Racing RAG — Docs Hub

One-line: Edge-first RAG for horse racing predictions (Cloudflare Workers + Vectorize + OpenAI Agents + Python ingest).

Quick start
```bash
# dev (frontend + worker)
npm install
npm run dev

# run ingest locally
cd ingest-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000


Important links

Architecture: ARCHITECTURE.md

API spec: API_SPEC.md

Security: SECURITY.md

Data ingest: DATA_INGEST.md

Prompt library: PROMPT_LIBRARY.md

Contact / Owner: Gmpho (Ag)


## docs/ARCHITECTURE.md
```markdown
# Architecture — One-liner
Edge-first RAG: PDFs + feeds → FastAPI (ingest) → Embeddings → Cloudflare Vectorize → Cloudflare Worker (retriever + OpenAI Agents SDK) → Decision engine → SSE → Vite frontend.

## Diagram
```mermaid
flowchart LR
  A[User (browser)] -->|SSE| B[Cloudflare Worker API]
  B --> C[Vectorize (retrieve)]
  B --> D[OpenAI Agents SDK (Responses/Agents)]
  E[FastAPI ingest] -->|upsert vectors| C
  F[Odds provider] -->|poll/webhook| B
  E --> C

Components

Frontend: Vite + TypeScript + Zod for runtime schema validation.

Edge: Cloudflare Worker — auth, SSE, retriever, call OpenAI Agents SDK, provenance logging (KV). (See Cloudflare docs.) 
Cloudflare Docs
+1

Vector DB: Cloudflare Vectorize (edge-first). 
Cloudflare Docs
+1

Ingest: Python FastAPI + Pydantic + LangChain for PDF parsing/chunking/embeddings. 
LangChain
+1

Model: OpenAI Responses/Agents SDK (TypeScript) called from Worker for streaming outputs. 
OpenAI GitHub
+1

Failure modes & mitigations

Vectorize unresponsive → return baseline (odds-normalized) and mark source: rag_fallback.

OpenAI call times out → close SSE with error code; provide fallback cached snapshot.

Ingest lag → publish ingest-ready flags in KV and include vector_ready boolean in API.

SLA targets

Baseline stage: < 300ms

Final RAG stage: p95 < 2s (depends on model selection)


## docs/API_SPEC.md
```markdown
# API Spec (short)

## Auth
- `GET /auth/google` — start PKCE auth.
- `GET /auth/callback` — exchange code server-side, set HttpOnly session cookie.

## Public endpoints (Workers)
- `GET /api/me` — returns user info
- `GET /api/races?country=&date=` — list races (cached)
- `GET /api/race/:race_id` — race metadata + runners
- `GET /api/predict?sse=1&race_id=...` — SSE streaming endpoint (requires session cookie)
- `POST /api/snapshots` — persist snapshot JSON

## SSE contract (events)
- `baseline` (first event): quick odds-normalized predictions
- `progress` (zero or more): partial text / token streams
- `final` (one): final JSON (see schema)

### Final payload schema (example)
```json
{
  "race_id":"abc123",
  "timestamp":"2025-10-24T12:34:56Z",
  "predictions":[
    {"horse":"Red Bullet","prob":0.34,"confidence":0.78,"reasons":["form","jockey"],"sources":[{"id":"v_123","score":0.92,"url":"..."}]}
  ],
  "recommended_stake":{"method":"fractional_kelly","value":0.03},
  "human_summary":"One-line",
  "why_it_might_fail":"One-line"
}


Errors

401 unauthorized

429 rate_limited

500 server_error

(Generate full OpenAPI in FastAPI for ingest-service; export /openapi.json for schema generation.)


## docs/SECURITY.md
```markdown
# Security & Secrets

## Top secrets (store in Cloudflare secrets or Vault)
- OPENAI_API_KEY (Workers & ingest)
- VECTORIZE_KEY (Workers & ingest)
- GOOGLE_CLIENT_ID / SECRET
- ODDS_API_KEY

## Rules
- No provider key in frontend code or in client requests.
- Use HttpOnly, Secure cookies for session tokens.
- Worker validates `Origin` and `Referer`.
- Scrub logs: remove Authorization / x-api-key headers.

## Dev tips
- Use `wrangler secret` for Workers.
- Use `.env.local` for local dev (never commit).
- Add SCA (Dependabot) and SAST (CodeQL) in GH Actions.

## Threat model (top 3)
1. Exposed API key → rotate, revoke & run forensics.  
2. Malicious LLM prompt injection → enforce JSON only outputs; validate with Zod.  
3. Data exfiltration via ingestion → run ingestion in private network or Cloud Run with VPC.

docs/DATA_INGEST.md
# Data Ingest

## Pipeline
1. Upload PDF / feed → FastAPI `/ingest/upload` (multipart) → returns job_id
2. Background job: parse PDF (pypdf/pdftotext) → chunk (LangChain text splitter) → embed (OpenAI/HuggingFace) → upsert to Vectorize (batch)
3. Mark job complete & set `vector_ready` flag in KV.

## Chunking rules
- chunk_size: 800 chars
- overlap: 100 chars
- metadata: {race_id, date, source, page, chunk_index}

## Idempotency & dedupe
- Use a stable chunk id: `{race_id}__{sha1(page+text)}`

## Retention
- Keep raw PDFs for 90 days; keep vectors until explicitly purged.

## Backtest data
- Store snapshots in `snapshots/` (S3 or Cloudflare R2) with CSV of actual results for offline evaluation.

docs/PROMPT_LIBRARY.md
# Prompt Library (MVP)

## Prediction prompt (RAG)
System (short):
"You are Ag — a quantitative racing analyst. Use the retrieval snippets and latest odds to compute per-runner winning probabilities. Return ONLY valid JSON that matches the schema."

User input variables:
- race_metadata
- retrieved_snippets
- odds_snapshot
- staking_policy

Expected output: final JSON object (see API_SPEC).

## Guardrails
- If model output fails JSON parse → respond with `{"error":"invalid_json"}` and include raw_text.
- Always include `sources` with retrieval ids + similarity.

docs/MODEL_EVAL.md
# Model Evaluation & Backtests

Metrics:
- Brier score (per race)
- Calibration plots
- Top-1 accuracy

Backtest harness:
- Input: historical odds + race results
- Output: CSV with predictions, probs, realized outcome, stake PnL

CI:
- Run smoke backtest on PRs touching model logic (sample 100 races).

docs/ADRS/0001-agent-sdk-choice.md
# ADR 0001 — Agents SDK choice

Decision: Start with OpenAI Agents SDK (TypeScript) for runtime orchestration in Workers; keep ability to port orchestration to Google ADK later.

Rationale:
- fast iteration & streaming + Responses API features. (See OpenAI Agents SDK docs). :contentReference[oaicite:4]{index=4}

Consequences:
- Lock-in to OpenAI for agent orchestration; keep model-card and ADRs to migrate later.

docs/CONTRIBUTING.md
# Contributing

PR checklist:
- [ ] Tests added
- [ ] Docs updated if API or schema changed
- [ ] Run `npm run gen:schemas` and commit generated files (CI enforces this)

docs/DEPLOY.md
# Deploy

1. Set Cloudflare secrets (OPENAI_API_KEY, VECTORIZE_KEY, GOOGLE_CLIENT_ID/SECRET).
2. Ensure KV namespaces bound in wrangler.toml: ODDS_CACHE, AUDIT_LOGS, SESSIONS.
3. GH Actions runs on push to main: build frontend, run `npm run build && npm run deploy` (Cloudflare Pages/Workers).

2) Reference links (authoritative docs)

Open these when you need specifics — these are the docs I used to craft the plan:

OpenAI Agents SDK (TypeScript) — guide & API. 
OpenAI GitHub

OpenAI Agents / Responses API announcement & coverage. 
The Verge

Cloudflare Vectorize (overview + docs). 
Cloudflare Docs
+1

Cloudflare Workers examples & SSE guidance. 
Cloudflare Docs
+1

Cloudflare Vite plugin (dev & deploy). 
Cloudflare Docs
+1

Vite -> Cloudflare Pages deploy guide. 
Cloudflare Docs

LangChain text splitters / ingest helpers. 
LangChain

FastAPI / OpenAPI & Pydantic JSON Schema. 
FastAPI
+1

Pydantic model_json_schema docs. 
Pydantic
+1

json-schema-to-zod (npm) & Zod docs. 
npmjs.com
+1

3) Commit-by-commit plan (exact commits I’ll push if you say “go”)

I’ll assume the repo is connected to GitHub & Pages as you said.

0001/docs-bootstrap

add docs/* files from above.

add docs/adrs/0001-agent-sdk-choice.md.

0002/ingest-stub

add ingest-service/ skeleton: FastAPI app/main.py, app/schemas.py (Pydantic), Dockerfile, sample_pdfs/.

add scripts/export_schemas.py to dump JSON Schema.

0003/schema-gen-tool

add tools/gen-schemas.js (fetch http://localhost:8000/openapi.json or OPENAPI_URL) to generate Zod files via json-schema-to-zod.

add package.json scripts: gen:schemas.

0004/worker-predict-sse

add workers/api/predict.ts SSE skeleton, baseline stage, Vectorize query stub, Zod validation import.

add workers/lib/vectorize.ts wrapper.

0005/openai-agent-integration

wire OpenAI Agents SDK in worker (streaming). Parse and emit structured JSON events to SSE. Audit log to KV.

0006/frontend-sse

add frontend/src/pages/predict.tsx EventSource client using Zod to validate incoming events and display progress.

0007/ci-schema-check

GH Action ci/schema-check.yml that runs uvicorn ingest-service in background, runs npm run gen:schemas, fails if generated files changed.




5) Code snippets (paste-ready)
Worker SSE skeleton (TypeScript)
// workers/api/predict.ts
import { json, text } from 'hono';
import OpenAI from 'openai';
import { validateFinalSchema } from '../lib/schemas'; // generated zod

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const raceId = url.searchParams.get('race_id');
  if (!raceId) return new Response('race_id required', { status: 400 });

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(obj) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      }

      // baseline
      const baseline = { type: 'baseline', payload: { /* quick calc */ } };
      sendEvent(baseline);

      // heartbeats
      const hb = setInterval(()=> controller.enqueue(encoder.encode(':hb\n\n')), 15000);

      try {
        // retrieve from Vectorize (stub)
        const retrieved = await fetchVectorizeTopK(raceId);

        // call OpenAI Responses/Agents SDK (streaming)
        // parse tokens -> when final, validate
        const final = await callOpenAIWithRetrieval(retrieved);
        const ok = validateFinalSchema(final);
        sendEvent({ type: 'final', payload: final });
      } catch (err) {
        sendEvent({ type: 'error', payload: { message: err.message }});
      } finally {
        clearInterval(hb);
        controller.close();
      }
    }
  });

  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}

FastAPI ingest stub (Python)
# ingest-service/app/main.py
from fastapi import FastAPI, UploadFile, BackgroundTasks
from pydantic import BaseModel
import uuid

app = FastAPI()

class IngestRequest(BaseModel):
    race_id: str
    source: str
    date: str

@app.post("/ingest/upload")
async def upload(file: UploadFile, meta: IngestRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    tmp = f"/tmp/{job_id}.pdf"
    with open(tmp, "wb") as f:
        f.write(await file.read())
    background_tasks.add_task(process_file, tmp, meta.dict(), job_id)
    return {"job_id": job_id}

def process_file(path, meta, job_id):
    # parse pdf, chunk with LangChain, embed, upsert to Vectorize
    pass

Schema gen tool (Node)
// tools/gen-schemas.js
const fs = require('fs');
const fetch = require('node-fetch');
const { convert } = require('json-schema-to-zod');

(async ()=> {
  const url = process.env.OPENAPI_URL || 'http://localhost:8000/openapi.json';
  const openapi = await fetch(url).then(r=>r.json());
  const schema = openapi.components.schemas['IngestRequest']; // example
  const code = convert(schema, { name: 'IngestRequest' });
  const out = `import { z } from 'zod';\n\n${code}\nexport const IngestRequestSchema = z.IngestRequest;\n`;
  fs.writeFileSync('frontend/src/schemas/ingest.generated.ts', out);
})();

6) Security checklist & dev rules (short)

Never put OPENAI_API_KEY or VECTORIZE_KEY in frontend. Always via Worker.

Use HttpOnly cookies for sessions.

Worker validates Origin header for POSTs and SSE.

CI checks schema-gen; PRs fail if generated files differ.

Rate limit /api/predict per user using KV counters.

Final wrap (your preferred format)

✅ Task list (MVP, immediate)

scaffold docs/ (done above)

add ingest-service/ (FastAPI + Pydantic + LangChain skeleton)

add schema-gen tooling (tools/gen-schemas.js) + npm run gen:schemas

add workers/api/predict.ts SSE skeleton + OpenAI Agents SDK integration

add frontend EventSource client + Zod validation

add GH Action schema-check.yml and deploy pipeline

📂 Folder structure (final)

/horase-racing-rag
├─ .github/
│  ├─ workflows/
│  │  ├─ ci-schema-check.yml            # runs ingest service, generates schemas, fails on diff
│  │  ├─ tests.yml                      # run unit + integration tests (workers + ingest)
│  │  └─ deploy.yml                     # build & deploy to Cloudflare Pages/Workers
│  └─ ISSUE_TEMPLATE.md
├─ .vscode/
│  └─ settings.json
├─ docs/
│  ├─ README.md                         # docs hub (quickstart links)
│  ├─ ARCHITECTURE.md                   # system diagrams + explanations
│  ├─ API_SPEC.md                        # SSE schema, endpoints, OpenAPI notes
│  ├─ SECURITY.md                        # threat model, secrets list, rules
│  ├─ DATA_INGEST.md                     # chunking rules, retention, upsert logic
│  ├─ PROMPT_LIBRARY.md                  # system prompts + templates
│  ├─ MODEL_EVAL.md                      # backtest harness, metrics
│  ├─ ADRs/
│  │  ├─ 0001-agent-sdk-choice.md
│  │  ├─ 0002-guardrail-strategy.md
│  │  └─ 0003-vectorstore-choice.md
│  └─ audit/
│     └─ pdf-agent-mapping.md            # annotated mapping of PDF → code (from the guide)
├─ infra/
│  ├─ wrangler.toml                      # Cloudflare Workers config
│  ├─ wrangler.publish.sh                # helper deploy script
│  ├─ terraform/                         # optional IaC (if needed later)
│  └─ cloudflare/                        # KV/Vectorize namespace docs & scripts
├─ frontend/                             # Vite + TypeScript SPA
│  ├─ package.json
│  ├─ tsconfig.json
│  ├─ vite.config.ts
│  ├─ tailwind.config.cjs
│  ├─ postcss.config.cjs
│  ├─ public/
│  │  └─ assets/
│  ├─ src/
│  │  ├─ main.tsx
│  │  ├─ App.tsx
│  │  ├─ index.css
│  │  ├─ pages/
│  │  │  ├─ Home.tsx
│  │  │  ├─ Story.tsx
│  │  │  ├─ Pricing.tsx
│  │  │  ├─ LearnMore.tsx
│  │  │  ├─ About.tsx
│  │  │  ├─ RealtimePrediction.tsx      # SSE client + live UI
│  │  │  └─ Admin/
│  │  │     └─ HumanReview.tsx          # small staff UI to approve HITL
│  │  ├─ components/                    # shadcn/ui + Tailwind components
│  │  │  ├─ Header.tsx
│  │  │  ├─ Footer.tsx
│  │  │  ├─ Navbar.tsx
│  │  │  ├─ ToggleTheme.tsx
│  │  │  └─ PredictionCard.tsx
│  │  ├─ lib/
│  │  │  ├─ api.ts                      # fetch wrappers that talk to Workers
│  │  │  └─ eventsource.ts              # EventSource wrapper and parsing
│  │  ├─ schemas/                       # generated Zod schemas (git-tracked)
│  │  │  └─ predictions.generated.ts    # generated by tools/gen-schemas.js
│  │  └─ styles/
│  └─ README.md
├─ workers/                              # Cloudflare Workers + Agents SDK (TypeScript)
│  ├─ package.json
│  ├─ tsconfig.worker.json
│  ├─ src/
│  │  ├─ entry.ts                        # Hono or Worker entry
│  │  ├─ api/
│  │  │  ├─ predict.ts                   # SSE endpoint: baseline, progress, final
│  │  │  ├─ auth.ts                      # google oauth redirect/callback (PKCE flow helper)
│  │  │  ├─ races.ts                     # race list / metadata cached in KV
│  │  │  └─ snapshots.ts                 # save/read prediction snapshots
│  │  ├─ lib/
│  │  │  ├─ guardrails.ts                # inputGuardrail, tool-risk, moderation helpers
│  │  │  ├─ vectorize.ts                 # Vectorize query wrapper
│  │  │  ├─ openai-client.ts             # agent + Responses wrapper (stream)
│  │  │  ├─ odds-adapters.ts             # adapter pattern for odds providers
│  │  │  ├─ kv.ts                        # KV helpers
│  │  │  └─ audit.ts                     # writes audit rows to KV/Supabase
│  │  ├─ tools/                          # definitions that the agent can call
│  │  │  ├─ tool_query_rag.ts            # lightweight wrapper calling FastAPI /query/rag
│  │  │  └─ tool_fetch_odds.ts
│  │  └─ schemas/                        # zod runtime schemas for worker validation
│  └─ wrangler.toml                      # worker-specific config (bindings)
├─ ingest-service/                       # FastAPI (Python) — PDF ingestion + LangChain
│  ├─ pyproject.toml / requirements.txt
│  ├─ Dockerfile
│  ├─ app/
│  │  ├─ main.py                         # FastAPI app entry + health endpoints
│  │  ├─ schemas.py                      # Pydantic canonical models (source-of-truth)
│  │  ├─ ingest/
│  │  │  ├─ pdf_parser.py                # pypdf / pdfminer parsing
│  │  │  ├─ chunker.py                   # langchain text splitter wrapper
│  │  │  ├─ embedder.py                  # OpenAI/HF embedding adapter
│  │  │  └─ upsert.py                    # upsert batches to Vectorize
│  │  ├─ query/
│  │  │  └─ rag_query.py                 # simple RAG endpoint used as tool
│  │  ├─ guardrails.py                   # ingest-level scrubbing + moderation
│  │  └─ backtest/
│  │     ├─ backtest.py                  # historical evaluation harness
│  │     └─ datasets/                    # sample CSVs for CI smoke-tests
│  └─ scripts/
│     ├─ export_schemas.py               # exports pydantic -> jsonschema
│     └─ run_local.sh
├─ tools/
│  ├─ gen-schemas.js                     # fetch openapi -> jsonschema -> zod generated
│  ├─ seed_data/                         # sample PDFs, CSVs
│  └─ dev_helpers/
│     └─ mock_vectorize_server.js
├─ infra-scripts/
│  ├─ create-kv-namespaces.sh
│  └─ create-vectorize-namespace.sh
├─ test/
│  ├─ frontend/
│  │  └─ ui.test.tsx
│  ├─ workers/
│  │  └─ guardrails.test.ts
│  └─ ingest-service/
│     └─ test_ingest.py
├─ .env.example
├─ .gitignore
├─ README.md                             # project top-level quickstart + architecture links
└─ LICENSE


🔁 Sprint model (MVP in 2 sprints)

Sprint 0 (2 days): docs + env + secrets + simple auth + SSE skeleton.

Sprint 1 (7 days): ingest pipeline (LangChain), Vectorize upsert, worker retriever, OpenAI Agents streaming, frontend SSE.

Sprint 2 (7 days): odds provider integration, staking engine, backtest harness, CI enforcement & monitoring.

🧠 Architecture (one line)
Edge-first RAG: PDFs + feeds → FastAPI(LangChain) ingest → Vectorize → Worker retriever + OpenAI Agents → Decision engine → SSE → Vite frontend. 
Cloudflare Docs
+1