// app/api/auth/logout/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Session from "@/models/session";

export async function POST(req) {
  try {
    const { sessionToken } = await req.json();

    if (!sessionToken) {
      return NextResponse.json({ message: "Session token required" }, { status: 400 });
    }

    await dbConnect();

    // Deactivate the session in database
    await Session.updateOne(
      { sessionToken: sessionToken },
      { 
        isActive: false,
        lastActivity: new Date()
      }
    );

    // Clear the session cookie
    return NextResponse.json(
      { message: "Logged out successfully" },
      {
        status: 200,
        headers: {
          'Set-Cookie': 'sessionToken=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
        }
      }
    );

  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}