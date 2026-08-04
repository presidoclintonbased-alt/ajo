"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Cta() {
  return (
    <section className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="eyebrow !text-accent-gold">Get started</p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Free while Ajo is on testnet
          </h2>
          <p className="mt-4 max-w-xl text-background/60">
            Connect a Stellar wallet, fund it with testnet XLM, and start or join a circle — no signup, no account,
            no email.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/circles"
              className="rounded-full bg-background px-6 py-3 text-center text-sm font-medium text-foreground hover:opacity-85"
            >
              Launch the app
            </Link>
            <a
              href="https://laboratory.stellar.org/#account-creator?network=test"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-background/30 px-6 py-3 text-center text-sm font-medium text-background hover:bg-background/10"
            >
              Fund a testnet wallet
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
