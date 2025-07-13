import { lucia } from '@/lib/auth';
import { db } from '@/db';
import { artists, userArtists } from '@/db/schema';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

// GET user's artists
export async function GET() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new Response(null, { status: 401 });
  }

  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    return new Response(null, { status: 401 });
  }

  const userArtistsList = await db.select({ artist: artists }).from(userArtists).innerJoin(artists, eq(userArtists.artistId, artists.id)).where(eq(userArtists.userId, user.id));

  return new Response(JSON.stringify(userArtistsList.map(item => item.artist)), { status: 200 });
}

// POST a new artist to user's profile
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
    let artist = await db.query.artists.findFirst({ where: eq(artists.name, name) });

    if (!artist) {
      [artist] = await db.insert(artists).values({ name }).returning();
    }

    await db.insert(userArtists).values({ userId: user.id, artistId: artist.id });

    return new Response(JSON.stringify(artist), { status: 201 });
  } catch (_e) {
    return new Response('An error occurred', { status: 500 });
  }
}
