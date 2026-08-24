export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { getTokenFromRequest, verifyToken } = await import('../../src/utils/auth.js');
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const { sql } = await import('@vercel/postgres');
    const { rows } = await sql`
      SELECT id, file_name, original_size, converted_size, compression_mode, quality, created_at
      FROM conversion_history
      WHERE user_id = ${decoded.userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return res.status(200).json({ conversions: rows });
  } catch (error) {
    console.error('Conversion history error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
