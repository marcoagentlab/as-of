#!/usr/bin/env node
/**
 * As-Of MCP server (stdio). Informational only. Not investment advice.
 *
 * Thin client of the REST API. Tools list without a live server.
 * Tool calls hit GET /v0/* with x-api-key: DEMO_KEY.
 *
 *   node apps/mcp/index.mjs
 */
import { createInterface } from "node:readline";

const DISCLAIMER =
  "Informational only. Not investment advice. Not an offer of securities. Eligibility is rule-based v0, not a live transfer simulation. Figures without a source are shown as unavailable.";

const TOOL_PREFIX = "Informational only. Not investment advice.";

const BASE = (process.env.RWA_API_BASE ?? "http://127.0.0.1:8080").replace(/\/$/, "");
const API_KEY = process.env.RWA_API_KEY ?? "DEMO_KEY";

const TOOLS = [
  {
    name: "list_rwa_assets",
    description: `${TOOL_PREFIX} List normalized RWA asset summaries (schema v0). Optional asset_class filter.`,
    inputSchema: {
      type: "object",
      properties: {
        asset_class: {
          type: "string",
          description:
            "treasury_fund | private_credit | commodity | equity_wrapper | cash_mgmt | other",
        },
      },
    },
  },
  {
    name: "get_rwa_asset",
    description: `${TOOL_PREFIX} Full Asset v0 record for one id (NAV, yield, eligibility, sources).`,
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string", description: "Stable slug, e.g. buidl, ousg, usdy" },
      },
    },
  },
  {
    name: "compare_yields",
    description: `${TOOL_PREFIX} Compare normalized yields vs SOFR. Nulls last. Does not invent APYs.`,
    inputSchema: {
      type: "object",
      properties: {
        sort: {
          type: "string",
          description: "spread_vs_sofr_bps | net_apy | gross_apy | fee_drag_bps",
        },
        benchmark: {
          type: "string",
          description:
            "Reserved. Only SOFR is defined in v0, and SOFR is currently unavailable.",
        },
      },
    },
  },
  {
    name: "check_eligibility",
    description: `${TOOL_PREFIX} Docs-level eligibility rules only. Not a live can_transfer simulation.`,
    inputSchema: {
      type: "object",
      required: ["asset_id"],
      properties: {
        asset_id: { type: "string" },
        jurisdiction: {
          type: "string",
          description: "US | KR | EU | non_US | other",
        },
      },
    },
  },
];

function ok(id, result) {
  return JSON.stringify({ jsonrpc: "2.0", id: id ?? null, result });
}

function fail(id, code, message) {
  return JSON.stringify({
    jsonrpc: "2.0",
    id: id ?? null,
    error: { code, message },
  });
}

async function api(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-api-key": API_KEY, accept: "application/json" },
  });
  const text = await res.text();
  return { status: res.status, text };
}

async function callTool(name, args) {
  const a = args ?? {};
  try {
    let path;
    switch (name) {
      case "list_rwa_assets": {
        const q = a.asset_class
          ? `?asset_class=${encodeURIComponent(String(a.asset_class))}`
          : "";
        path = `/v0/assets${q}`;
        break;
      }
      case "get_rwa_asset":
        path = `/v0/assets/${encodeURIComponent(String(a.id ?? ""))}`;
        break;
      case "compare_yields": {
        const sort = encodeURIComponent(String(a.sort ?? "spread_vs_sofr_bps"));
        path = `/v0/yields?sort=${sort}`;
        break;
      }
      case "check_eligibility": {
        const p = new URLSearchParams({ asset_id: String(a.asset_id ?? "") });
        if (a.jurisdiction) p.set("jurisdiction", String(a.jurisdiction));
        path = `/v0/eligibility?${p}`;
        break;
      }
      default:
        return {
          content: [{ type: "text", text: `unknown tool: ${name}` }],
          isError: true,
        };
    }
    const { status, text } = await api(path);
    return {
      content: [{ type: "text", text: `HTTP ${status}\n${text}` }],
      isError: status >= 400,
    };
  } catch (err) {
    return {
      content: [
        {
          type: "text",
          text: `API unreachable at ${BASE}: ${err instanceof Error ? err.message : String(err)}`,
        },
      ],
      isError: true,
    };
  }
}

async function handle(msg) {
  const { method, id, params } = msg;
  if (!method) return null;
  if (method === "initialize") {
    return ok(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "as-of-rwa", version: "0.0.1" },
      instructions: DISCLAIMER,
    });
  }
  if (method === "notifications/initialized" || method === "initialized") {
    return null;
  }
  if (method === "tools/list") return ok(id, { tools: TOOLS });
  if (method === "tools/call") {
    const name = String(params?.name ?? "");
    const args = params?.arguments ?? {};
    return ok(id, await callTool(name, args));
  }
  if (method === "ping") return ok(id, {});
  return fail(id, -32601, `method not found: ${method}`);
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
rl.on("line", async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  let msg;
  try {
    msg = JSON.parse(trimmed);
  } catch {
    process.stdout.write(fail(null, -32700, "parse error") + "\n");
    return;
  }
  const out = await handle(msg);
  if (out) process.stdout.write(out + "\n");
});
