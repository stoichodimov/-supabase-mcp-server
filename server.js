import "dotenv/config";
import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// ── Validates JWT token and returns Supabase client for this user ──
async function getAuthenticatedClient(authHeader) {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  const token = authHeader.slice(7);

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user) throw new Error("Invalid or expired token");

  return { client, user };
}

// ── Creates MCP server with 4 tools for notes ──
function createMcpServer(supabaseClient, user) {
  const server = new McpServer({
    name: "supabase-notes-mcp",
    version: "1.0.0",
  });

  // 1. Show all notes
  server.tool(
    "list_notes",
    "List all notes for the authenticated user",
    {},
    async () => {
      const { data, error } = await supabaseClient
        .from("notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error)
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };

      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    },
  );

  // 2. Create note
  server.tool(
    "create_note",
    "Create a new note",
    {
      title: z.string().describe("Note title"),
      content: z.string().optional().describe("Note content"),
    },
    async ({ title, content }) => {
      const { data, error } = await supabaseClient
        .from("notes")
        .insert({ title, content, user_id: user.id })
        .select()
        .single();

      if (error)
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };

      return {
        content: [
          { type: "text", text: `Created: ${JSON.stringify(data, null, 2)}` },
        ],
      };
    },
  );

  // 3. Update note
  server.tool(
    "update_note",
    "Update an existing note",
    {
      id: z.string().uuid().describe("Note UUID"),
      title: z.string().optional().describe("New title"),
      content: z.string().optional().describe("New content"),
    },
    async ({ id, title, content }) => {
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;

      const { data, error } = await supabaseClient
        .from("notes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error)
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };

      return {
        content: [
          { type: "text", text: `Updated: ${JSON.stringify(data, null, 2)}` },
        ],
      };
    },
  );

  // 4. Delete note
  server.tool(
    "delete_note",
    "Delete a note",
    { id: z.string().uuid().describe("Note UUID to delete") },
    async ({ id }) => {
      const { error } = await supabaseClient
        .from("notes")
        .delete()
        .eq("id", id);

      if (error)
        return { content: [{ type: "text", text: `Error: ${error.message}` }] };

      return {
        content: [{ type: "text", text: `Note ${id} deleted successfully` }],
      };
    },
  );

  return server;
}

// ── Main MCP endpoint ──
app.all("/mcp", async (req, res) => {
  try {
    const { client, user } = await getAuthenticatedClient(
      req.headers.authorization,
    );
    const server = createMcpServer(client, user);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// ── Health check ──
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "MCP Server is running" });
});

import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(join(__dirname, "frontend")));

app.listen(process.env.PORT || 3000, () => {
  console.log(
    `✅ MCP Server running on http://localhost:${process.env.PORT || 3000}`,
  );
});
