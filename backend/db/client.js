import { createClient } from '@libsql/client';

const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';

const authToken = process.env.DATABASE_AUTH_TOKEN || undefined;

export const db = createClient({
  url: databaseUrl,
  authToken,
});

export async function execute(sql, args = []) {
  return db.execute({ sql, args });
}
