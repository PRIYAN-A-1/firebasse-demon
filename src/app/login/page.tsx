"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, ArrowRight, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GlassCard } from "@/components/ui/GlassCard";
import { useToast } from "@/components/ui/Toast";

// Import Firebase Auth
import { auth } from "@/lib/firebase/config";
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Handle incoming Magic Link
  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setIsLoading(true);
        let storedEmail = window.localStorage.getItem("emailForSignIn");
        
        if (!storedEmail) {
          storedEmail = window.prompt("Please provide your email for confirmation");
        }

        if (storedEmail) {
          try {
            const result = await signInWithEmailLink(auth, storedEmail, window.location.href);
            window.localStorage.removeItem("emailForSignIn");
            toastSuccess("Welcome!", "Successfully signed in with Magic Link.");
            router.push("/dashboard");
          } catch (error: any) {
            toastError("Sign In Failed", error.message || "Invalid or expired link.");
            setErrorMsg(error.message);
          }
        }
        setIsLoading(false);
      }
    };

    handleEmailLinkSignIn();
  }, [router, toastError, toastSuccess]);

  // Standard Password Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Login failed");
        toastError("Login Failed", data.error || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      toastSuccess("Welcome Back!", `Signed in as ${data.user.name}`);

      if (!data.user.onboarded) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      toastError("Error", "Network connection error");
      setIsLoading(false);
    }
  };

  // Firebase Magic Link Login
  const handleMagicLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!email) {
      toastError("Email Required", "Please enter your email to receive a magic link.");
      return;
    }

    setIsMagicLinkLoading(true);
    setErrorMsg("");

    const actionCodeSettings = {
      // URL you want to redirect back to. Ensure this domain is authorized in Firebase Console.
      url: window.location.origin + '/login',
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setIsEmailSent(true);
      toastSuccess("Email Sent!", "Check your inbox for the magic sign-in link.");
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to send magic link.");
      toastError("Error", "Could not send magic link.");
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />

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
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Sign In</h1>
            <p className="text-xs text-neutral-400">
              Access your personalized workouts, meals, and AI analytics.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {isEmailSent ? (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm text-center">
              We&apos;ve sent a magic link to <strong>{email}</strong>. Please check your inbox and click the link to sign in.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <div className="space-y-1">
                <Input
                  label="Password (Optional for Magic Link)"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading && !isSignInWithEmailLink(auth, window.location.href)}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In with Password
                </Button>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/[0.08]"></div>
                  <span className="flex-shrink-0 mx-4 text-xs text-neutral-500">OR</span>
                  <div className="flex-grow border-t border-white/[0.08]"></div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMagicLink}
                  className="w-full border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-400"
                  size="lg"
                  isLoading={isMagicLinkLoading}
                  icon={<Wand2 className="w-4 h-4" />}
                >
                  Sign In with Magic Link
                </Button>
              </div>
            </form>
          )}

          <div className="pt-4 border-t border-white/[0.08] text-center text-xs text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-emerald-400 hover:text-emerald-300">
              Create an account
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
