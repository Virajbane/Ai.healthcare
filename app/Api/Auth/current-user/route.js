// current-user route.js
import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function GET(req) {
  const user = await validateSession(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(user);
}
