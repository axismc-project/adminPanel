import { pool } from './database';

export interface ActivityLog {
  action: string;
  resource?: string;
  resourceId?: string;
  details?: any;
  adminId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export class ActivityLogger {
  static async log(activityData: ActivityLog): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO activity_logs (admin_id, action, resource, resource_id, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          activityData.adminId || null,
          activityData.action,
          activityData.resource || null,
          activityData.resourceId || null,
          activityData.details ? JSON.stringify(activityData.details) : null,
          activityData.ipAddress || null,
          activityData.userAgent || null
        ]
      );
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du log d\'activité:', error);
    }
  }

  // Méthodes helper pour des actions communes
  static async logLogin(adminId: string, ipAddress: string, userAgent: string): Promise<void> {
    await this.log({
      action: 'LOGIN',
      adminId,
      ipAddress,
      userAgent,
      details: { timestamp: new Date().toISOString() }
    });
  }

  static async logLogout(adminId: string, ipAddress: string): Promise<void> {
    await this.log({
      action: 'LOGOUT',
      adminId,
      ipAddress,
      details: { timestamp: new Date().toISOString() }
    });
  }

  static async logAccess(adminId: string, resource: string, ipAddress: string): Promise<void> {
    await this.log({
      action: 'ACCESS',
      resource,
      adminId,
      ipAddress,
      details: { timestamp: new Date().toISOString() }
    });
  }

  // Pour les futures fonctionnalités
  static async logPlayerAction(adminId: string, playerId: string, action: string, details: any, ipAddress: string): Promise<void> {
    await this.log({
      action: `PLAYER_${action.toUpperCase()}`,
      resource: 'player',
      resourceId: playerId,
      adminId,
      ipAddress,
      details
    });
  }

  static async logEconomyAction(adminId: string, action: string, details: any, ipAddress: string): Promise<void> {
    await this.log({
      action: `ECONOMY_${action.toUpperCase()}`,
      resource: 'economy',
      adminId,
      ipAddress,
      details
    });
  }

  static async logWorldAction(adminId: string, action: string, details: any, ipAddress: string): Promise<void> {
    await this.log({
      action: `WORLD_${action.toUpperCase()}`,
      resource: 'world',
      adminId,
      ipAddress,
      details
    });
  }
}