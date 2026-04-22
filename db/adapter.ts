import { Platform } from 'react-native';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { schema } from './schema';

export const adapter = Platform.OS === 'web' 
  ? new LokiJSAdapter({
      schema,
      useWebWorker: false,
      useIncrementalCache: true,
      onSetUpError: error => {
        console.error('WatermelonDB setup error', error);
      }
    })
  : new SQLiteAdapter({
      schema,
      jsi: true,
      onSetUpError: error => {
        console.error('WatermelonDB setup error', error);
      }
    });
