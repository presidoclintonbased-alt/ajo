"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Wallet, Eye } from "lucide-react";

const REASONS = [
  {
    icon: Zap,
    title: "Settlement in seconds, fees in fractions of a cent",
    body: "A weekly contribution shouldn't cost more in gas than the amount being saved. Stellar's fees make micro-contributions actually viable, not just technically possible.",
  },
  {
    icon: ShieldCheck,
    title: "The contract holds the pot, not Ajo",
    body: "Every contribution and payout is a direct transfer between a member's wallet and the Soroban contract. Ajo the app never touches the money — it can't, by construction.",
  },
  {
    icon: Wallet,
    title: "No trustline juggling for the common case",
    body: "Circles run on Stellar's native asset by default, so joining a circle doesn't require setting up a new token trustline first — the same wallet you already fund with XLM just works.",
  },
  {
    icon: Eye,
    title: "A public, permissionless payout history",
    body: "Every contribution and every payout is a Stellar event log entry — anyone can independently verify a circle actually paid out on schedule, with no dashboard to trust.",
  },
];

export function WhyStellar() {
  return (
    <section id="why-stellar" className="border-t border-border">
      <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
        <div className="max-w-xl">
          <p className="eyebrow">Why Stellar</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">Built for small, frequent payments</h2>
        </div>

        <div className="mt-14 flex flex-col gap-10">
          {REASONS.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
                className="flex items-start gap-5"
              >
                <motion.span
                  whileHover={{ scale: 1.12, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 12 }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-gold/10 text-accent-gold"
                >
                  <Icon size={19} />
                </motion.span>
                <div>
                  <h3 className="text-base font-medium text-foreground">{reason.title}</h3>
                  <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted">{reason.body}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
