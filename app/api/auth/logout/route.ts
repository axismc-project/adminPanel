import { NextRequest, NextResponse } from 'next/server';
import { invalidateSession } from '@/lib/auth';
import { ActivityLogger } from '@/lib/activity-logger';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('session-token')?.value;
  const adminId = request.headers.get('x-admin-id');
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

  if (token) {
    await invalidateSession(token);
  }

  if (adminId) {
    await ActivityLogger.logLogout(adminId, ip);
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('session-token');
  
  return response;
}