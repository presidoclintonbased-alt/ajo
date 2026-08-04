"use client";

import { motion } from "framer-motion";

const POINTS = [
  {
    n: "01",
    title: "One person always holds the pot",
    body: "In an informal circle, the organizer (or whoever's turn it is to collect) physically holds everyone's contribution until payout. If they vanish, get sick, or simply spend it, there's no recourse.",
  },
  {
    n: "02",
    title: "Trust doesn't scale past people you know",
    body: "Ajo circles work great among family, coworkers, a church group. They don't scale to strangers, even when strangers could benefit from pooling money together — there's no way to verify a stranger will actually pay their round.",
  },
  {
    n: "03",
    title: "No record if something goes wrong",
    body: "Contributions are tracked in a notebook, a WhatsApp group, or someone's memory. When a dispute happens, there's no independent record of who paid what, and when.",
  },
];

export function Problem() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6">
        <div className="max-w-xl">
          <p className="eyebrow">The problem</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">
            The tradition works. The trust model doesn&apos;t.
          </h2>
        </div>

        <div className="mt-14 flex flex-col">
          {POINTS.map((point, index) => (
            <motion.div
              key={point.n}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="grid grid-cols-[3.5rem_1fr] gap-6 border-t border-border py-8 first:border-t-0 sm:grid-cols-[5rem_1fr]"
            >
              <span className="font-display text-4xl text-border-strong sm:text-5xl">{point.n}</span>
              <div>
                <h3 className="text-lg font-medium text-foreground">{point.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{point.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
