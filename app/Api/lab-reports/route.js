// /api/lab-reports/route.js
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db('healthcare');
}

// GET /api/lab-reports - All reports
export async function GET() {
  try {
    const db = await connectToDatabase();
    const reports = await db.collection('labReports').find().toArray();
    return NextResponse.json({ reports }, { status: 200 });
  } catch (error) {
    console.error('Error fetching lab reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// POST /api/lab-reports - Add new report
export async function POST(request) {
  try {
    const body = await request.json();
    const { patientId, doctorId, reportType, findings } = body;

    if (!patientId || !doctorId || !reportType || !findings) {
      return NextResponse.json({ error: "Missing report info" }, { status: 400 });
    }

    const db = await connectToDatabase();
    const result = await db.collection('labReports').insertOne({
      patientId: new ObjectId(patientId),
      doctorId: new ObjectId(doctorId),
      reportType,
      findings,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, reportId: result.insertedId });
  } catch (error) {
    console.error('Error saving lab report:', error);
    return NextResponse.json({ error: 'Failed to save report' }, { status: 500 });
  }
}
