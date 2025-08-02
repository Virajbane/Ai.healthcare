// /api/doctors/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db('healthcare');
}

// GET /api/doctors - fetch all doctors
export async function GET() {
  try {
    const db = await connectToDatabase();
    const doctors = await db
      .collection('users')
      .find({ userType: 'doctor' })
      .toArray();

    return NextResponse.json({ doctors }, { status: 200 });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}
