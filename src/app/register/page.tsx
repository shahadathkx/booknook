"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookNookButton } from "@/components/ui/booknook-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { authClient } from "@/lib/auth-client";
import { notify } from "@/lib/notify";
import { siteConfig } from "@/lib/config";
import {
  RiBookReadLine,
  RiUserLine,
  RiMailLine,
  RiImageLine,
  RiLockPasswordLine,
  RiArrowRightLine,
  RiCheckLine,
  RiCloseLine,
} from "react-icons/ri";

function GoogleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [password, setPassword] = useState("");
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Strict Password Validation Rules
  const passwordChecks = useMemo(() => {
    const hasMinLength = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);

    return {
      hasMinLength,
      hasUppercase,
      hasLowercase,
      isValid: hasMinLength && hasUppercase && hasLowercase,
    };
  }, [password]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedPassword(true);

    if (!name.trim()) {
      notify.error("Validation Error", "Please provide your full name.");
      return;
    }
    if (!email.trim()) {
      notify.error("Validation Error", "Please provide your email address.");
      return;
    }
    if (!passwordChecks.isValid) {
      notify.error(
        "Invalid Password",
        "Your password does not satisfy the security requirements."
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        image: photoUrl.trim() || undefined,
        callbackURL: "/login",
      });

      if (response.error) {
        notify.error("Registration Failed", response.error.message || "Could not register account.");
        setIsLoading(false);
        return;
      }

      notify.success(
        "Account Created Successfully",
        "Your reader account has been created. Please sign in to continue."
      );
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      notify.error("Registration Error", message);
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setIsGoogleLoading(true);
    try {
      const res = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl,
      });

      if (res?.error) {
        notify.error("Google Sign-In Failed", res.error.message || "Failed to initiate Google authentication.");
        setIsGoogleLoading(false);
        return;
      }

      if (res?.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google authentication unavailable.";
      notify.error("Google Sign-In Failed", message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-foreground hover:opacity-90 transition-opacity mb-4"
        >
          <div className="size-10 rounded-2xl bg-gradient-to-br from-[#1a382a] via-[#15251d] to-[#0e1a14] border border-[#1f362b] shadow-sm flex items-center justify-center text-[#8fd9a8]">
            <RiBookReadLine className="size-5" />
          </div>
          <span className="font-heading font-serif text-2xl font-bold tracking-tight">
            {siteConfig.appName}
          </span>
        </Link>

        <SectionHeading
          align="center"
          eyebrow="Reader Registration"
          title="Join Our Community Library"
          description="Create your reader profile to borrow books, curate wishlists, and reserve timeless classics."
        />
      </div>

      {/* Card Container */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#8fd9a8]/60 to-transparent" />

        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Full Name <span className="text-[#e0915a]">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eleanor Vance"
                className="pl-9 h-10 rounded-full bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#8fd9a8]"
              />
              <RiUserLine className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Email Address <span className="text-[#e0915a]">*</span>
            </label>
            <div className="relative">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eleanor.vance@readersguild.org"
                className="pl-9 h-10 rounded-full bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#8fd9a8]"
              />
              <RiMailLine className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Photo URL (Optional) */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Profile Photo URL <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://images.example.com/avatar.jpg"
                className="pl-9 h-10 rounded-full bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#8fd9a8]"
              />
              <RiImageLine className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Password <span className="text-[#e0915a]">*</span>
            </label>
            <div className="relative">
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setTouchedPassword(true);
                }}
                placeholder="••••••••"
                className="pl-9 h-10 rounded-full bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-[#8fd9a8]"
              />
              <RiLockPasswordLine className="size-4 text-muted-foreground absolute left-3 top-3 pointer-events-none" />
            </div>

            {/* Inline Password Validation Rules Indicator */}
            <div className="mt-2.5 p-2.5 rounded-2xl bg-background border border-border space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                {passwordChecks.hasMinLength ? (
                  <RiCheckLine className="size-3.5 text-[#8fd9a8]" />
                ) : (
                  <RiCloseLine className="size-3.5 text-muted-foreground" />
                )}
                <span
                  className={
                    passwordChecks.hasMinLength
                      ? "text-[#8fd9a8] font-medium"
                      : "text-muted-foreground"
                  }
                >
                  At least 6 characters
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {passwordChecks.hasUppercase ? (
                  <RiCheckLine className="size-3.5 text-[#8fd9a8]" />
                ) : (
                  <RiCloseLine className="size-3.5 text-muted-foreground" />
                )}
                <span
                  className={
                    passwordChecks.hasUppercase
                      ? "text-[#8fd9a8] font-medium"
                      : "text-muted-foreground"
                  }
                >
                  At least one uppercase letter (A-Z)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {passwordChecks.hasLowercase ? (
                  <RiCheckLine className="size-3.5 text-[#8fd9a8]" />
                ) : (
                  <RiCloseLine className="size-3.5 text-muted-foreground" />
                )}
                <span
                  className={
                    passwordChecks.hasLowercase
                      ? "text-[#8fd9a8] font-medium"
                      : "text-muted-foreground"
                  }
                >
                  At least one lowercase letter (a-z)
                </span>
              </div>
            </div>

            {touchedPassword && !passwordChecks.isValid && (
              <p className="text-[11px] text-rose-400 mt-1 pl-1">
                Password must meet all 3 criteria above to submit.
              </p>
            )}
          </div>

          {/* Submit Button (Reusing ONE consistent rounded mint-green button) */}
          <BookNookButton
            type="submit"
            size="default"
            disabled={isLoading || (touchedPassword && !passwordChecks.isValid)}
            className="w-full mt-3 font-bold"
          >
            {isLoading ? "Creating Reader Account..." : "Create Account"}
          </BookNookButton>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center text-xs text-muted-foreground">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <span className="relative bg-card px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
            or sign up with
          </span>
        </div>

        {/* Google Social Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleRegister}
          disabled={isGoogleLoading}
          className="w-full h-10 rounded-full border-border bg-background hover:bg-muted text-foreground font-medium text-xs gap-2"
        >
          <GoogleIcon className="size-4" />
          <span>{isGoogleLoading ? "Connecting..." : "Sign up with Google"}</span>
        </Button>

        {/* Footer Link to Login */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link
            href={`/login${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
            className="text-[#8fd9a8] font-semibold hover:underline inline-flex items-center gap-0.5"
          >
            <span>Sign in instead</span>
            <RiArrowRightLine className="size-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-background transition-colors">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 text-center text-xs text-muted-foreground">
            Loading reader registration...
          </div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
