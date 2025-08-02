// ✅ app/api/lab-reports/stats/route.js
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
    const reports = await db.collection('labReports').find().toArray();

    const total = reports.length;
    const types = reports.reduce((acc, curr) => {
      acc[curr.reportType] = (acc[curr.reportType] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({ total, types });
  } catch (error) {
    console.error('Error fetching lab report stats:', error);
    return NextResponse.json({ error: 'Failed to fetch lab report stats' }, { status: 500 });
  }
}
