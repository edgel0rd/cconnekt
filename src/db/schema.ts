import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';

// --- AUTHENTICATION --- //
export const users = sqliteTable('users', {
  id: text('id').notNull().primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
});

export const sessions = sqliteTable('sessions', {
  id: text('id').notNull().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  expiresAt: integer('expires_at').notNull(),
});

// --- INTERESTS --- //
export const movies = sqliteTable('movies', { id: integer('id').primaryKey(), title: text('title').notNull().unique() });
export const artists = sqliteTable('artists', { id: integer('id').primaryKey(), name: text('name').notNull().unique() });
export const venues = sqliteTable('venues', { id: integer('id').primaryKey(), name: text('name').notNull() });

// --- USER-INTEREST JOIN TABLES --- //
export const userMovies = sqliteTable('user_movies', { userId: text('user_id').notNull().references(() => users.id), movieId: integer('movie_id').notNull().references(() => movies.id) }, (t) => ({ pk: primaryKey({ columns: [t.userId, t.movieId] }) }));
export const userArtists = sqliteTable('user_artists', { userId: text('user_id').notNull().references(() => users.id), artistId: integer('artist_id').notNull().references(() => artists.id) }, (t) => ({ pk: primaryKey({ columns: [t.userId, t.artistId] }) }));
export const userVenues = sqliteTable('user_venues', { userId: text('user_id').notNull().references(() => users.id), venueId: integer('venue_id').notNull().references(() => venues.id) }, (t) => ({ pk: primaryKey({ columns: [t.userId, t.venueId] }) }));

// --- CONNECTIONS & CHAT --- //
export const connections = sqliteTable('connections', {
  id: integer('id').primaryKey(),
  userOneId: text('user_one_id').notNull().references(() => users.id),
  userTwoId: text('user_two_id').notNull().references(() => users.id),
  status: text('status', { enum: ['pending', 'accepted'] }).notNull(), // pending: userOne sent, userTwo needs to accept
});

export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey(),
  connectionId: integer('connection_id').notNull().references(() => connections.id),
  senderId: text('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

