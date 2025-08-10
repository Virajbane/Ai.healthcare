// app/api/auth/sign-in/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Session from "@/Bserver/models/session";
import User from "@/Bserver/models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    console.log("Sign-in attempt for email:", email);

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    await dbConnect();
    console.log("Database connected");

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    console.log("User found:", user.email);

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    console.log("Password verified");

    // Deactivate any existing sessions for this user
    await Session.updateMany(
      { userId: user._id, isActive: true },
      { isActive: false }
    );

    // Generate unique session token
    const sessionToken = uuidv4();

    // Create new session in MongoDB
    const newSession = await Session.create({
      userId: user._id,
      sessionToken: sessionToken,
      userRole: user.role,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      isActive: true,
      lastActivity: new Date()
    });

    console.log("Session created in database:", newSession._id);

    // Generate JWT token (optional, for additional security)
    const jwtToken = jwt.sign(
      { 
        sessionId: newSession._id,
        userId: user._id, 
        email: user.email, 
        role: user.role,
        sessionToken: sessionToken
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    return NextResponse.json(
      { 
        message: "Login successful",
        sessionToken: sessionToken,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
        }
      },
      {
        status: 200,
        headers: {
          'Set-Cookie': `sessionToken=${sessionToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`
        }
      }
    );

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}