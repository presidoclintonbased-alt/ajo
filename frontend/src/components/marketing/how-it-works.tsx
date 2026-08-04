"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    title: "Start or join a circle",
    body: "Set a contribution amount, a cycle length (weekly, say), and how many members. Or join one someone else started. Join order becomes payout order — transparent, no separate lottery to trust.",
  },
  {
    title: "Contribute every cycle",
    body: "Once the circle fills, everyone pays their fixed contribution into the contract each cycle. Your wallet signs the payment directly — Ajo never takes custody of your keys.",
  },
  {
    title: "One member is paid, on schedule",
    body: "As soon as everyone's paid (or the cycle deadline passes), the contract releases the full pot to that cycle's member automatically. No organizer has to collect or distribute anything by hand.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="max-w-xl">
        <p className="eyebrow">How it works</p>
        <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">Three steps, every cycle</h2>
        <p className="mt-4 text-muted">The same rhythm as an informal Ajo circle — just held by code instead of a person.</p>
      </div>

      <div className="relative mt-16">
        <div className="absolute left-5 top-5 hidden h-[calc(100%-2.5rem)] w-px bg-border-strong md:block" />
        <div className="absolute left-0 top-5 hidden h-px w-full bg-border-strong md:block" />

        <div className="flex flex-col gap-10 md:flex-row md:gap-6">
          {STEPS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative flex-1"
            >
              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
                {index + 1}
              </div>
              <h3 className="mt-5 text-lg font-medium text-foreground">{item.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
