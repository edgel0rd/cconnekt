import { lucia } from '@/lib/auth';
import { db } from '@/db';
import { venues, userVenues } from '@/db/schema';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

// GET user's venues
export async function GET() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new Response(null, { status: 401 });
  }

  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    return new Response(null, { status: 401 });
  }

  const userVenuesList = await db.select({ venue: venues }).from(userVenues).innerJoin(venues, eq(userVenues.venueId, venues.id)).where(eq(userVenues.userId, user.id));

  return new Response(JSON.stringify(userVenuesList.map(item => item.venue)), { status: 200 });
}

// POST a new venue to user's profile
export async function POST(req: Request) {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new Response(null, { status: 401 });
  }

  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    return new Response(null, { status: 401 });
  }

  const { name } = await req.json();
  if (!name) {
    return new Response('Missing name', { status: 400 });
  }

  try {
    let venue = await db.query.venues.findFirst({ where: eq(venues.name, name) });

    if (!venue) {
      [venue] = await db.insert(venues).values({ name }).returning();
    }

    await db.insert(userVenues).values({ userId: user.id, venueId: venue.id });

    return new Response(JSON.stringify(venue), { status: 201 });
  } catch (_e) {
    return new Response('An error occurred', { status: 500 });
  }
}
