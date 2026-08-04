import type { Metadata } from "next";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { WalletProvider } from "@/context/wallet-context";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-label",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = "https://ajo.app";
const DESCRIPTION =
  "Ajo is a trustless rotating savings circle on Stellar. Contribute, take turns, get paid — held by a smart contract, not a person.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ajo — Rotating savings circles, held by a contract, not a person",
    template: "%s · Ajo",
  },
  description: DESCRIPTION,
  keywords: [
    "Ajo",
    "Esusu",
    "ROSCA",
    "rotating savings",
    "Stellar",
    "Soroban",
    "financial inclusion",
    "Chama",
    "Tanda",
    "Susu",
  ],
  openGraph: {
    title: "Ajo — Rotating savings circles, held by a contract, not a person",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Ajo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ajo — Rotating savings circles, held by a contract, not a person",
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-hidden bg-background text-foreground">
        <WalletProvider>{children}</WalletProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: "flex items-start gap-3 w-full rounded-2xl border border-border bg-card p-4 text-sm text-foreground shadow-lg",
              title: "font-medium",
              description: "text-muted",
              actionButton: "rounded-full bg-foreground text-background px-3 py-1 text-xs",
              cancelButton: "rounded-full border border-border px-3 py-1 text-xs",
            },
          }}
        />
      </body>
    </html>
  );
}
