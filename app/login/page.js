"use client";
import { useState } from "react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("/Api/Auth/sign-in", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      alert("Login success!");
    } else {
      alert(data.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-4">
      <input type="email" placeholder="Email" onChange={(e) => setForm({...form, email: e.target.value})} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({...form, password: e.target.value})} />
      <button type="submit">Login</button>
    </form>
  );
}
