import { Database } from '@nozbe/watermelondb'
import { adapter } from './adapter'
import FavoriteTrack from './models/FavoriteTrack'

export const database = new Database({
  adapter,
  modelClasses: [FavoriteTrack],
})
