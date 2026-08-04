"use client";

import { motion } from "framer-motion";

const REASONS = [
  {
    title: "Settlement in seconds, fees in fractions of a cent",
    body: "A weekly contribution shouldn't cost more in gas than the amount being saved. Stellar's fees make micro-contributions actually viable, not just technically possible.",
  },
  {
    title: "The contract holds the pot, not Ajo",
    body: "Every contribution and payout is a direct transfer between a member's wallet and the Soroban contract. Ajo the app never touches the money — it can't, by construction.",
  },
  {
    title: "No trustline juggling for the common case",
    body: "Circles run on Stellar's native asset by default, so joining a circle doesn't require setting up a new token trustline first — the same wallet you already fund with XLM just works.",
  },
  {
    title: "A public, permissionless payout history",
    body: "Every contribution and every payout is a Stellar event log entry — anyone can independently verify a circle actually paid out on schedule, with no dashboard to trust.",
  },
];

export function WhyStellar() {
  return (
    <section id="why-stellar" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-xl">
          <p className="eyebrow">Why Stellar</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Built for small, frequent payments</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 divide-y divide-border border-t border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {REASONS.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: (index % 2) * 0.08 }}
              className="p-6 sm:p-8"
            >
              <h3 className="text-base font-medium text-foreground">{reason.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{reason.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
