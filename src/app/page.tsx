import Link from "next/link";
import { LandingHeader } from "@/components/landing/header";
import { TodayPreview } from "@/components/landing/preview";
import {
  Benefits,
  ClosingCta,
  Faq,
  HowItWorks,
  LandingFooter,
  Pricing,
} from "@/components/landing/sections";
import { buttonClasses } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader />

      {/* Hero: the promise, then the actual artefact the product produces. */}
      <section className="relative overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-16 sm:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
            <div>
              <p className="eyebrow mb-5">AI creator growth coach</p>

              <h1 className="font-display text-[42px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-6xl">
                Stop guessing
                <br />
                what to post.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
                Pulse learns what works for your account and tells you exactly what to create next.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link href="/signup" className={buttonClasses({ size: "lg" })}>
                  Analyze my content
                </Link>
                <a
                  href="#how"
                  className={buttonClasses({ variant: "secondary", size: "lg" })}
                >
                  See how it reads an account
                </a>
              </div>

              <p className="mt-5 font-mono text-xs text-muted">
                Free plan · 5 recommendations a month · no card
              </p>
            </div>

            <div className="lg:pl-4">
              <TodayPreview />
              <p className="mt-4 text-center font-mono text-[11px] text-muted lg:text-left">
                An actual recommendation, scored against that creator&rsquo;s own average.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />
      <Benefits />
      <Pricing />
      <Faq />
      <ClosingCta />
      <LandingFooter />
    </div>
  );
}
