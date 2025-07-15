// app/api/auth/sign-in/route.js

import dbConnect from "@/lib/mongodb";
import User from "@/models/user";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { email, password } = await req.json();

  await dbConnect();

  const user = await User.findOne({ email });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 401 });
  }

  return new Response(JSON.stringify({ message: "Login successful", userId: user._id, role: user.role }), { status: 200 });
}
