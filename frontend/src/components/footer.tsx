import Link from "next/link";
import { LogoMark } from "./logo-mark";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <LogoMark size={24} />
              <span className="font-semibold">Ajo</span>
            </div>
            <p className="mt-3 text-sm text-muted">
              A trustless rotating savings circle on Stellar. Contribute, take turns, get paid — held by a smart
              contract, not a person.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2">
            <div>
              <h3 className="eyebrow">Product</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li><Link href="/#how-it-works" className="hover:text-foreground">How it works</Link></li>
                <li><Link href="/circles" className="hover:text-foreground">Launch app</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="eyebrow">Project</h3>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li><a href="https://github.com/presidoclintonbased-alt/ajo" className="hover:text-foreground">GitHub</a></li>
                <li><Link href="/#faq" className="hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Ajo. All rights reserved.</p>
          <p className="eyebrow">Built on Stellar</p>
        </div>
      </div>
    </footer>
  );
}
