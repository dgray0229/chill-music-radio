import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'favorite_tracks',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'artist', type: 'string' },
        { name: 'album_art', type: 'string', isOptional: true },
        { name: 'stream_url', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
      ],
    }),
  ],
})
