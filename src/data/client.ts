import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('chillradio.db');
export const db = drizzle(expoDb, { schema });
