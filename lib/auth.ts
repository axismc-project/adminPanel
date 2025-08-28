import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from './database';

const JWT_SECRET = process.env.JWT_SECRET!;
const SESSION_DURATION = parseInt(process.env.SESSION_DURATION!) || 86400000; // 24h

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  is_base_admin: boolean;
}

export interface Session {
  id: string;
  admin_id: string;
  token: string;
  expires_at: Date;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(adminId: string): string {
  return jwt.sign(
    { adminId },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): { adminId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { adminId: string };
  } catch {
    return null;
  }
}

export async function createSession(
  adminId: string,
  ipAddress: string,
  userAgent: string
): Promise<string> {
  const token = generateToken(adminId);
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await pool.query(
    `INSERT INTO sessions (admin_id, token, ip_address, user_agent, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [adminId, token, ipAddress, userAgent, expiresAt]
  );

  return token;
}

export async function getSessionByToken(token: string): Promise<(Session & AdminUser) | null> {
  const result = await pool.query(
    `SELECT s.*, a.username, a.email, a.avatar_url, a.is_base_admin
     FROM sessions s
     JOIN admins a ON s.admin_id = a.id
     WHERE s.token = $1 AND s.expires_at > NOW() AND a.is_active = true`,
    [token]
  );

  return result.rows[0] || null;
}

export async function invalidateSession(token: string): Promise<void> {
  await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
}

export async function cleanupExpiredSessions(): Promise<void> {
  await pool.query('SELECT cleanup_expired_sessions()');
}