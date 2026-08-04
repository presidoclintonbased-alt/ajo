import { cn } from "@/lib/cn";

type BadgeTone = "gold" | "green" | "rose" | "muted";

const TONE_CLASSES: Record<BadgeTone, string> = {
  gold: "bg-accent-gold/10 text-accent-gold",
  green: "bg-accent-green/10 text-accent-green",
  rose: "bg-accent-rose/10 text-accent-rose",
  muted: "bg-border/60 text-muted",
};

export function Badge({
  tone = "muted",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
