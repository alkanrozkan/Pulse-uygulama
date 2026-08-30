import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* How it works — a genuine three-step sequence, so it is numbered.            */
/* -------------------------------------------------------------------------- */

const STEPS = [
  {
    title: "Log what you've already posted",
    body: "Views, engagement, hook, format, length, time of day. Five videos is enough to start; eight makes the patterns hold.",
  },
  {
    title: "Pulse reads your patterns",
    body: "It groups your videos by hook style, topic, length band, format and posting window, then indexes each group against your own average — not an industry benchmark.",
  },
  {
    title: "You get three videos to make",
    body: "Each one names the pattern it's built on. Mark what you posted and how it did, and the next set corrects itself.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5">
        <p className="eyebrow mb-3">How it works</p>
        <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          Three steps, and the third one repeats forever.
        </h2>

        <ol className="mt-14 grid gap-10 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative">
              <span className="font-mono text-sm text-accent">0{i + 1}</span>
              <div className="mt-3 h-px w-full bg-line" />
              <h3 className="mt-5 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Benefits                                                                    */
/* -------------------------------------------------------------------------- */

const BENEFITS = [
  {
    title: "Advice that cites your numbers",
    body: "Every recommendation says which of your videos it learned from. If Pulse can't point to evidence, it doesn't suggest it.",
  },
  {
    title: "The parts you can't see from the app",
    body: "Your analytics show what happened. Content DNA shows why: which hook style, which length, which posting window is carrying the account.",
  },
  {
    title: "It gets less wrong over time",
    body: "Mark a recommendation as successful or underperformed and that outcome goes into the next generation's calibration.",
  },
  {
    title: "Trends you're early enough for",
    body: "Viral Radar scores formats by how fast they're accelerating and how long the window has been open, then rewrites each as an angle for your niche.",
  },
];

export function Benefits() {
  return (
    <section id="benefits" className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5">
        <p className="eyebrow mb-3">Why it works</p>
        <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          Most content tools tell everyone the same thing. This one only knows your account.
        </h2>

        <div className="mt-14 grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="card p-6">
              <h3 className="font-display text-base font-semibold">{benefit.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted">{benefit.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Pricing                                                                     */
/* -------------------------------------------------------------------------- */

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5">
        <p className="eyebrow mb-3">Pricing</p>
        <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          Start free. Upgrade when the ideas start earning their keep.
        </h2>

        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn("card flex flex-col p-6", plan.highlight && "border-accent/40 shadow-lift")}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
                {plan.highlight && <Badge tone="accent">Most picked</Badge>}
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

              <Link
                href="/signup"
                className={buttonClasses({
                  variant: plan.highlight ? "primary" : "secondary",
                  className: "mt-6 w-full",
                })}
              >
                {plan.id === "free" ? "Start free" : `Choose ${plan.name}`}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ — native disclosure, so it works before JavaScript loads.               */
/* -------------------------------------------------------------------------- */

const FAQS = [
  {
    q: "Does Pulse connect to my TikTok or Instagram account?",
    a: "Not yet. You enter each video's numbers yourself, which takes about twenty seconds per post. Direct API access is on the roadmap, but manual entry means you can log videos from any account, including ones you don't own the login for.",
  },
  {
    q: "How many videos before the recommendations are any good?",
    a: "Five gets you started. Around eight is where the patterns stop being directional and start being reliable — Pulse tells you which is which, and greys out any group built on a single video.",
  },
  {
    q: "What if I'm just starting out and have no videos?",
    a: "Pulse will still generate ideas from your niche and audience, but it says so, and it keeps the predicted scores near the middle of the range instead of pretending to confidence it doesn't have.",
  },
  {
    q: "What is the predicted performance score?",
    a: "A 0–100 reading of how likely an idea is to beat your own average views. 50 means about average. It is a confidence estimate, not a forecast, and it recalibrates as you report how ideas actually did.",
  },
  {
    q: "Can I cancel?",
    a: "Any time, and your data stays exportable. The Free plan keeps working after you downgrade.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-3xl px-5">
        <p className="eyebrow mb-3">FAQ</p>
        <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
          Questions worth asking first.
        </h2>

        <div className="mt-12 divide-y divide-line border-y border-line">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-base font-medium">
                {faq.q}
                <span
                  aria-hidden
                  className="shrink-0 font-mono text-lg text-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Closing CTA + footer                                                        */
/* -------------------------------------------------------------------------- */

export function ClosingCta() {
  return (
    <section className="border-t border-line py-20 sm:py-28">
      <div className="mx-auto w-full max-w-3xl px-5 text-center">
        <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
          You already know what worked. Pulse just reads it back to you.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm text-muted">
          Log five videos and see whether the patterns it finds match your instinct.
        </p>
        <Link href="/signup" className={buttonClasses({ size: "lg", className: "mt-8" })}>
          Analyze my content
        </Link>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-muted">
        <p className="font-mono text-xs">Pulse — AI Creator Growth Coach</p>
        <div className="flex gap-6">
          <Link href="/login" className="transition-colors hover:text-ink">
            Sign in
          </Link>
          <Link href="/signup" className="transition-colors hover:text-ink">
            Get started
          </Link>
        </div>
      </div>
    </footer>
  );
}
