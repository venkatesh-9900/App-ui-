"use client"
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, ArrowRight, UserPlus, Building2, Copy, CheckCircle2, Search, LogIn } from "lucide-react";

type AuthMode = 'default' | 'signin' | 'signup' | 'retrieve-org';
type AuthStep = 'email' | 'otp' | 'result';
type UserType = 'member' | 'admin';

export default function LandingPage() {
  const { isAuthenticated, isLoading: globalLoading, login, requestOTP, loginWithOTP, loginUserWithOTP, signupRoot, retrieveOrg } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>('default');
  const [step, setStep] = useState<AuthStep>('email');
  const [userType, setUserType] = useState<UserType>('member');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultOrgId, setResultOrgId] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [copied, setCopied] = useState(false);

  if (globalLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  const resetFlow = () => {
    setMode('default');
    setStep('email');
    setUserType('member');
    setEmail("");
    setOtp("");
    setOrganizationId("");
    setResultOrgId("");
    setResultMessage("");
    setCopied(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setStep('email');
    setUserType('member');
    setOtp("");
    setOrganizationId("");
    setResultOrgId("");
    setResultMessage("");
    setCopied(false);
  };

  const handleSSOLogin = () => {
    login();
  };

  const handleGetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    if (mode === 'signin' && !organizationId) {
      toast.error("Please enter your Organization ID");
      return;
    }
    setIsLoading(true);
    try {
      await requestOTP({
        email,
        successTask: () => {
          setStep('otp');
          toast.success("OTP sent to your email");
        },
        errorTask: (error) => {
          toast.error(error || "Failed to send OTP");
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }
    setIsLoading(true);
    try {
      await signupRoot({
        email,
        otp,
        successTask: (data) => {
          setResultOrgId(data.organization_id || "");
          setResultMessage(data.message);
          setStep('result');
          toast.success("Organization created successfully");
        },
        conflictTask: (data) => {
          setResultOrgId(data.organization_id || "");
          setResultMessage(data.message);
          setStep('result');
          toast.info("You already have an organization");
        },
        errorTask: (error) => {
          toast.error(error || "Signup failed");
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }
    setIsLoading(true);
    const loginFn = userType === 'admin' ? loginWithOTP : loginUserWithOTP;
    try {
      await loginFn({
        email,
        otp,
        organizationId,
        successTask: () => {
          const returnUrl = sessionStorage.getItem("return_url");
          if (returnUrl && returnUrl !== '/') {
            sessionStorage.removeItem("return_url");
            router.push(returnUrl);
          } else {
            router.push('/home');
          }
        },
        errorTask: (error) => {
          toast.error(error || "Login failed");
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetrieveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be exactly 6 digits");
      return;
    }
    setIsLoading(true);
    try {
      await retrieveOrg({
        email,
        otp,
        successTask: (message) => {
          setResultMessage(message);
          setStep('result');
          toast.success("Organization ID sent to your email");
        },
        errorTask: (error) => {
          toast.error(error || "Failed to retrieve organization");
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyOrgId = async () => {
    try {
      await navigator.clipboard.writeText(resultOrgId);
      setCopied(true);
      toast.success("Organization ID copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy — please copy the ID manually");
    }
  };

  const modeConfig = {
    signin: { title: "Sign In", icon: LogIn },
    signup: { title: "Create Organization", icon: UserPlus },
    'retrieve-org': { title: "Retrieve Organization ID", icon: Search },
  };

  const currentModeConfig = mode !== 'default' ? modeConfig[mode] : null;

  return (
    <div className="font-sans flex items-center justify-center min-h-screen p-8 bg-gradient-to-b from-background to-secondary/20">
      <main className="flex flex-col gap-6 items-center w-full max-w-md animate-in fade-in duration-700">
        <div className="flex flex-col items-center">
          <Image
            className="dark:invert drop-shadow-xl"
            src="/logo.png"
            alt="Kernel Mind logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Kernel Mind
          </h1>
        </div>

        {mode === 'default' ? (
          <div className="flex gap-1 items-center flex-col w-full">
            <div className="w-full space-y-1.5">
              <Button
                data-testid="login-sso-button"
                onClick={handleSSOLogin}
                size="lg"
                className="cursor-pointer w-full group transition-all duration-300 hover:scale-[1.02]"
              >
                Enterprise Single Sign-On
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                For organizations using enterprise identity providers
              </p>
            </div>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-medium">Or</span>
              </div>
            </div>

            <div className="w-full space-y-1.5">
              <Button
                variant="outline"
                onClick={() => switchMode('signin')}
                size="lg"
                className="cursor-pointer w-full group transition-all duration-300 hover:scale-[1.02]"
              >
                <LogIn className="mr-2 w-4 h-4" />
                Sign In
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Sign in with your work email using a one-time password
              </p>
            </div>

            <button
              type="button"
              onClick={() => switchMode('signup')}
              className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer mt-2"
            >
              New here? Create your organization →
            </button>
          </div>
        ) : (
          <div className="w-full p-8 rounded-2xl border border-primary/10 bg-background/50 backdrop-blur-xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-500">
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFlow}
              className="mb-6 -ml-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowRight className="mr-2 w-4 h-4 rotate-180" />
              Back
            </Button>

            {currentModeConfig && (
              <div className="flex items-center gap-2 mb-6">
                <currentModeConfig.icon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">{currentModeConfig.title}</h2>
              </div>
            )}

            {step === 'email' && (
              <form onSubmit={handleGetOTP} className="space-y-4">
                {mode === 'signin' && (
                  <div className="flex rounded-lg border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setUserType('member')}
                      className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        userType === 'member'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Team Member
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType('admin')}
                      className={`flex-1 py-2 text-sm font-medium transition-colors cursor-pointer ${
                        userType === 'admin'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Admin
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 focus-visible:ring-primary/30"
                      required
                    />
                  </div>
                </div>

                {mode === 'signin' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="org-id">Organization ID</Label>
                      <button
                        type="button"
                        onClick={() => switchMode('retrieve-org')}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      >
                        Don&apos;t know your ID?
                      </button>
                    </div>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="org-id"
                        type="text"
                        placeholder="Enter your organization ID"
                        value={organizationId}
                        onChange={(e) => setOrganizationId(e.target.value)}
                        className="pl-10 h-11 focus-visible:ring-primary/30"
                        required
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 transition-all cursor-pointer"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send OTP
                </Button>
              </form>
            )}

            {step === 'otp' && (
              <form
                onSubmit={
                  mode === 'signup' ? handleSignup :
                  mode === 'signin' ? handleSignIn :
                  handleRetrieveOrg
                }
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground mb-4">
                  OTP sent to <span className="font-semibold text-foreground">{email}</span>
                </p>

                <div className="space-y-2">
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
                  {mode === 'signup' ? 'Create Organization' :
                   mode === 'signin' ? 'Sign In' :
                   'Retrieve Organization ID'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setOtp(""); setStep('email'); }}
                  className="w-full text-muted-foreground cursor-pointer"
                >
                  Didn&apos;t receive code? Try again
                </Button>
              </form>
            )}

            {step === 'result' && (
              <div className="space-y-5 animate-in fade-in duration-500">
                {mode === 'signup' && resultOrgId && (
                  <>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-5 h-5" />
                      <p className="text-sm font-medium">{resultMessage}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Your Organization ID</Label>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 rounded-lg bg-muted font-mono text-sm break-all select-all">
                          {resultOrgId}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyOrgId}
                          className="shrink-0 cursor-pointer"
                        >
                          {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Save this ID securely — you will need it to sign in.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setOrganizationId(resultOrgId);
                        switchMode('signin');
                      }}
                      className="w-full h-11 cursor-pointer"
                    >
                      Continue to Sign In
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </>
                )}

                {mode === 'retrieve-org' && (
                  <>
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Mail className="w-5 h-5" />
                      <p className="text-sm font-medium">{resultMessage}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Check your inbox for an email with your organization ID.
                    </p>
                    <Button
                      onClick={() => switchMode('signin')}
                      className="w-full h-11 cursor-pointer"
                    >
                      Back to Sign In
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
