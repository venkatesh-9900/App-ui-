"use client";

import Image from "next/image";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowRightIcon } from "lucide-react";
import { useEffect } from "react";

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const router = useRouter();

  const handleSSOLogin = () => {
    if (isAuthenticated) {
      console.log('user is authenticated, redirecting to home');
      router.push('/home');
    } else {
      console.log('user is not authenticated, logging in');
      login();
    }
  };

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <Image
          className="dark:invert"
          src="/logo.png"
          alt="Argus Intelligence logo"
          width={180}
          height={38}
          priority
        />
        <h1 className="text-2xl font-bold">Argus Intelligence</h1>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button 
            data-testid="login-sso-button"
            onClick={handleSSOLogin}
            size="lg"
            className="cursor-pointer w-full sm:w-auto"
            
          >
          Enterprise Single Sign-On<ArrowRight className="w-4 h-4" />
          </Button> 
        </div>
      </main>
      {/* <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer> */}
    </div>
  );
}
