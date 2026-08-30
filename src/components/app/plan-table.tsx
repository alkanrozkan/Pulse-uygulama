"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";
import type { PlanTier } from "@/lib/types/database";
import { cn } from "@/lib/utils";

/**
 * Billing UI. Checkout is not wired up yet — the button opens a note explaining
 * what will happen rather than silently doing nothing. Replace `startCheckout`
 * with a call to your Stripe Checkout session endpoint.
 */
export function PlanTable({ currentPlan }: { currentPlan: PlanTier }) {
  const [pendingPlan, setPendingPlan] = React.useState<PlanTier | null>(null);

  function startCheckout(plan: PlanTier) {
    // TODO: POST /api/billing/checkout -> Stripe Checkout session -> redirect.
    setPendingPlan(plan);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className={cn(
                "card flex flex-col p-6",
                plan.highlight && "border-accent/40 shadow-lift",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                {isCurrent ? (
                  <Badge tone="accent">Current</Badge>
                ) : plan.highlight ? (
                  <Badge tone="outline">Most picked</Badge>
                ) : null}
              </div>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-semibold tabular-nums">{plan.price}</span>
                <span className="text-sm text-muted">{plan.cadence}</span>
              </div>

              <p className="mt-3 text-sm text-muted">{plan.tagline}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {isCurrent ? (
                  <Button variant="secondary" className="w-full" disabled>
                    Your plan
                  </Button>
                ) : (
                  <Button
                    variant={plan.highlight ? "primary" : "secondary"}
                    className="w-full"
                    onClick={() => startCheckout(plan.id)}
                  >
                    {plan.id === "free" ? "Downgrade to Free" : `Switch to ${plan.name}`}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pendingPlan && (
        <div
          role="status"
          className="rounded-card border border-line bg-raised px-5 py-4 text-sm"
        >
          <p className="font-medium">Payments aren&rsquo;t connected yet.</p>
          <p className="mt-1 text-muted">
            This button is where Stripe Checkout opens. Wire it to a session endpoint and set{" "}
            <code className="font-mono text-xs">STRIPE_SECRET_KEY</code> — the plan gates in{" "}
            <code className="font-mono text-xs">src/lib/plans.ts</code> already enforce the limits.
          </p>
          <button
            type="button"
            onClick={() => setPendingPlan(null)}
            className="mt-3 text-xs text-accent underline-offset-4 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
