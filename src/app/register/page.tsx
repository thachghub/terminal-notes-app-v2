"use client";

import { useState } from "react";
import { auth } from "../../firebase/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="min-h-screen bg-black text-cyan-300 flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-sm">
        <h1 className="text-xl font-mono text-cyan-400">Create Account</h1>
        
        <input
          type="email"
          placeholder="Email"
          className="bg-black border border-cyan-400 text-cyan-300 p-2 w-full font-mono outline-none focus:ring-2 focus:ring-cyan-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="bg-black border border-cyan-400 text-cyan-300 p-2 w-full font-mono outline-none focus:ring-2 focus:ring-cyan-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-500 text-black px-4 py-2 font-mono w-full"
        >
          Register
        </button>

        {error && <p className="text-red-400 font-mono">{error}</p>}
      </form>
    </main>
  );
}
