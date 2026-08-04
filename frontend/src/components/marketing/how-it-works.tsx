"use client";

import { motion } from "framer-motion";

const STEPS = [
  {
    step: "01",
    title: "Start or join a circle",
    body: "Set a contribution amount, a cycle length (weekly, say), and how many members. Or join one someone else started. Join order becomes payout order — transparent, no separate lottery to trust.",
  },
  {
    step: "02",
    title: "Contribute every cycle",
    body: "Once the circle fills, everyone pays their fixed contribution into the contract each cycle. Your wallet signs the payment directly — Ajo never takes custody of your keys.",
  },
  {
    step: "03",
    title: "One member is paid, on schedule",
    body: "As soon as everyone's paid (or the cycle deadline passes), the contract releases the full pot to that cycle's member automatically. No organizer has to collect or distribute anything by hand.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="max-w-xl">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Three steps, every cycle</h2>
        <p className="mt-4 text-muted">The same rhythm as an informal Ajo circle — just held by code instead of a person.</p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {STEPS.map((item, index) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card p-6 sm:p-8"
          >
            <span className="font-mono text-4xl font-semibold text-border-strong">{item.step}</span>
            <h3 className="mt-4 text-lg font-medium text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
