import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { pool } from './database';
import axios from 'axios';

// Configuration rate limiting
const loginLimiter = new RateLimiterMemory({
  points: parseInt(process.env.MAX_LOGIN_ATTEMPTS!) || 5,
  duration: parseInt(process.env.LOGIN_ATTEMPT_WINDOW!) / 1000 || 900, // 15 minutes
});

const globalLimiter = new RateLimiterMemory({
  points: 100, // Nombre de requêtes
  duration: 3600, // par heure
});

export interface SecurityCheck {
  allowed: boolean;
  message?: string;
  banUntil?: Date;
}

export async function checkRateLimit(ip: string, type: 'login' | 'global'): Promise<SecurityCheck> {
  const limiter = type === 'login' ? loginLimiter : globalLimiter;
  
  try {
    await limiter.consume(ip);
    return { allowed: true };
  } catch (rejRes: any) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
    return {
      allowed: false,
      message: `Trop de tentatives. Réessayez dans ${secs} secondes.`
    };
  }
}

export async function isIPBanned(ip: string): Promise<SecurityCheck> {
  const result = await pool.query(
    `SELECT * FROM banned_ips 
     WHERE ip_address = $1 AND (banned_until IS NULL OR banned_until > NOW())`,
    [ip]
  );

  if (result.rows.length > 0) {
    const ban = result.rows[0];
    return {
      allowed: false,
      message: 'Votre IP est bannie.',
      banUntil: ban.banned_until
    };
  }

  return { allowed: true };
}

export async function banIP(ip: string, reason: string, duration?: number): Promise<void> {
  const banDuration = duration || parseInt(process.env.BAN_DURATION!) || 3600000; // 1h
  const bannedUntil = new Date(Date.now() + banDuration);

  await pool.query(
    `INSERT INTO banned_ips (ip_address, reason, banned_until) 
     VALUES ($1, $2, $3)
     ON CONFLICT (ip_address) 
     DO UPDATE SET banned_until = $3, reason = $2`,
    [ip, reason, bannedUntil]
  );
}

export async function logLoginAttempt(
  ip: string,
  username: string | null,
  success: boolean,
  userAgent: string
): Promise<void> {
  await pool.query(
    `INSERT INTO login_attempts (ip_address, username, success, user_agent)
     VALUES ($1, $2, $3, $4)`,
    [ip, username, success, userAgent]
  );

  // Détection d'activité suspecte
  if (!success) {
    await detectSuspiciousActivity(ip);
  }
}

async function detectSuspiciousActivity(ip: string): Promise<void> {
  // Vérifier les tentatives des 15 dernières minutes
  const result = await pool.query(
    `SELECT COUNT(*) as attempts 
     FROM login_attempts 
     WHERE ip_address = $1 AND success = false AND created_at > NOW() - INTERVAL '15 minutes'`,
    [ip]
  );

  const attempts = parseInt(result.rows[0].attempts);
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS!) || 5;

  if (attempts >= maxAttempts) {
    await banIP(ip, `Trop de tentatives de connexion échouées: ${attempts}`, 3600000); // 1h
    await sendDiscordAlert(`🚨 IP bannie: ${ip} (${attempts} tentatives échouées)`);
  }
}

export async function sendDiscordWebhook(message: string, embed?: any): Promise<void> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  if (!webhookUrl) return;

  try {
    await axios.post(webhookUrl, {
      content: message,
      embeds: embed ? [embed] : undefined,
    });
  } catch (error) {
    console.error('Erreur envoi Discord webhook:', error);
  }
}

export async function sendDiscordAlert(message: string): Promise<void> {
  await sendDiscordWebhook(`🔐 **Alerte Sécurité Dashboard**\n${message}`);
}

// Fonction pour nettoyer les anciens logs
export async function cleanupOldLogs(): Promise<void> {
  await pool.query('SELECT cleanup_old_login_attempts()');
}