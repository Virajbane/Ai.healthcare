// /api/appointments/route.js
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

// GET /api/appointments?doctorId=<id>
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    const db = await connectToDatabase();
    const collection = db.collection('appointments');

    let query = {};
    if (doctorId) {
      query.doctorId = new ObjectId(doctorId);
    }

    const appointments = await collection.find(query).toArray();
    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

// POST /api/appointments
export async function POST(request) {
  try {
    const body = await request.json();
    const db = await connectToDatabase();
    const collection = db.collection('appointments');

    const newAppointment = {
      ...body,
      doctorId: new ObjectId(body.doctorId),
      patientId: new ObjectId(body.patientId),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newAppointment);
    const saved = await collection.findOne({ _id: result.insertedId });
    return NextResponse.json({ appointment: saved }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
