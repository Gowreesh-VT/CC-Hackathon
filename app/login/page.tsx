"use client";

import { useEffect, useMemo, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Role = "team" | "judge" | "admin";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toastShownRef = useRef(false);

  const errorMessage = useMemo(() => {
    const error = searchParams.get("error");
    if (error === "user-not-found") {
      return "No account found for this email. Contact an admin.";
    }
    return null;
  }, [searchParams]);

  // Redirect authenticated users based on role
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role as Role;
      const redirectMap: Record<Role, string> = {
        admin: "/admin/judges",
        judge: "/judge",
        team: "/team",
      };
      router.replace(redirectMap[role]);
    }
  }, [status, session, router]);

  // Show error toast only if not authenticated and there's an error
  useEffect(() => {
    if (!errorMessage || toastShownRef.current || status === "authenticated") {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      toast.error(errorMessage);
      toastShownRef.current = true;
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [errorMessage, status]);

  // Show logout success toast
  useEffect(() => {
    if (searchParams.get("action") === "logout" && !toastShownRef.current) {
      // Use a small timeout to ensure UI is ready
      const timeoutId = window.setTimeout(() => {
        toast.success("Successfully logged out");
        toastShownRef.current = true;
        // Optional: Remove the query param to prevent toast on refresh (requires router.replace)
        router.replace("/login"); 
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [searchParams, router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Sign in
          </CardTitle>

          <CardDescription className="text-center">
            Use your Google account to access the hackathon platform.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border p-6 space-y-3">
            <p className="text-base font-semibold">Continue with Google</p>
            <p className="text-sm text-muted-foreground">
              Your role is detected automatically after authentication.
            </p>
            {errorMessage ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errorMessage}
              </p>
            ) : null}

            <Button
              size="lg"
              className="mt-2 w-full transition-colors duration-200 hover:bg-blue-600 hover:text-white"
              onClick={() => signIn("google")}
            >
              Sign in with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
