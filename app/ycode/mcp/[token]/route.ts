import { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { validateToken } from '@/lib/repositories/mcpTokenRepository';
import { createMcpServer } from '@/lib/mcp/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface McpSession {
  transport: WebStandardStreamableHTTPServerTransport;
  server: McpServer;
  lastActivity: number;
}

const sessions = new Map<string, McpSession>();

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

function cleanupStaleSessions() {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
      session.transport.close().catch(() => {});
      sessions.delete(id);
    }
  }
}

async function authenticateToken(token: string): Promise<boolean> {
  try {
    const result = await validateToken(token);
    return result !== null;
  } catch {
    return false;
  }
}

function addCorsHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id, mcp-protocol-version');
  headers.set('Access-Control-Expose-Headers', 'mcp-session-id');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function handleMcpRequest(request: Request): Promise<Response> {
  const sessionId = request.headers.get('mcp-session-id');

  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    session.lastActivity = Date.now();
    return session.transport.handleRequest(request);
  }

  if (request.method === 'POST') {
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (newSessionId) => {
        sessions.set(newSessionId, { transport, server, lastActivity: Date.now() });
      },
    });

    const server = createMcpServer();

    transport.onclose = () => {
      if (transport.sessionId) {
        sessions.delete(transport.sessionId);
      }
    };

    await server.connect(transport);
    return transport.handleRequest(request);
  }

  return new Response(JSON.stringify({ error: 'Invalid session' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const isValid = await authenticateToken(token);
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid MCP token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  cleanupStaleSessions();
  const response = await handleMcpRequest(request);
  return addCorsHeaders(response);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const isValid = await authenticateToken(token);
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid MCP token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionId = request.headers.get('mcp-session-id');
  if (!sessionId || !sessions.has(sessionId)) {
    return new Response(JSON.stringify({ error: 'Invalid session. Send a POST first.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const session = sessions.get(sessionId)!;
  session.lastActivity = Date.now();
  const response = await session.transport.handleRequest(request);
  return addCorsHeaders(response);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const isValid = await authenticateToken(token);
  if (!isValid) {
    return new Response(JSON.stringify({ error: 'Invalid MCP token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const sessionId = request.headers.get('mcp-session-id');
  if (sessionId && sessions.has(sessionId)) {
    const session = sessions.get(sessionId)!;
    await session.transport.close();
    sessions.delete(sessionId);
    return addCorsHeaders(new Response(null, { status: 204 }));
  }

  return addCorsHeaders(new Response(JSON.stringify({ error: 'Session not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  }));
}

export async function OPTIONS() {
  return addCorsHeaders(new Response(null, { status: 204 }));
}
