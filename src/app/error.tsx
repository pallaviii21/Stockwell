"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected errors safely
    console.error("Stockwell App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center mb-4 shadow-sm">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-bold text-[#30251F] tracking-tight">Something went wrong</h2>
      <p className="text-sm text-[#918477] max-w-md mt-2 mb-6">
        An unexpected error occurred while rendering this module. You can try reloading or resetting
        the view.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} variant="primary" size="md">
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button onClick={() => window.location.href = "/"} variant="secondary" size="md">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
