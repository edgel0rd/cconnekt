import { db } from '@/db';
import { users, userMovies, userArtists, userVenues } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// --- TYPES ---
type UserInterests = {
  userId: string;
  movies: Set<number>;
  artists: Set<number>;
  venues: Set<number>;
};

type CompatibilityScore = {
  userId: string;
  score: number;
};

// --- CORE LOGIC ---
export async function calculateCompatibilityScores(currentUserId: string): Promise<CompatibilityScore[]> {
  // 1. Fetch all user interests in an optimized way
  const allUsers = await db.query.users.findMany({ columns: { id: true } });
  const allUserMovies = await db.query.userMovies.findMany();
  const allUserArtists = await db.query.userArtists.findMany();
  const allUserVenues = await db.query.userVenues.findMany();

  const interestsMap = new Map<string, UserInterests>();

  for (const user of allUsers) {
    interestsMap.set(user.id, { userId: user.id, movies: new Set(), artists: new Set(), venues: new Set() });
  }
  for (const um of allUserMovies) {
    interestsMap.get(um.userId)?.movies.add(um.movieId);
  }
  for (const ua of allUserArtists) {
    interestsMap.get(ua.userId)?.artists.add(ua.artistId);
  }
  for (const uv of allUserVenues) {
    interestsMap.get(uv.userId)?.venues.add(uv.venueId);
  }

  const currentUserInterests = interestsMap.get(currentUserId);
  if (!currentUserInterests) return [];

  const scores: CompatibilityScore[] = [];

  // 2. Calculate scores for all other users
  for (const [otherUserId, otherUserInterests] of interestsMap.entries()) {
    if (currentUserId === otherUserId) continue;

    const sharedMovies = [...currentUserInterests.movies].filter(movie => otherUserInterests.movies.has(movie));
    const sharedArtists = [...currentUserInterests.artists].filter(artist => otherUserInterests.artists.has(artist));
    const sharedVenues = [...currentUserInterests.venues].filter(venue => otherUserInterests.venues.has(venue));

    // Simple scoring: 2 points for shared movie/artist, 1 for venue
    const score = (sharedMovies.length * 2) + (sharedArtists.length * 2) + (sharedVenues.length * 1);

    if (score > 0) {
      scores.push({ userId: otherUserId, score });
    }
  }

  // 3. Sort by score descending
  return scores.sort((a, b) => b.score - a.score);
}
