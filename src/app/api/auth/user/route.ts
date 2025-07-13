import { lucia } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new Response(null, { status: 401 });
  }

  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    return new Response(null, { status: 401 });
  }

  return new Response(JSON.stringify({ user }), { status: 200 });
}
