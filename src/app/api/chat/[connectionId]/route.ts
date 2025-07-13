import { lucia } from '@/lib/auth';
import { db } from '@/db';
import { chatMessages, connections } from '@/db/schema';
import { cookies } from 'next/headers';
import { and, eq, or } from 'drizzle-orm';

// GET all messages for a connection
export async function GET(request: Request, { params }: { params: { connectionId: string } }) {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return new Response(null, { status: 401 });
  const { user } = await lucia.validateSession(sessionId);
  if (!user) return new Response(null, { status: 401 });

  const connectionId = parseInt(params.connectionId, 10);

  // Security check: Ensure user is part of this connection
  const connection = await db.query.connections.findFirst({
    where: and(eq(connections.id, connectionId), or(eq(connections.userOneId, user.id), eq(connections.userTwoId, user.id)))
  });
  if (!connection) return new Response('Not authorized', { status: 403 });

  const messages = await db.query.chatMessages.findMany({
    where: eq(chatMessages.connectionId, connectionId),
    with: { sender: { columns: { username: true } } },
    orderBy: (messages, { asc }) => [asc(messages.timestamp)],
  });

  return new Response(JSON.stringify(messages));
}

// POST a new message
export async function POST(request: Request, { params }: { params: { connectionId: string } }) {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return new Response(null, { status: 401 });
  const { user } = await lucia.validateSession(sessionId);
  if (!user) return new Response(null, { status: 401 });

  const connectionId = parseInt(params.connectionId, 10);
  const { content } = await req.json();

  // Security check
  const connection = await db.query.connections.findFirst({
    where: and(eq(connections.id, connectionId), or(eq(connections.userOneId, user.id), eq(connections.userTwoId, user.id)))
  });
  if (!connection) return new Response('Not authorized', { status: 403 });

  const [newMessage] = await db.insert(chatMessages).values({
    connectionId,
    senderId: user.id,
    content,
    timestamp: new Date(),
  }).returning();

  return new Response(JSON.stringify(newMessage), { status: 201 });
}
