"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { useToast } from "@/components/ui/Toast";

import { getFirebaseAuth, getFirebaseDatabase } from "@/lib/firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";

export default function RegisterPage() {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Real-time password strength check
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber) {
      setErrorMsg("Please satisfy all password security requirements.");
      return;
    }

    setIsLoading(true);

    try {
      const auth = getFirebaseAuth();
      const db = getFirebaseDatabase();

      // 1. Create User in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Update their display name in Firebase Auth
      await updateProfile(userCredential.user, {
        displayName: name
      });

      // 3. Step 2 - Realtime Database: Create user profile
      const uid = userCredential.user.uid;
      await set(ref(db, `users/${uid}/profile`), {
        name: name,
        email: email,
        age: 0, // Placeholder values for onboarding
        height: 0,
        weight: 0,
        fitnessGoal: "Not set",
        createdAt: Date.now()
      });

      toastSuccess("Account Created!", "Proceeding to personalized fitness onboarding...");
      router.push("/onboarding");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
      toastError("Registration Failed", err.message || "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] flex flex-col justify-center items-center p-4 relative overflow-hidden py-12">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/10 blur-[150px] pointer-events-none rounded-full" />

      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[1.5px] shadow-glow">
          <div className="w-full h-full bg-[#090A0F] rounded-[10px] flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
        </div>
        <span className="font-extrabold text-xl tracking-tight text-white">
          FITTRACK <span className="text-emerald-400">AI</span>
        </span>
      </Link>

      <div className="w-full max-w-md">
        <GlassCard intensity="high" className="p-8 sm:p-10 space-y-6">
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Create Account</h1>
            <p className="text-xs text-neutral-400">
              Start building your strongest self with real data.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat your password..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            {/* Password Requirements Checklist */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1.5 text-[11px] text-neutral-400">
              <div className="font-semibold text-neutral-300 mb-1">Password Strength:</div>
              <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-400" : ""}`}>
                <Check className={`w-3.5 h-3.5 ${hasMinLength ? "text-emerald-400" : "text-neutral-600"}`} />
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-400" : ""}`}>
                <Check className={`w-3.5 h-3.5 ${hasUppercase ? "text-emerald-400" : "text-neutral-600"}`} />
                <span>At least one uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-400" : ""}`}>
                <Check className={`w-3.5 h-3.5 ${hasNumber ? "text-emerald-400" : "text-neutral-600"}`} />
                <span>At least one number (0-9)</span>
              </div>
              {confirmPassword.length > 0 && (
                <div className={`flex items-center gap-1.5 ${isMatch ? "text-emerald-400" : "text-rose-400"}`}>
                  <Check className={`w-3.5 h-3.5 ${isMatch ? "text-emerald-400" : "text-rose-500"}`} />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          <div className="pt-4 border-t border-white/[0.08] text-center text-xs text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-emerald-400 hover:text-emerald-300">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
