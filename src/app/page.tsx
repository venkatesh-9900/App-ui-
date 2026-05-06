"use client"
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Mail, KeyRound, ArrowRight, UserPlus, Building2, Copy, CheckCircle2, Search, LogIn } from "lucide-react";

type AuthMode = 'default' | 'signup' | 'login' | 'user-login' | 'retrieve-org';
type AuthStep = 'email' | 'otp' | 'result';

export default function LandingPage() {
  const { isAuthenticated, isLoading: globalLoading, login, requestOTP, loginWithOTP, loginUserWithOTP, signupRoot, retrieveOrg } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>('default');
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resultOrgId, setResultOrgId] = useState("");
  const [resultMessage, setResultMessage] = useState("");
  const [copied, setCopied] = useState(false);

  if (globalLoading || isAuthenticated) {
    return null;
  }

  const resetFlow = () => {
    setMode('default');
    setStep('email');
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
    setOtp("");
    setOrganizationId("");
    setResultOrgId("");
    setResultMessage("");
    setCopied(false);
  };

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
    if ((mode === 'login' || mode === 'user-login') && !organizationId) {
      toast.error("Please enter your Organization ID");
      return;
    }
    setIsLoading(true);
    await requestOTP({
      email,
      successTask: () => {
        setIsLoading(false);
        setStep('otp');
        toast.success("OTP sent to your email");
      },
      errorTask: (error) => {
        setIsLoading(false);
        toast.error(error || "Failed to send OTP");
      }
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    setIsLoading(true);
    await signupRoot({
      email,
      otp,
      successTask: (data) => {
        setIsLoading(false);
        setResultOrgId(data.organization_id || "");
        setResultMessage(data.message);
        setStep('result');
        toast.success("Root user created successfully");
      },
      conflictTask: (data) => {
        setIsLoading(false);
        setResultOrgId(data.organization_id || "");
        setResultMessage(data.message);
        setStep('result');
        toast.info("You are already signed up as a root user");
      },
      errorTask: (error) => {
        setIsLoading(false);
        toast.error(error || "Signup failed");
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
      organizationId,
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
        toast.error(error || "Login failed");
      }
    });
  };

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    setIsLoading(true);
    await loginUserWithOTP({
      email,
      otp,
      organizationId,
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
        toast.error(error || "Login failed");
      }
    });
  };

  const handleRetrieveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    setIsLoading(true);
    await retrieveOrg({
      email,
      otp,
      successTask: (message) => {
        setIsLoading(false);
        setResultMessage(message);
        setStep('result');
        toast.success("Organization ID sent to your email");
      },
      errorTask: (error) => {
        setIsLoading(false);
        toast.error(error || "Failed to retrieve organization");
      }
    });
  };

  const copyOrgId = () => {
    navigator.clipboard.writeText(resultOrgId);
    setCopied(true);
    toast.success("Organization ID copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const modeConfig = {
    signup: { title: "Root User Signup", icon: UserPlus },
    login: { title: "Root User Login", icon: KeyRound },
    'user-login': { title: "User Login", icon: LogIn },
    'retrieve-org': { title: "Retrieve Organization ID", icon: Search },
  };

  return (
    <div className="font-sans flex items-center justify-center min-h-screen p-8 bg-gradient-to-b from-background to-secondary/20">
      <main className="flex flex-col gap-8 items-center w-full max-w-md animate-in fade-in duration-700">
        <div className="flex flex-col items-center gap-4 mb-4">
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
              onClick={() => switchMode('user-login')}
              size="lg"
              className="cursor-pointer w-full border-primary/20 hover:bg-primary/5 transition-all duration-300"
            >
              <LogIn className="mr-2 w-4 h-4" />
              User Login
            </Button>

            <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => switchMode('login')}
                size="lg"
                className="cursor-pointer flex-1 border-primary/20 hover:bg-primary/5 transition-all duration-300"
              >
                <KeyRound className="mr-2 w-4 h-4" />
                Root Login
              </Button>
              <Button
                variant="outline"
                onClick={() => switchMode('signup')}
                size="lg"
                className="cursor-pointer flex-1 border-primary/20 hover:bg-primary/5 transition-all duration-300"
              >
                <UserPlus className="mr-2 w-4 h-4" />
                Root Signup
              </Button>
            </div>
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

            <div className="flex items-center gap-2 mb-6">
              {(() => {
                const Icon = modeConfig[mode as keyof typeof modeConfig].icon;
                return <Icon className="w-5 h-5 text-primary" />;
              })()}
              <h2 className="text-xl font-semibold">{modeConfig[mode as keyof typeof modeConfig].title}</h2>
            </div>

            {/* Step 1: Email input (+ org ID for login mode) */}
            {step === 'email' && (
              <form onSubmit={handleGetOTP} className="space-y-4">
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

                {(mode === 'login' || mode === 'user-login') && (
                  <div className="space-y-2">
                    <Label htmlFor="org-id">Organization ID</Label>
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
                  {(mode === 'login' || mode === 'user-login') ? 'Send OTP' : 'Get OTP'}
                </Button>

                {(mode === 'login' || mode === 'user-login') && (
                  <button
                    type="button"
                    onClick={() => switchMode('retrieve-org')}
                    className="w-full text-xs text-muted-foreground hover:text-primary transition-colors py-1 cursor-pointer"
                  >
                    Forgot Organization ID?
                  </button>
                )}
              </form>
            )}

            {/* Step 2: OTP input */}
            {step === 'otp' && (
              <form
                onSubmit={
                  mode === 'signup' ? handleSignup :
                  mode === 'login' ? handleRootLogin :
                  mode === 'user-login' ? handleUserLogin :
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
                  {mode === 'signup' ? 'Create Account' :
                   mode === 'login' ? 'Root Login' :
                   mode === 'user-login' ? 'Login' :
                   'Retrieve Organization ID'}
                </Button>

                <button
                  type="button"
                  onClick={() => { setOtp(""); setStep('email'); }}
                  className="w-full text-xs text-muted-foreground hover:text-primary transition-colors py-2 cursor-pointer"
                >
                  Didn&apos;t receive code? Try again
                </button>
              </form>
            )}

            {/* Step 3: Result */}
            {step === 'result' && (
              <div className="space-y-5 animate-in fade-in duration-500">
                {/* Signup or conflict result — show org ID */}
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
                        Save this ID securely. You will need it to log in.
                      </p>
                    </div>
                    <Button
                      onClick={() => {
                        setOrganizationId(resultOrgId);
                        switchMode('login');
                      }}
                      className="w-full h-11 cursor-pointer"
                    >
                      Continue to Login
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </>
                )}

                {/* Retrieve-org result — check email message */}
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
                      onClick={() => switchMode('login')}
                      className="w-full h-11 cursor-pointer"
                    >
                      Back to Login
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
