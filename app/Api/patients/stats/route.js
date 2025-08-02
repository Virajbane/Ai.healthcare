// ✅ app/api/patients/stats/route.js
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

export async function GET() {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const total = await usersCollection.countDocuments({ userType: 'patient' });
    const male = await usersCollection.countDocuments({ userType: 'patient', gender: 'male' });
    const female = await usersCollection.countDocuments({ userType: 'patient', gender: 'female' });

    return NextResponse.json({ total, male, female });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}