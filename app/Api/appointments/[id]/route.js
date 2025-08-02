// /api/appointments/[id]/route.js

import { NextRequest, NextResponse } from 'next/server';
import { ObjectId, MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db('healthcare');
}

// PUT /api/appointments/[id] - Update an appointment
export async function PUT(request, { params }) {
  try {
    const db = await connectToDatabase();
    const body = await request.json();
    const { id } = params;

    const result = await db.collection('appointments').updateOne(
      { _id: new ObjectId(id) },
      { $set: body }
    );

    return NextResponse.json({ success: result.modifiedCount > 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

// DELETE /api/appointments/[id] - Delete an appointment
export async function DELETE(request, { params }) {
  try {
    const db = await connectToDatabase();
    const { id } = params;

    const result = await db.collection('appointments').deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: result.deletedCount > 0 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
