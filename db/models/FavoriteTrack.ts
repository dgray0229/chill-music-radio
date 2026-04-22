import { Model } from '@nozbe/watermelondb'
import { field, date, readonly } from '@nozbe/watermelondb/decorators'

export default class FavoriteTrack extends Model {
  static table = 'favorite_tracks'

  @field('title') title: string
  @field('artist') artist: string
  @field('album_art') albumArt?: string
  @field('stream_url') streamUrl?: string
  @readonly @date('created_at') createdAt: number
}
