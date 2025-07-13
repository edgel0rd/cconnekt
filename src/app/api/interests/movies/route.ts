import { lucia } from '@/lib/auth';
import { db } from '@/db';
import { movies, userMovies } from '@/db/schema';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';

// GET user's movies
export async function GET() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new Response(null, { status: 401 });
  }

  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    return new Response(null, { status: 401 });
  }

  const userMoviesList = await db.select({ movie: movies }).from(userMovies).innerJoin(movies, eq(userMovies.movieId, movies.id)).where(eq(userMovies.userId, user.id));

  return new Response(JSON.stringify(userMoviesList.map(item => item.movie)), { status: 200 });
}

// POST a new movie to user's profile
export async function POST(req: Request) {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return new Response(null, { status: 401 });
  }

  const { user } = await lucia.validateSession(sessionId);
  if (!user) {
    return new Response(null, { status: 401 });
  }

  const { title } = await req.json();
  if (!title) {
    return new Response('Missing title', { status: 400 });
  }

  try {
    let movie = await db.query.movies.findFirst({ where: eq(movies.title, title) });

    if (!movie) {
      [movie] = await db.insert(movies).values({ title }).returning();
    }

    await db.insert(userMovies).values({ userId: user.id, movieId: movie.id });

    return new Response(JSON.stringify(movie), { status: 201 });
  } catch (e) {
    // Handle potential unique constraint violation if the user already has the movie
    return new Response('An error occurred', { status: 500 });
  }
}
