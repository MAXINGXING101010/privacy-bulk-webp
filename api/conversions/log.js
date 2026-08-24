export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { getTokenFromRequest, verifyToken } = await import('../../src/utils/auth.js');
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(200).json({ message: 'Not logged in, skipping log' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(200).json({ message: 'Invalid token, skipping log' });
    }

    const { fileName, originalSize, convertedSize, compressionMode, quality } = req.body;

    const { sql } = await import('@vercel/postgres');
    await sql`
      INSERT INTO conversion_history (user_id, file_name, original_size, converted_size, compression_mode, quality)
      VALUES (${decoded.userId}, ${fileName}, ${originalSize}, ${convertedSize}, ${compressionMode || 'standard'}, ${quality || 82})
    `;

    return res.status(201).json({ message: 'Conversion logged' });
  } catch (error) {
    console.error('Conversion log error:', error);
    return res.status(500).json({ error: 'Failed to log conversion' });
  }
}
