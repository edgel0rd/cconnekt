import { lucia } from '@/lib/auth';
import { db } from '@/db';
import { connections } from '@/db/schema';
import { cookies } from 'next/headers';
import { and, eq, or } from 'drizzle-orm';

// GET all connections for the current user
export async function GET() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return new Response(null, { status: 401 });
  const { user } = await lucia.validateSession(sessionId);
  if (!user) return new Response(null, { status: 401 });

  const userConnections = await db.query.connections.findMany({
    where: or(eq(connections.userOneId, user.id), eq(connections.userTwoId, user.id)),
    with: {
      userOne: { columns: { username: true } },
      userTwo: { columns: { username: true } },
    },
  });

  return new Response(JSON.stringify(userConnections));
}

// POST to send a new connection request
export async function POST(req: Request) {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return new Response(null, { status: 401 });
  const { user } = await lucia.validateSession(sessionId);
  if (!user) return new Response(null, { status: 401 });

  const { targetUserId } = await req.json();
  if (!targetUserId) return new Response('Missing targetUserId', { status: 400 });

  try {
    const [newConnection] = await db.insert(connections).values({
      userOneId: user.id,
      userTwoId: targetUserId,
      status: 'pending',
    }).returning();
    return new Response(JSON.stringify(newConnection), { status: 201 });
  } catch (_e) {
    return new Response('An error occurred', { status: 500 });
  }
}

// PUT to accept a connection request
export async function PUT(req: Request) {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return new Response(null, { status: 401 });
  const { user } = await lucia.validateSession(sessionId);
  if (!user) return new Response(null, { status: 401 });

  const { connectionId } = await req.json();
  if (!connectionId) return new Response('Missing connectionId', { status: 400 });

  try {
    const [updatedConnection] = await db.update(connections)
      .set({ status: 'accepted' })
      .where(and(eq(connections.id, connectionId), eq(connections.userTwoId, user.id)))
      .returning();

    if (!updatedConnection) return new Response('Connection not found or not authorized', { status: 404 });

    return new Response(JSON.stringify(updatedConnection));
  } catch (_e) {
    return new Response('An error occurred', { status: 500 });
  }
}
