import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const savedTracks = sqliteTable('saved_tracks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  artist: text('artist').notNull(),
  artwork: text('artwork'),
  streamUrl: text('stream_url'),
  savedAt: integer('saved_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
