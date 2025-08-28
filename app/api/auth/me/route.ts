import { NextRequest, NextResponse } from 'next/server';
import { getSessionByToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session-token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const session = await getSessionByToken(token);
  
  if (!session) {
    return NextResponse.json({ error: 'Session invalide' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.admin_id,
      username: session.username,
      email: session.email,
      avatar_url: session.avatar_url,
      is_base_admin: session.is_base_admin
    }
  });
}