"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginClient() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Access your team space or administration console.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium">Team login</p>
            <p className="text-sm text-muted-foreground">
              Team leaders authenticate with a Google account to enter the team
              dashboard.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <p className="text-sm font-medium">Admin and judge access</p>
            <p className="text-sm text-muted-foreground">
              Judges and organizers use Google OAuth for secure access.
            </p>
          </div>
          <div className="flex justify-start">
            <Button
              onClick={() =>
                signIn("google", {
                  callbackUrl: `${
                    typeof window !== "undefined" ? window.location.origin : ""
                  }/team/dashboard`,
                })
              }
            >
              Continue with Google
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
