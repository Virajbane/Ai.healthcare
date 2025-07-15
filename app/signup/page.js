"use client";
import { useState } from "react";

export default function SignupPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", role: "patient" });

  const handleSubmit = async (e) => {
  e.preventDefault();

  const res = await fetch("/Api/Auth/sign-up", {
    method: "POST",
    body: JSON.stringify(form),
  });

  const data = await res.json();

  if (res.ok) {
    alert("User registered successfully!");
    // ✅ Redirect to login or dashboard
    window.location.href = "/login"; // Or "/UserDashboard" if you want auto-login
  } else {
    alert(data.message || "Sign-up failed");
  }
};


  return (
    <form onSubmit={handleSubmit} className="p-4">
      <input type="text" placeholder="First Name" onChange={(e) => setForm({...form, firstName: e.target.value})} />
      <input type="text" placeholder="Last Name" onChange={(e) => setForm({...form, lastName: e.target.value})} />
      <input type="email" placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})} />
      <select onChange={(e) => setForm({...form, role: e.target.value})}>
        <option value="doctor">Sign up as Doctor</option>
        <option value="patient">Sign up as Patient</option>
      </select>
      <button type="submit">Sign Up</button>
    </form>
  );
}
