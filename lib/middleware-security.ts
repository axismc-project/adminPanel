import { NextRequest, NextResponse } from 'next/server';
import { pool } from './database';

export async function withSecurity(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  try {
    // Vérifier si l'IP est bannie
    const banResult = await pool.query(
      `SELECT * FROM banned_ips 
       WHERE ip_address = $1 AND (banned_until IS NULL OR banned_until > NOW())`,
      [ip]
    );

    if (banResult.rows.length > 0) {
      return NextResponse.json({ error: 'IP bannie' }, { status: 403 });
    }

    // Rate limiting simple basé sur la DB
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    const attemptsResult = await pool.query(
      `SELECT COUNT(*) as count 
       FROM login_attempts 
       WHERE ip_address = $1 AND created_at > $2`,
      [ip, fifteenMinutesAgo]
    );

    const attempts = parseInt(attemptsResult.rows[0]?.count || '0');
    
    if (attempts >= 10) { // 10 tentatives max par 15 min
      return NextResponse.json({ 
        error: 'Trop de tentatives. Réessayez dans 15 minutes.' 
      }, { status: 429 });
    }

    return await handler(request);
  } catch (error) {
    console.error('Erreur middleware sécurité:', error);
    return await handler(request);
  }
}