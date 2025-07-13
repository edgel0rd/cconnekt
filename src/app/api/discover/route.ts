import { lucia } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { calculateCompatibilityScores } from '@/lib/matching';
import { cookies } from 'next/headers';
import { inArray } from 'drizzle-orm';

export async function GET() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new Response(null, { status: 401 });
  }

  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    return new Response(null, { status: 401 });
  }

  const scores = await calculateCompatibilityScores(user.id);
  if (scores.length === 0) {
    return new Response(JSON.stringify([]), { status: 200 });
  }

  // Fetch user details for the top matches
  const matchedUserIds = scores.map(s => s.userId);
  const matchedUsers = await db.query.users.findMany({
    where: inArray(users.id, matchedUserIds),
    columns: { id: true, username: true },
  });

  const userMap = new Map(matchedUsers.map(u => [u.id, u]));

  const results = scores.map(s => ({
    ...s,
    username: userMap.get(s.userId)?.username,
  }));

  return new Response(JSON.stringify(results), { status: 200 });
}
