"use client"
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, KeyRound, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated, isLoading: globalLoading, login, requestOTP, loginWithOTP } = useAuth();
  const router = useRouter();

  const [showRootLogin, setShowRootLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Prevent flash of landing page if already authenticated or loading
  if (globalLoading || isAuthenticated) {
    return null;
  }

  const handleSSOLogin = () => {
    if (isAuthenticated) {
      router.push('/home');
    } else {
      login();
    }
  };

  const handleGetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    await requestOTP({
      email,
      successTask: () => {
        setIsLoading(false);
        setOtpSent(true);
        toast.success("OTP sent to your email");
      },
      errorTask: (error) => {
        setIsLoading(false);
        toast.error(error || "Failed to send OTP");
      }
    });
  };

  const handleRootLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }

    setIsLoading(true);
    await loginWithOTP({
      email,
      otp,
      successTask: () => {
        setIsLoading(false);
        const returnUrl = sessionStorage.getItem("return_url");
        if (returnUrl && returnUrl !== '/') {
          sessionStorage.removeItem("return_url");
          router.push(returnUrl);
        } else {
          router.push('/home');
        }
      },
      errorTask: (error) => {
        setIsLoading(false);
        toast.error(error || "Invalid OTP");
      }
    });
  };

  return (
    <div className="font-sans flex items-center justify-center min-h-screen p-8 bg-gradient-to-b from-background to-secondary/20">
      <main className="flex flex-col gap-8 items-center w-full max-w-md animate-in fade-in duration-700">
        <div className="flex flex-col items-center gap-4 mb-4">
          <Image
            className="dark:invert drop-shadow-xl"
            src="/logo.png"
            alt="Argus Intelligence logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Argus Intelligence
          </h1>
        </div>

        {!showRootLogin ? (
          <div className="flex gap-4 items-center flex-col w-full">
            <Button
              data-testid="login-sso-button"
              onClick={handleSSOLogin}
              size="lg"
              className="cursor-pointer w-full group transition-all duration-300 hover:scale-[1.02]"
            >
              Enterprise Single Sign-On
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>

            <div className="relative w-full py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">Or</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowRootLogin(true)}
              size="lg"
              className="cursor-pointer w-full border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              Root User Login
              <KeyRound className="ml-2 w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="w-full p-8 rounded-2xl border border-primary/10 bg-background/50 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-500">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRootLogin(false)}
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowRight className="mr-2 w-4 h-4 rotate-180" />
              Back
            </Button>

            <h2 className="text-xl font-semibold mb-6">Root User Login</h2>

            {!otpSent ? (
              <form onSubmit={handleGetOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="root@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 focus-visible:ring-primary/30"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 transition-all cursor-pointer"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Get OTP
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRootLogin} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">
                    We've sent an OTP to <span className="font-semibold text-foreground">{email}</span>
                  </p>
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-11 tracking-[0.5em] text-center font-mono text-lg focus-visible:ring-primary/30"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 transition-all cursor-pointer"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Login
                </Button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-full text-xs text-muted-foreground hover:text-primary transition-colors py-2 cursor-pointer"
                >
                  Didn't receive code? Try again
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
