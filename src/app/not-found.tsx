import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Logo } from "@/components/app/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo className="mb-8" />
      <p className="eyebrow mb-3">404</p>
      <h1 className="font-display text-2xl font-bold">That page isn&rsquo;t here</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The link may be out of date. Your dashboard is where everything lives.
      </p>
      <Link href="/dashboard" className={buttonClasses({ className: "mt-6" })}>
        Go to dashboard
      </Link>
    </div>
  );
}
