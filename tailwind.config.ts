import type { Config } from "tailwindcss";

const channel = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: channel("--paper"),
        surface: channel("--surface"),
        raised: channel("--raised"),
        line: channel("--line"),
        ink: channel("--ink"),
        muted: channel("--muted"),
        accent: channel("--accent"),
        "accent-ink": channel("--accent-ink"),
        pos: channel("--pos"),
        neg: channel("--neg"),
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        eyebrow: ["0.6875rem", { lineHeight: "1", letterSpacing: "0.14em" }],
      },
      borderRadius: {
        card: "14px",
        soft: "10px",
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -16px rgb(0 0 0 / 0.18)",
        lift: "0 2px 4px rgb(0 0 0 / 0.05), 0 18px 40px -22px rgb(0 0 0 / 0.35)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        sweep: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        sweep: "sweep 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
