below are practical, copy-pasteable agent examples distilled from the PDF and adapted to your exact stack (Cloudflare Workers + OpenAI Agents SDK in TypeScript for runtime orchestration; FastAPI + LangChain in Python for ingestion/RAG tools). I kept them pragmatic (guardrail hooks, tool call patterns, provenance) so you can drop them into your repo and iterate.

I read the PDF and mapped its patterns to these examples (manager/worker patterns, tool definitions, guardrails, provenance). See citation for the guide at the end. 

a-practical-guide-to-building-a…

1) TypeScript — Cloudflare Worker agent (OpenAI Agents SDK style)

This is an edge-side agent that:

validates input,

fetches top-k snippets from Vectorize (tool),

optionally fetches live odds (tool),

calls OpenAI Responses (streaming) as the agent model,

enforces output validation (Zod) and guardrails,

streams final structured JSON via SSE to the frontend.

Put this at workers/api/agent.ts (adapt to your Worker framework — Hono / native Worker handler).

// workers/api/agent.ts (Cloudflare Worker - TypeScript)
// Note: adapt imports to your Worker framework (Hono/Miniflare/wrangler).
import { OpenAI } from "openai";
import { z } from "zod";
import { inputGuardrail, checkToolRisk } from "../lib/guardrails";
import { queryVectorize } from "../lib/vectorize";
import { fetchOdds } from "../lib/odds";
import { validateFinalSchema } from "../lib/schemas"; // generated Zod for final JSON

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

// SSE helper
function sseResponse(handler: (send: (d:any)=>void) => Promise<void>) {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (obj: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
      try {
        await handler(send);
      } catch (e) {
        send({ type: "error", error: String(e) });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream" }});
}

export async function onRequestPost(context) {
  const body = await context.request.json();
  const user = context.env.AUTH_USER; // your session lookup
  // 1) Input guardrails
  await inputGuardrail(body, user);

  return sseResponse(async (send) => {
    // Baseline quick calc: normalize odds if provided
    if (body.odds_snapshot) {
      const baseline = computeBaselineFromOdds(body.odds_snapshot);
      send({ type: "baseline", payload: baseline });
    } else {
      send({ type: "baseline", payload: { note: "no odds" }});
    }

    // 2) Quick relevance check (optional, fast embedding or keyword)
    const relevance = await fastRelevanceCheck(body.question || body.query || "");
    if (relevance < 0.4) {
      send({ type: "final", payload: { error: "query_out_of_scope" }});
      return;
    }

    // 3) Retrieve top-k from Vectorize (tool)
    const retrieved = await queryVectorize(body.race_id, { k: 8 });
    send({ type: "progress", payload: { stage: "retrieved", count: retrieved.length }});

    // 4) Fetch live odds if you want (tool)
    let odds = null;
    try {
      checkToolRisk("odds_fetch", { user });
      odds = await fetchOdds(body.race_id);
      send({ type: "progress", payload: { stage: "odds_fetched", odds_source: odds?.source||null }});
    } catch (err) {
      // risk gate triggered — record & surface
      send({ type: "progress", payload: { stage: "odds_failed", reason: String(err) }});
    }

    // 5) Build the agent prompt (model + tool context)
    const systemPrompt = `You are Ag, an ROI-first horse racing analyst.
Output MUST be valid JSON matching schema version 1.
Include 'predictions', 'sources', 'recommended_stake' (nullable), 'why_it_might_fail'.`;
    const retrievalText = retrieved.map(r => `[[id:${r.id} sim:${r.score}]] ${r.text.slice(0,800)}`).join("\n\n");
    const userMessage = `Question: ${body.query || body.question}\nRace: ${body.race_id}\nOdds: ${JSON.stringify(odds || {})}\n\nUse the retrieval snippets:\n${retrievalText}`;

    // 6) Call OpenAI Responses (streaming) as the agent
    // We stream tokens and accumulate until we get full JSON
    const openaiRes = await client.responses.stream({
      model: "gpt-4o-mini", // pick fit + cost
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      // optionally attach tools metadata so agent "knows" them
      // this depends on Responses/Agents SDK features availability
    });

    // collect partial text
    let fullText = "";
    for await (const event of openaiRes) {
      if (event.type === "response.delta") {
        const token = event.delta?.content;
        if (token) {
          fullText += token;
          // stream partials for UX
          send({ type: "progress", payload: { partial: token }});
        }
      } else if (event.type === "response.final") {
        // final text available
        fullText += event.output || "";
      }
    }

    // 7) Validate JSON output & enforce output guardrails
    let parsed;
    try {
      // model *should* return JSON — try parse
      parsed = JSON.parse(fullText);
    } catch (e) {
      send({ type: "final", payload: { error: "invalid_json", raw: fullText }});
      return;
    }
    const valid = validateFinalSchema.safeParse(parsed);
    if (!valid.success) {
      send({ type: "final", payload: { error: "schema_validation_failed", details: valid.error.format(), raw: parsed }});
      return;
    }

    // 8) Tool-risk: if agent recommended stakes, check risk & HITL rules
    try {
      if (parsed.recommended_stake && parsed.recommended_stake.value > MAX_STAKE_FRACTION) {
        await checkToolRisk("recommend_stake", { user, prediction: parsed });
      }
    } catch (err) {
      // enqueue human-review happens in checkToolRisk
      send({ type: "final", payload: { status: "queued_for_human_review", note: String(err) }});
      return;
    }

    // 9) Persist audit + send final
    await writeAuditLog({
      user_id: user?.id,
      race_id: body.race_id,
      model_call: { model: "gpt-4o-mini", text_length: fullText.length },
      retrieval_ids: retrieved.map(r=>r.id),
      output_schema_version: "1"
    });

    send({ type: "final", payload: parsed });
  });
}


Notes & mapping to the guide

Tools (vector_query, fetchOdds) are explicit and small — they are the only external actions the agent can do. The PDF recommends making tools narrow and auditable. 

a-practical-guide-to-building-a…

Guardrails: inputGuardrail, checkToolRisk, and validateFinalSchema enforce multi-layer safety. PDF emphasizes layered guardrails and human escalation. 

a-practical-guide-to-building-a…

2) Python — LangChain agent for ingestion & "tool" endpoints

This is the FastAPI / LangChain side. It exposes two key endpoints:

/ingest/upload — uploads PDF, parses, chunks, embeds, upserts to Vectorize

/query/rag — a synchronous RAG query that returns top-K snippets and a model-generated answer (used as a tool by the TS agent if needed)

Put this in ingest-service/app/ (FastAPI + LangChain).

# ingest-service/app/main.py
from fastapi import FastAPI, UploadFile, BackgroundTasks
from pydantic import BaseModel
from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
import requests, uuid, os

OPENAI_KEY = os.environ.get("OPENAI_API_KEY")
VECTORIZE_UPSERT = os.environ.get("VECTORIZE_UPSERT_URL")  # your Vectorize upsert endpoint

app = FastAPI()

class IngestRequest(BaseModel):
    race_id: str
    source: str
    date: str

def chunk_text(text:str):
    splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
    return splitter.split_text(text)

def upsert_to_vectorize(items):
    # items: list of {"id":..., "vector":..., "metadata": {...}}
    headers = {"Authorization": f"Bearer {os.environ['VECTORIZE_KEY']}", "Content-Type":"application/json"}
    r = requests.post(VECTORIZE_UPSERT, headers=headers, json={"items": items})
    r.raise_for_status()
    return r.json()

@app.post("/ingest/upload")
async def upload(file: UploadFile, meta: IngestRequest, background_tasks: BackgroundTasks):
    # save file
    job_id = str(uuid.uuid4())
    tmp = f"/tmp/{job_id}.pdf"
    with open(tmp, "wb") as f:
        f.write(await file.read())
    background_tasks.add_task(process_pdf, tmp, meta.dict(), job_id)
    return {"job_id": job_id}

def process_pdf(path, meta, job_id):
    # 1) load pdf via LangChain loader
    loader = PyPDFLoader(path)
    docs = loader.load()
    # 2) combine text and chunk
    chunks = []
    for d in docs:
        parts = chunk_text(d.page_content)
        for i, p in enumerate(parts):
            chunks.append({
                "id": f"{meta['race_id']}_page_{d.metadata.get('page', 0)}_chunk_{i}",
                "text": p,
                "metadata": {**meta, "page": d.metadata.get("page", None)}
            })
    # 3) embed batches
    emb = OpenAIEmbeddings(openai_api_key=OPENAI_KEY)
    texts = [c["text"] for c in chunks]
    vectors = emb.embed_documents(texts)
    items = []
    for c, v in zip(chunks, vectors):
        items.append({"id": c["id"], "embedding": v, "metadata": c["metadata"]})
    # 4) upsert to Vectorize
    upsert_to_vectorize(items)
    # optionally mark job complete in Supabase or via a webhook

# RAG query endpoint (used as a "tool" by the worker agent)
from typing import List
@app.post("/query/rag")
def query_rag(race_id: str, q: str, k: int = 5):
    # 1) call Vectorize query endpoint (simple fetch)
    resp = requests.post(os.environ["VECTORIZE_QUERY_URL"], headers={"Authorization": f"Bearer {os.environ['VECTORIZE_KEY']}"}, json={"query": q, "k": k, "filters": {"race_id": race_id}})
    hits = resp.json()["results"]
    snippets = [{"id": h["id"], "score": h["score"], "text": h["metadata"]["text"][:1000], "source": h["metadata"].get("source")} for h in hits]
    # 2) optionally call a smaller LLM to summarize or return snippets
    # We'll return raw snippets so worker agent can assemble prompt
    return {"snippets": snippets}


Notes

LangChain is used for loaders/splitters/embeddings. The FastAPI service exposes a compact query_rag tool that the worker agent can call. The PDF guide recommends keeping tools small, deterministic, and auditable — this endpoint does exactly that. 

a-practical-guide-to-building-a…

3) Manager Pattern (TypeScript) — delegating to specialized sub-agents

If you later need more sophisticated flows (the guide’s Manager pattern), the worker agent can act as manager and call sub-agents (specialists) as tools. Example skeleton:

// manager.ts
async function managerRun(userQuery, ctx) {
  // 1: quick check
  if (!isRacingQuestion(userQuery)) return { error: "out_of_scope" };

  // 2: ask "odds specialist" for market data
  const oddsToolResult = await callTool("odds_fetch", { race_id: ctx.race_id });
  // 3: ask "historian specialist" (RAG tool)
  const ragResult = await callTool("query_rag", { race_id: ctx.race_id, q: userQuery });

  // 4: aggregate and call LLM to produce final prediction
  const prompt = buildPrompt(oddsToolResult, ragResult, userQuery);
  const final = await callLLM(prompt);
  return final;
}


This lets you separate concerns and instrument each specialist for audit and guardrails (the guide favors this for complex apps). 

a-practical-guide-to-building-a…

4) Guardrail & Tripwire pattern snippet (Python + TS)

Short summary of the pattern used in the PDF:

Run fast tripwire checks in parallel (moderation, relevance, risk), and only proceed if none trip. If any trips, abort or escalate.

Python async tripwire example (concept)
import asyncio

async def run_tripwires(text):
    tasks = [moderation_check(text), relevance_check(text), pii_check(text)]
    results = await asyncio.gather(*tasks)
    # results are booleans or reason codes
    problems = [r for r in results if r is not True]
    return problems

# usage
problems = await run_tripwires(user_text)
if problems:
    raise TripwireTriggered(problems)

TS parallel checks (worker)
const [mod, relevance, risk] = await Promise.all([
  openaiModeration(text),
  fastRelevance(text),
  quickRiskClassifier(text)
]);
if (mod.flagged || relevance < 0.5 || risk > 0.7) {
  // escalate / halt
}

5) Example prompt template (enforce JSON + provenance)

Save this in docs/prompt_templates/system_prompt.md and inject relevant dynamic variables.

System:
You are Ag — an ROI-first horse racing analyst. Always respond with a single valid JSON object and nothing else.
The JSON must include: race_id, timestamp, predictions (array of { horse, prob, confidence, reasons[] }), sources (array of { id, score, url }), recommended_stake { method, value } or null, human_summary, why_it_might_fail.
If suggesting a stake, ensure confidence >= 0.6 and recommended_stake.value <= {{MAX_STAKE_FRACTION}}.
Cite retrieval snippet ids and similarity scores.

Where these map in the PDF

Tool-first design, single agent → manager upgrade patterns: guidance spread across sections describing agent primitives, Manager/Decentralized patterns. 

a-practical-guide-to-building-a…

Guardrails, tripwires, and concurrent safety checks: the guide emphasizes parallel guardrails and clear escalation routes — implemented above with inputGuardrail, tripwire checks, and HITL queue. 

a-practical-guide-to-building-a…

Small, deterministic tools: the FastAPI tool examples are deliberately small and auditable (per the guide). 

a-practical-guide-to-building-a…

Quick checklist to drop these in

Add workers/lib/guardrails.ts, workers/lib/vectorize.ts, and workers/lib/schemas.ts (Zod generated) — wire the worker example.

Add ingest-service/app/main.py (LangChain ingestion + /query/rag tool).

Add docs/prompt_templates/system_prompt.md and ADR entries.

Add tests for guardrails and schema validation (vitest + pytest).

Add audit logging (KV + Supabase) for each model call.