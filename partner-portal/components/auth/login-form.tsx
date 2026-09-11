"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") ?? "/dashboard";
  const [email, setEmail] = useState("owner@fooody.in");
  const [password, setPassword] = useState("Fooody@2026");
  const [phone, setPhone] = useState("9876543210");
  const [otp, setOtp] = useState("123456");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function loginEmail() {
    setBusy(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error("Check email and password");
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function requestOtp() {
    setBusy(true);
    const res = await fetch("/api/auth/otp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error("Could not send OTP");
      return;
    }
    setOtpSent(true);
    toast.success("Demo OTP is 123456");
  }

  async function verifyOtp() {
    setBusy(true);
    const res = await fetch("/api/auth/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code: otp }),
    });
    setBusy(false);
    if (!res.ok) {
      toast.error("Incorrect OTP");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-obsidian px-4 text-ivory">
      <Card className="w-full max-w-md border-white/10 bg-charcoal text-ivory">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2">
            <BrandMark />
            <div>
              <p className="font-display text-xl font-extrabold">
                fooody<span className="text-flame">.</span>in
              </p>
              <p className="text-xs tracking-[0.16em] text-gold uppercase">Partner portal</p>
            </div>
          </div>
          <Tabs defaultValue="email">
            <TabsList className="bg-white/10">
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="otp">Phone OTP</TabsTrigger>
            </TabsList>
            <TabsContent value="email" className="mt-4 space-y-3">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button className="w-full" disabled={busy} onClick={() => void loginEmail()}>
                Sign in
              </Button>
            </TabsContent>
            <TabsContent value="otp" className="mt-4 space-y-3">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              {otpSent && (
                <>
                  <Label>OTP</Label>
                  <Input value={otp} onChange={(e) => setOtp(e.target.value)} />
                </>
              )}
              <Button
                className="w-full"
                disabled={busy}
                onClick={() => void (otpSent ? verifyOtp() : requestOtp())}
              >
                {otpSent ? "Verify OTP" : "Send OTP"}
              </Button>
            </TabsContent>
          </Tabs>
          <p className="text-xs text-mist">
            Demo: owner@fooody.in / Fooody@2026 · kitchen@fooody.in · cashier@fooody.in · phone 9876543210 / 123456
          </p>
          <a className="block text-xs text-gold underline" href="/partners/register">
            Register a new kitchen
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
