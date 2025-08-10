import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Session from "@/Bserver/models/session";
import "@/Bserver/models/user"; // ✅ Register the User model here

export async function POST(req) {
  try {
    const { sessionToken } = await req.json();

    if (!sessionToken) {
      return NextResponse.json({ message: "Session token required" }, { status: 400 });
    }

    await dbConnect();

    // Find active session
    const session = await Session.findOne({
      sessionToken: sessionToken,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('userId', 'firstName lastName email role'); // needs User model to be registered

    if (!session) {
      return NextResponse.json({ message: "Invalid or expired session" }, { status: 401 });
    }

    // Update last activity
    session.lastActivity = new Date();
    await session.save();

    return NextResponse.json({
      valid: true,
      user: {
        id: session.userId._id,
        firstName: session.userId.firstName,
        lastName: session.userId.lastName,
        email: session.userId.email,
        role: session.userId.role
      },
      session: {
        id: session._id,
        lastActivity: session.lastActivity
      }
    });

  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
