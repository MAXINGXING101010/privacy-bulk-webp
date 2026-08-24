import { sql } from '@vercel/postgres';

export async function query(text, params) {
  const { rows } = await sql.query(text, params);
  return rows;
}

export { sql };
