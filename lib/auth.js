// lib/auth.js

import dbConnect from '@/lib/mongodb';
import Session from "@/Bserver/models/session";
import "@/Bserver/models/user"; // make sure user model is loaded

export async function validateSession(sessionToken) {
  if (!sessionToken) return null;

  try {
    await dbConnect();

    const session = await Session.findOne({
      sessionToken: sessionToken,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('userId', 'firstName lastName email role');

    if (!session) return null;

    // Optional: update activity
    session.lastActivity = new Date();
    await session.save();

    return {
      id: session.userId._id,
      firstName: session.userId.firstName,
      lastName: session.userId.lastName,
      email: session.userId.email,
      role: session.userId.role
    };
  } catch (err) {
    console.error('Session validation error:', err);
    return null;
  }
}
