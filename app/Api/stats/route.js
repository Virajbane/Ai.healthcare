// /api/stats/route.js
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const statsClient = new MongoClient(uri);

async function connectStatsDB() {
  if (!statsClient.topology || !statsClient.topology.isConnected()) {
    await statsClient.connect();
  }
  return statsClient.db('healthcare');
}

// GET /api/stats - Get overall statistics
export async function GET() {
  try {
    const db = await connectStatsDB();
    const usersCollection = db.collection('users');
    const appointmentsCollection = db.collection('appointments');
    const reportsCollection = db.collection('labReports');

    const [patientCount, doctorCount, appointmentCount, labReportCount] = await Promise.all([
      usersCollection.countDocuments({ userType: 'patient' }),
      usersCollection.countDocuments({ userType: 'doctor' }),
      appointmentsCollection.countDocuments(),
      reportsCollection.countDocuments()
    ]);

    return NextResponse.json({
      patientCount,
      doctorCount,
      appointmentCount,
      labReportCount
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}