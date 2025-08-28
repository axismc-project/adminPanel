import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { pool } from '@/lib/database';
import { verifyPassword, createSession } from '@/lib/auth';
import { withSecurity } from '@/lib/middleware-security';
import { ActivityLogger } from '@/lib/activity-logger';
import { sendDiscordWebhook } from '@/lib/security';

const loginSchema = z.object({
  username: z.string().min(1, 'Username requis'),
  password: z.string().min(1, 'Mot de passe requis'),
  accessKey: z.string().optional(),
});

async function loginHandler(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';

  try {
    const body = await request.json();
    const { username, password, accessKey } = loginSchema.parse(body);

    // Log de la tentative
    await pool.query(
      `INSERT INTO login_attempts (ip_address, username, success, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [ip, username, false, userAgent]
    );

    // Rechercher l'admin
    const result = await pool.query(
      `SELECT id, username, email, password_hash, access_key, avatar_url, is_base_admin, is_active
       FROM admins WHERE username = $1`,
      [username]
    );

    const admin = result.rows[0];

    if (!admin || !admin.is_active) {
      // Vérifier si on doit bannir cette IP
      await checkAndBanSuspiciousIP(ip);
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    // Vérifier le mot de passe
    const passwordValid = await verifyPassword(password, admin.password_hash);
    if (!passwordValid) {
      await checkAndBanSuspiciousIP(ip);
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    // Vérifier la clé d'accès (sauf pour l'admin de base)
    if (!admin.is_base_admin && admin.access_key) {
      if (!accessKey || accessKey !== admin.access_key) {
        return NextResponse.json({ error: 'Clé d\'accès incorrecte' }, { status: 401 });
      }
    }

    // Créer la session
    const token = await createSession(admin.id, ip, userAgent);

    // Mettre à jour la dernière connexion
    await pool.query(
      'UPDATE admins SET last_login = NOW() WHERE id = $1',
      [admin.id]
    );

    // Log de succès
    await pool.query(
      `UPDATE login_attempts SET success = true 
       WHERE ip_address = $1 AND username = $2 AND created_at > NOW() - INTERVAL '5 minutes'`,
      [ip, username]
    );

    await ActivityLogger.logLogin(admin.id, ip, userAgent);

    // Notification Discord
    try {
      await sendDiscordWebhook('', {
        title: '✅ Connexion Dashboard',
        color: 0x00ff00,
        fields: [
          { name: 'Utilisateur', value: admin.username, inline: true },
          { name: 'IP', value: ip, inline: true },
          { name: 'Timestamp', value: new Date().toISOString(), inline: true }
        ]
      });
    } catch (error) {
      console.error('Erreur Discord webhook:', error);
    }

    // Réponse avec cookie sécurisé
    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        avatar_url: admin.avatar_url,
        is_base_admin: admin.is_base_admin
      }
    });

    response.cookies.set('session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 24h
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Erreur login:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Données invalides',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

async function checkAndBanSuspiciousIP(ip: string): Promise<void> {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as attempts 
       FROM login_attempts 
       WHERE ip_address = $1 AND success = false AND created_at > NOW() - INTERVAL '15 minutes'`,
      [ip]
    );

    const attempts = parseInt(result.rows[0].attempts);

    if (attempts >= 5) {
      const banDuration = new Date(Date.now() + 3600000); // 1 heure
      
      await pool.query(
        `INSERT INTO banned_ips (ip_address, reason, banned_until) 
         VALUES ($1, $2, $3)
         ON CONFLICT (ip_address) 
         DO UPDATE SET banned_until = $3, reason = $2`,
        [ip, `Trop de tentatives de connexion échouées: ${attempts}`, banDuration]
      );

      // Alerte Discord
      try {
        await sendDiscordWebhook(`🚨 **Alerte Sécurité Dashboard**\nIP bannie: ${ip} (${attempts} tentatives échouées)`);
      } catch (error) {
        console.error('Erreur Discord alert:', error);
      }
    }
  } catch (error) {
    console.error('Erreur check suspicious IP:', error);
  }
}

export async function POST(request: NextRequest) {
  return withSecurity(request, loginHandler);
}