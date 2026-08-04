"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="dot-grid relative overflow-hidden border-b border-border">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="eyebrow">Rotating savings, on-chain</p>

            <h1 className="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Ajo, without
              <br />
              <span className="accent-text">trusting a person.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Ajo, Esusu, Chama, Tanda, Susu — every culture has a version of the rotating savings circle. Everyone
              contributes each round, one member takes the pot, rotate until everyone&apos;s had a turn. Ajo keeps the
              tradition and removes the one risk it always carried: the organizer disappearing with the pot.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/circles"
                className="rounded-full bg-accent px-6 py-3 text-center text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Start a circle &rarr;
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full border border-border-strong px-6 py-3 text-center text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
              >
                See how it works
              </a>
            </div>

            <p className="mt-6 eyebrow !text-muted">No custodian &middot; no organizer risk &middot; Stellar testnet</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative mx-auto aspect-square w-full max-w-sm"
          >
            <CircleDiagram />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CircleDiagram() {
  const members = [
    { angle: -90, label: "You", paid: true },
    { angle: 0, label: "2", paid: true },
    { angle: 90, label: "3", paid: false },
    { angle: 180, label: "4", paid: false },
  ];
  const radius = 42;

  return (
    <div className="relative h-full w-full">
      <div className="ring-motif absolute inset-0" />
      <div className="ring-motif absolute inset-[15%] border-accent/30" />
      <div className="card absolute inset-[38%] flex items-center justify-center text-center">
        <div>
          <p className="text-xs text-muted">Cycle</p>
          <p className="text-lg font-semibold accent-text">2 / 4</p>
        </div>
      </div>
      {members.map((m) => {
        const rad = (m.angle * Math.PI) / 180;
        const x = 50 + radius * Math.cos(rad);
        const y = 50 + radius * Math.sin(rad);
        return (
          <div
            key={m.label}
            className={`absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-medium ${
              m.paid ? "bg-accent text-accent-foreground" : "border border-border-strong bg-card text-muted"
            }`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {m.label}
          </div>
        );
      })}
    </div>
  );
}
