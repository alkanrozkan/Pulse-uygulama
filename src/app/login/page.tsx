import type { Metadata } from "next";
import { AuthForm } from "@/components/app/auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full">
        {searchParams.error === "link_expired" && (
          <p className="mx-auto mb-6 max-w-sm rounded-soft border border-neg/30 bg-neg/[0.06] px-4 py-3 text-sm text-neg">
            That confirmation link has expired. Sign in to request a new one.
          </p>
        )}
        <AuthForm mode="sign-in" next={searchParams.next} />
      </div>
    </div>
  );
}
