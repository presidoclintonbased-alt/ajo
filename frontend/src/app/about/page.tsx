import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "About",
  description: "Why Ajo exists, and what changes when a contract holds the pot instead of a person.",
};

const COMPARISON = [
  { row: "Who holds the pot", informal: "The organizer, physically or in a bank account", ajo: "A Soroban smart contract" },
  { row: "What happens if someone vanishes", informal: "Everyone still owed a payout loses their contribution", ajo: "Payout still happens from whatever was actually collected" },
  { row: "Payout order", informal: "Agreed verbally, enforced by trust", ajo: "Fixed by join order, enforced by the contract" },
  { row: "Record of who paid what", informal: "A notebook, a group chat, someone's memory", ajo: "An on-chain event log anyone can independently check" },
  { row: "Who it can include", informal: "People who already trust each other", ajo: "Anyone with a wallet — the contract is the trust" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="dot-grid border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <p className="eyebrow">About Ajo</p>
            <h1 className="font-display mt-3 max-w-2xl text-4xl tracking-tight sm:text-5xl">
              The tradition already works. We just moved who holds the pot.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Ajo, Esusu, Chama, Tanda, Susu, committee, kameti — the rotating savings circle exists, under a
              different name, on every continent, because it works. Ajo the project doesn&apos;t reinvent it. It
              gives the same mechanic a custodian that can&apos;t vanish, get sick, or spend what isn&apos;t
              theirs.
            </p>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="max-w-xl">
              <p className="eyebrow">What changes</p>
              <h2 className="font-display mt-3 text-3xl tracking-tight">Same circle, different custodian</h2>
            </div>

            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border-strong">
                    <th className="py-3 pr-4 font-medium text-muted"> </th>
                    <th className="py-3 pr-4 font-medium text-muted">Informal circle</th>
                    <th className="py-3 font-medium accent-text">Ajo</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.row} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{row.row}</td>
                      <td className="py-3 pr-4 text-muted">{row.informal}</td>
                      <td className="py-3 text-foreground">{row.ajo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="max-w-xl">
              <p className="eyebrow">Where this is today</p>
              <h2 className="font-display mt-3 text-3xl tracking-tight">Honest status</h2>
            </div>
            <div className="mt-8 max-w-2xl space-y-4 text-sm leading-relaxed text-muted">
              <p>
                Ajo runs on Stellar&apos;s public testnet today, not mainnet — free to use while that&apos;s true.
                The contract is real and tested; the frontend talks to it directly, with no backend in between.
              </p>
              <p>
                Circles currently settle in native XLM. Stablecoin-denominated circles (any Stellar Asset Contract
                token) and a mainnet deployment are next. See{" "}
                <Link href="https://github.com/presidoclintonbased-alt/ajo" className="accent-text hover:underline">
                  the README
                </Link>{" "}
                for the full roadmap.
              </p>
              <p>
                The full source — contract and frontend — is public on{" "}
                <a href="https://github.com/presidoclintonbased-alt/ajo" className="accent-text hover:underline">
                  GitHub
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
