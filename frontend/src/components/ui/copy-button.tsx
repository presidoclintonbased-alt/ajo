"use client";
// Copy button component.

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = "Copy", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  // An empty label means icon-only — those still need a real accessible
  // name, since the visible text a sighted user relies on isn't there.
  const isIconOnly = label === "";

  async function handleCopy() {
    // The Clipboard API can reject (insecure context, permission denied,
    // unsupported browser) — surface that instead of failing silently.
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      toast.error("Couldn't copy to clipboard. Please copy it manually.");
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={isIconOnly ? (copied ? "Copied to clipboard" : "Copy to clipboard") : undefined}
      className={cn("inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground", className)}
    >
      {copied ? (
        <Check size={13} className="text-accent-green" aria-hidden="true" />
      ) : (
        <Copy size={13} aria-hidden="true" />
      )}
      {!isIconOnly && (copied ? "Copied" : label)}
    </button>
  );
}