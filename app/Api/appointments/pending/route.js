// ✅ app/api/appointments/pending/route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const userType = searchParams.get('userType');

  if (!userId || !userType) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // TODO: Replace with DB logic
  return NextResponse.json({ appointments: [] });
}