import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonClasses } from "./button";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative overflow-hidden rounded-soft bg-raised", className)}
      aria-hidden
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full animate-sweep bg-gradient-to-r from-transparent via-ink/[0.06] to-transparent" />
    </div>
  );
}

export function EmptyState({
  title,
  body,
  actionLabel,
  actionHref,
  onAction,
  icon,
  className,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-line px-6 py-14 text-center",
        className,
      )}
    >
      {icon && <div className="mb-4 text-muted">{icon}</div>}
      <h3 className="font-display text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className={buttonClasses({ size: "sm", className: "mt-5" })}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && !actionHref && onAction && (
        <Button className="mt-5" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorNote({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-soft border border-neg/30 bg-neg/[0.06] px-4 py-3",
        className,
      )}
    >
      <p className="text-sm text-neg">{message}</p>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
