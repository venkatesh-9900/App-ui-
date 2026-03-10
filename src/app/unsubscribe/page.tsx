import { Suspense } from "react";
import UnsubscribeContent from "@/components/unsubscribe/unsubscribe-content";

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-10">Loading...</div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}