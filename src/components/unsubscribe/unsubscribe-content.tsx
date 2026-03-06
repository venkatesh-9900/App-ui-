"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts";
import { unsubscribeSchedule } from "@/hooks/schedule-service";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog";
import { ProtectedRoute } from "@/components/protected-route";  

import { Card } from "@/components/ui/card";
import { Loader2, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function UnsubscribeContent() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, login, isLoading: authLoading, userInfo } = useAuth();

  const [scheduleId, setScheduleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showDialog, setShowDialog] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alreadyUnsubscribed, setAlreadyUnsubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Read query param and authenticate
  useEffect(() => {
  const scheduleIdParam = searchParams.get("scheduleId");
  sessionStorage.setItem("return_url", `/unsubscribe?scheduleId=${scheduleIdParam}`)
  if (scheduleIdParam) {
    setScheduleId(parseInt(scheduleIdParam, 10));
    setShowDialog(true);
  }
}, [searchParams]);

  const handleUnsubscribe = async () => {

    if (!scheduleId) {
      toast.error("Invalid schedule ID");
      return;
    }

    const email = userInfo?.email || "";

    if (!email) {
      toast.error("User email not found");
      return;
    }

    setIsLoading(true);

    try {

      await unsubscribeSchedule({
        id: scheduleId,
        successTask: (data) => {
          sessionStorage.removeItem("return_url");
          // If backend says already unsubscribed
          if (data?.error) {

            setErrorMessage(data.error);
            setAlreadyUnsubscribed(true);
            setShowDialog(false);
            setIsLoading(false);
            return;
          }

          // Success
          setShowDialog(false);
          setShowSuccess(true);

          setTimeout(() => {
            router.push("/home");
          }, 3000);
        },

        failureTask: () => {
          toast.error("Failed to unsubscribe");
          setIsLoading(false);
        },

        errorTask: () => {
          toast.error("Unexpected error occurred");
          setIsLoading(false);
        }

      });

    } catch (err) {
      toast.error("Unexpected error occurred");
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    router.push("/home");
  };

  // ---------------------------
  // Already Unsubscribed Screen
  // ---------------------------
  if (alreadyUnsubscribed) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted p-4">

        <Card className="w-[420px] p-8 text-center space-y-6">

          <div className="flex justify-center">
            <div className="bg-yellow-100 p-4 rounded-full">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-yellow-700">
            Already Unsubscribed
          </h2>

          <button
            onClick={() => router.push("/home")}
            className="text-sm text-blue-600 hover:underline"
          >
            Go to Home
          </button>

        </Card>

      </div>
    );
  }

  // ---------------------------
  // Success Screen
  // ---------------------------
  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted p-4">

        <Card className="w-[420px] p-8 text-center space-y-6">

          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-green-700">
            Unsubscribed Successfully
          </h2>

          <p className="text-muted-foreground">
            You have been unsubscribed from all watchers and schedulers.
          </p>

          <p className="text-sm text-muted-foreground">
            Redirecting to home page...
          </p>

        </Card>

      </div>
    );
  }

  // ---------------------------
  // Confirmation Dialog
  // ---------------------------
  return (
  <ProtectedRoute>
    <AlertDialog open={showDialog}>

      <AlertDialogContent>

        <AlertDialogHeader>

          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Unsubscribe
          </AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to unsubscribe from all watchers and schedulers?
          </AlertDialogDescription>

        </AlertDialogHeader>

        <AlertDialogFooter>

          <AlertDialogCancel onClick={handleCancel}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={handleUnsubscribe}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Unsubscribing...
              </>
            ) : (
              "Unsubscribe"
            )}
          </AlertDialogAction>

        </AlertDialogFooter>

      </AlertDialogContent>

    </AlertDialog>
  </ProtectedRoute>
);
}