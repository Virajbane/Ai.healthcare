// /api/appointments/upcoming/route.js - Get upcoming appointments
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');
    const limit = parseInt(searchParams.get('limit')) || 5;
    
    if (!userId || !userType) {
      return NextResponse.json(
        { error: 'Missing userId or userType' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection('appointments');
    
    let query = {
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    };
    
    if (userType === 'patient') {
      query.patientId = new ObjectId(userId);
    } else if (userType === 'doctor') {
      query.doctorId = new ObjectId(userId);
    }

    const appointments = await collection
      .find(query)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upcoming appointments' },
      { status: 500 }
    );
  }
} 