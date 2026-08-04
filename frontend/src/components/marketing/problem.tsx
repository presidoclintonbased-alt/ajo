"use client";

import { motion } from "framer-motion";

const POINTS = [
  {
    title: "One person always holds the pot",
    body: "In an informal circle, the organizer (or whoever's turn it is to collect) physically holds everyone's contribution until payout. If they vanish, get sick, or simply spend it, there's no recourse.",
  },
  {
    title: "Trust doesn't scale past people you know",
    body: "Ajo circles work great among family, coworkers, a church group. They don't scale to strangers, even when strangers could benefit from pooling money together — there's no way to verify a stranger will actually pay their round.",
  },
  {
    title: "No record if something goes wrong",
    body: "Contributions are tracked in a notebook, a WhatsApp group, or someone's memory. When a dispute happens, there's no independent record of who paid what, and when.",
  },
];

export function Problem() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-xl">
          <p className="eyebrow">The problem</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            The tradition works. The trust model doesn&apos;t.
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {POINTS.map((point, index) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="card p-6"
            >
              <h3 className="text-base font-medium text-foreground">{point.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{point.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
