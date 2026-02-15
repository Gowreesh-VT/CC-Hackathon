"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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
  // Default role = Team (as agreed)
  const [selectedRole, setSelectedRole] = useState<Role>("team");

  const roleContent = {
    team: {
      title: "Team Login",
      description:
        "Team leaders sign in using Google. Each team is mapped to a unique Team ID after authentication.",
      buttonText: "Continue as Team",
    },
    judge: {
      title: "Judge Login",
      description:
        "Judges authenticate using Google OAuth to review team submissions and provide scores.",
      buttonText: "Continue as Judge",
    },
    admin: {
      title: "Admin Login",
      description:
        "Organizers and administrators use Google OAuth to manage teams, rounds, and event flow.",
      buttonText: "Continue as Admin",
    },
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold">
            Sign in
          </CardTitle>

          <CardDescription className="text-center">
            Select your role to access the hackathon platform.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Role Selector */}
          <div className="grid grid-cols-3 gap-3">
            {(["team", "judge", "admin"] as Role[]).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`rounded-lg border p-4 text-sm font-medium transition
                  ${
                    selectedRole === role
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                  }`}
              >
                {/* 
                  Optional: Role icon/image placeholder
                  You can add an <img /> or icon here later if needed 
                */}
                <div className="flex items-center justify-center gap-2">
                  <img
                    src={`/login_icons/${role}.svg`}
                    alt=""
                    className="h-5 w-5 invert opacity-80"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                  <p className="capitalize">{role}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Selected Role Content */}
          <div className="rounded-xl border p-6 space-y-3">
            {/* 
              Optional: Large image / illustration placeholder
              You can add an image here later based on selected role 
            */}
            <p className="text-base font-semibold">
              {roleContent[selectedRole].title}
            </p>
            <p className="text-sm text-muted-foreground">
              {roleContent[selectedRole].description}
            </p>

            <Button
              size="lg"
              className="mt-2 transition-colors duration-200 hover:bg-blue-600 hover:text-white"
              onClick={() => signIn("google")}
            >
              {roleContent[selectedRole].buttonText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
