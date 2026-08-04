"use client";

import { Disclosure } from "@/components/ui";

const FAQS = [
  {
    q: "What happens if a member misses a contribution?",
    a: "Payout for that cycle still happens once the deadline passes, using whatever was actually collected — so one non-payer can't freeze everyone else's money. The missed contribution is recorded on-chain against that member as a strike, visible to the whole circle.",
  },
  {
    q: "Who decides the payout order?",
    a: "Join order. The first member to join a circle is paid first, the second is paid second, and so on. It's fixed the moment the circle fills, and anyone can verify it on-chain — there's no separate randomization step or admin decision to trust.",
  },
  {
    q: "Can the circle's creator take the pot early?",
    a: "No. The creator has no special withdrawal permission — they're just the first member. The contract releases each cycle's pot only to that cycle's designated recipient, and only once the cycle's contribution condition is met.",
  },
  {
    q: "What currency do contributions use?",
    a: "Circles default to Stellar's native asset (XLM), so joining doesn't require setting up a separate token trustline first. A circle can be created against any Stellar Asset Contract token, including stablecoins.",
  },
  {
    q: "Is this the same as a DeFi lending pool?",
    a: "No — no interest, no collateral, no liquidation risk. It's the same mechanic as an informal Ajo/Esusu/Chama circle: a fixed group, a fixed contribution, one payout per cycle, until everyone's had a turn.",
  },
  {
    q: "Is this live on mainnet?",
    a: "Not yet — Ajo runs on Stellar's public testnet today, with real contract logic and tests, while the model gets validated. Mainnet is the next step.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="max-w-xl">
          <p className="eyebrow">Questions</p>
          <h2 className="font-display mt-3 text-3xl tracking-tight sm:text-4xl">Common questions</h2>
        </div>

        <div className="mt-10 max-w-3xl">
          {FAQS.map((item) => (
            <Disclosure key={item.q} summary={item.q}>
              {item.a}
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}
