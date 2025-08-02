// /api/patients/route.js
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

// GET /api/patients?doctorId=<id> - Get all patients for a doctor
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    if (doctorId) {
      const appointmentsCollection = db.collection('appointments');

      // ✅ First convert to array
      const appointments = await appointmentsCollection
        .find({ doctorId: new ObjectId(doctorId) })
        .toArray();

      // ✅ Now map safely
      const patientIds = appointments.map(doc => doc.patientId);

      const patients = await usersCollection
        .find({ _id: { $in: patientIds }, userType: 'patient' })
        .toArray();

      return NextResponse.json({ patients }, { status: 200 });
    }

    // If no doctorId, return all patients
    const patients = await usersCollection.find({ userType: 'patient' }).toArray();
    return NextResponse.json({ patients }, { status: 200 });

  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}
