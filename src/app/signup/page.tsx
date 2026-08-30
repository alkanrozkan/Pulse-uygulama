import type { Metadata } from "next";
import { AuthForm } from "@/components/app/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <AuthForm mode="sign-up" />
    </div>
  );
}
