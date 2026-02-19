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

  useEffect(() => {
    if (!errorMessage || toastShownRef.current || status === "authenticated") {
      return;
    }
    toast.error(errorMessage);
    toastShownRef.current = true;
  }, [errorMessage, status]);

  return (
    <main
      className="relative min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('/login.jpg')",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 flex min-h-screen items-center px-6">
        {/* LEFT aligned login card */}
        <Card className="w-full max-w-md border-border bg-card/95 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-3">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              Sign in
            </CardTitle>

            <CardDescription className="text-muted-foreground">
              Access the hackathon platform using your Google account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-6 rounded-2xl border border-border bg-background p-6">
              <div className="space-y-1">
                <p className="text-sm font-semibold tracking-wide">
                  Continue with Google
                </p>
                <p className="text-sm text-muted-foreground">
                  Your role is automatically detected after authentication.
                </p>
              </div>

              {errorMessage && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                  {errorMessage}
                </div>
              )}

              <Button
                size="lg"
                className="w-full rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
                onClick={() => signIn("google")}
              >
                Sign in with Google
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Only authorized emails can access the platform
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
