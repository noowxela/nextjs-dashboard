import { neon } from '@neondatabase/serverless';

export function getConnectionString() {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
}

export function hasDatabase() {
  return Boolean(getConnectionString());
}

function createSql() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error(
      'Missing POSTGRES_URL or DATABASE_URL. Set it in .env.local.',
    );
  }

  // fullResults keeps the { rows } shape used by @vercel/postgres.
  return neon(connectionString, { fullResults: true });
}

let sqlClient: ReturnType<typeof createSql> | undefined;

export function sql<T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<{ rows: T[] }> {
  sqlClient ??= createSql();
  return sqlClient(strings, ...values) as Promise<{ rows: T[] }>;
}
