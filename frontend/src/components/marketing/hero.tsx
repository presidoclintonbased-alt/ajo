"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="dot-grid relative overflow-hidden border-b border-border">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-card px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-green" />
            <span className="eyebrow !text-foreground">Live on Stellar testnet</span>
          </span>

          <h1 className="font-display mt-8 text-5xl leading-[1.08] tracking-tight sm:text-7xl">
            Ajo, without
            <br />
            <span className="accent-text italic">trusting a person.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Ajo, Esusu, Chama, Tanda, Susu — every culture has a version of the rotating savings circle. Ajo keeps
            the tradition and removes the one risk it always carried: the organizer disappearing with the pot.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/circles"
              className="rounded-full bg-accent px-7 py-3 text-center text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
            >
              Start a circle &rarr;
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full px-7 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-card"
            >
              See how it works
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="mx-auto max-w-4xl px-4 pb-20 sm:px-6"
      >
        <OrbitStrip />
      </motion.div>
    </section>
  );
}

const CYCLE = [
  { label: "You", state: "paid" as const },
  { label: "2", state: "paid" as const },
  { label: "3", state: "next" as const },
  { label: "4", state: "waiting" as const },
  { label: "5", state: "waiting" as const },
];

function OrbitStrip() {
  return (
    <div className="card relative flex items-center justify-between overflow-hidden px-6 py-8 sm:px-10">
      <div className="ring-motif pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[160%] -translate-x-1/2 -translate-y-1/2 border-accent/15" />

      {CYCLE.map((member, index) => (
        <div key={member.label} className="relative z-10 flex flex-col items-center gap-2">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-medium sm:h-14 sm:w-14 ${
              member.state === "paid"
                ? "bg-accent text-accent-foreground"
                : member.state === "next"
                  ? "border-2 border-accent bg-card text-accent"
                  : "border border-border-strong bg-card text-muted"
            }`}
          >
            {member.label}
          </div>
          <span className="eyebrow !text-[10px] !text-muted">
            {member.state === "paid" ? "paid" : member.state === "next" ? "next" : `cycle ${index + 1}`}
          </span>
        </div>
      ))}
    </div>
  );
}
