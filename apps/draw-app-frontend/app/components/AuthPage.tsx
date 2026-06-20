"use client";

import { HTTP_BACKEND } from "@/config";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthPage({
  isSignin,
}: {
  isSignin: boolean;
}) {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    try {
      setLoading(true);

      if (isSignin) {
        const response = await axios.post(
          `${HTTP_BACKEND}/login`,
          {
            email,
            password,
          }
        );

        localStorage.setItem("token", response.data.token);

        router.push("/dashboard");
      } else {
        await axios.post(`${HTTP_BACKEND}/signup`, {
          name,
          email,
          password,
        });

        alert("Account created successfully");
        router.push("/signin");
      }
    } catch (e: any) {
      alert(
        e?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            {isSignin ? "Welcome Back" : "Create Account"}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {isSignin
              ? "Sign in to continue"
              : "Create an account to start collaborating"}
          </p>
        </div>

        <div className="space-y-4">

          {!isSignin && (
            <input
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}

          <input
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            onClick={handleAuth}
            className="w-full rounded-lg bg-primary py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isSignin
              ? "Sign In"
              : "Sign Up"}
          </button>

          <p className="text-center text-sm text-muted-foreground">
            {isSignin ? (
              <>
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary hover:underline"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-primary hover:underline"
                >
                  Sign In
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

