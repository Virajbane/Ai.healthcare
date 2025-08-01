// /api/appointments/route.js (Next.js App Router)
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

// GET /api/appointments - Fetch appointments
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userType = searchParams.get('userType');
    
    if (!userId || !userType) {
      return NextResponse.json(
        { error: 'Missing userId or userType' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection('appointments');
    
    // Build query based on user type
    let query = {};
    if (userType === 'patient') {
      query.patientId = new ObjectId(userId);
    } else if (userType === 'doctor') {
      query.doctorId = new ObjectId(userId);
    }

    const appointments = await collection
      .find(query)
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .toArray();

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['appointmentDate', 'appointmentTime', 'reason'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const db = await connectToDatabase();
    
    // For patients booking with doctors - find doctor by name/email
    if (body.doctorName && !body.doctorId) {
      const doctorsCollection = db.collection('users');
      const doctor = await doctorsCollection.findOne({
        name: body.doctorName,
        userType: 'doctor'
      });
      
      if (doctor) {
        body.doctorId = doctor._id;
        body.doctorEmail = doctor.email;
      }
    }

    // For doctors booking with patients - find patient by name/email
    if (body.patientName && !body.patientId) {
      const patientsCollection = db.collection('users');
      const patient = await patientsCollection.findOne({
        name: body.patientName,
        userType: 'patient'
      });
      
      if (patient) {
        body.patientId = patient._id;
        body.patientEmail = patient.email;
      }
    }

    // Generate meeting link for video appointments
    if (body.mode === 'video' && !body.meetingLink) {
      body.meetingLink = `https://meet.healthcare.com/room/${new ObjectId().toString()}`;
    }

    const appointmentData = {
      ...body,
      patientId: body.patientId ? new ObjectId(body.patientId) : null,
      doctorId: body.doctorId ? new ObjectId(body.doctorId) : null,
      appointmentDate: new Date(body.appointmentDate),
      status: body.status || 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
      reminders: []
    };

    const collection = db.collection('appointments');
    const result = await collection.insertOne(appointmentData);
    
    const appointment = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json({ appointment }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}



