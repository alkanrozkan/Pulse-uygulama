import type { PlanTier } from "@/lib/types/database";

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  price: string;
  cadence: string;
  tagline: string;
  features: string[];
  /** Recommendations a user may generate per calendar month. null = unlimited. */
  monthlyRecommendations: number | null;
  contentDna: boolean;
  viralRadar: boolean;
  highlight?: boolean;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    tagline: "Enough to see whether Pulse reads your account correctly.",
    features: [
      "5 AI recommendations per month",
      "Basic analytics",
      "Manual video logging",
      "One creator account",
    ],
    monthlyRecommendations: 5,
    contentDna: false,
    viralRadar: false,
  },
  {
    id: "creator_pro",
    name: "Creator Pro",
    price: "$14.99",
    cadence: "per month",
    tagline: "For creators posting on a schedule who need a call every day.",
    features: [
      "Daily recommendations",
      "Full Content DNA breakdown",
      "Viral Radar with personalised angles",
      "Unlimited video analysis",
      "Recommendation feedback loop",
    ],
    monthlyRecommendations: null,
    contentDna: true,
    viralRadar: true,
    highlight: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: "$199",
    cadence: "per month",
    tagline: "For teams running content for several creators at once.",
    features: [
      "Everything in Creator Pro",
      "Multiple creator accounts",
      "Team dashboard",
      "Creator comparison view",
      "Priority support",
    ],
    monthlyRecommendations: null,
    contentDna: true,
    viralRadar: true,
  },
];

export function getPlan(id: PlanTier): PlanDefinition {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}
