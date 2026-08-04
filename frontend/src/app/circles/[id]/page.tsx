"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Circle as CircleIcon, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button, Card, Badge, Spinner, CopyButton } from "@/components/ui";
import { useWallet } from "@/context/wallet-context";
import {
  Circle,
  CircleStatus,
  ContractCallError,
  buildContributeTx,
  buildDisburseTx,
  buildJoinCircleTx,
  getCircle,
  hasContributed,
  missedCount,
  submitSignedTx,
} from "@/lib/contract";
import { formatCycleLength, formatDeadline, formatXlm, shortenAddress } from "@/lib/format";
import { WalletError } from "@/lib/wallet";

const STATUS_TONE = {
  [CircleStatus.Forming]: "gold" as const,
  [CircleStatus.Active]: "green" as const,
  [CircleStatus.Completed]: "muted" as const,
};
const STATUS_LABEL = {
  [CircleStatus.Forming]: "Forming",
  [CircleStatus.Active]: "Active",
  [CircleStatus.Completed]: "Completed",
};

interface MemberRow {
  address: string;
  paidThisCycle: boolean;
  strikes: number;
}

export default function CircleDetailPage() {
  const params = useParams<{ id: string }>();
  const circleId = BigInt(params.id);
  const { address, connectWallet, signTransaction } = useWallet();

  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<MemberRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"join" | "contribute" | "disburse" | null>(null);

  const refresh = useCallback(async () => {
    try {
      const loaded = await getCircle(circleId);
      setCircle(loaded);

      const rows = await Promise.all(
        loaded.members.map(async (m): Promise<MemberRow> => ({
          address: m,
          paidThisCycle:
            loaded.status === CircleStatus.Active
              ? await hasContributed(circleId, loaded.currentCycle, m)
              : false,
          strikes: await missedCount(circleId, m),
        })),
      );
      setMembers(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this circle.");
    }
  }, [circleId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch-on-mount, not derived state
    void refresh();
  }, [refresh]);

  async function ensureWallet(): Promise<string> {
    if (address) return address;
    return connectWallet();
  }

  async function handleJoin() {
    setBusy("join");
    try {
      const wallet = await ensureWallet();
      const unsignedXdr = await buildJoinCircleTx(circleId, wallet);
      const signedXdr = await signTransaction(unsignedXdr);
      await submitSignedTx(signedXdr);
      toast.success("Joined circle");
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err, "Could not join circle."));
    } finally {
      setBusy(null);
    }
  }

  async function handleContribute() {
    setBusy("contribute");
    try {
      const wallet = await ensureWallet();
      const unsignedXdr = await buildContributeTx(circleId, wallet);
      const signedXdr = await signTransaction(unsignedXdr);
      await submitSignedTx(signedXdr);
      toast.success("Contribution sent");
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err, "Could not contribute."));
    } finally {
      setBusy(null);
    }
  }

  async function handleDisburse() {
    setBusy("disburse");
    try {
      const wallet = await ensureWallet();
      const unsignedXdr = await buildDisburseTx(circleId, wallet);
      const signedXdr = await signTransaction(unsignedXdr);
      await submitSignedTx(signedXdr);
      toast.success("Payout sent");
      await refresh();
    } catch (err) {
      toast.error(errorMessage(err, "Not ready to pay out yet — every member must contribute, or the deadline must pass."));
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          {error ? (
            <Card className="p-6 text-sm text-accent-rose">{error}</Card>
          ) : !circle || !members ? (
            <Spinner label="Loading circle…" />
          ) : (
            <CircleDetail
              circle={circle}
              members={members}
              address={address}
              busy={busy}
              onJoin={handleJoin}
              onContribute={handleContribute}
              onDisburse={handleDisburse}
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function CircleDetail({
  circle,
  members,
  address,
  busy,
  onJoin,
  onContribute,
  onDisburse,
}: {
  circle: Circle;
  members: MemberRow[];
  address: string | null;
  busy: "join" | "contribute" | "disburse" | null;
  onJoin: () => void;
  onContribute: () => void;
  onDisburse: () => void;
}) {
  const isMember = address ? circle.members.includes(address) : false;
  const myRow = members.find((m) => m.address === address);
  const recipient =
    circle.status !== CircleStatus.Completed && circle.currentCycle < circle.members.length
      ? circle.members[circle.currentCycle]
      : null;
  const deadline =
    circle.status === CircleStatus.Active
      ? Number(circle.startedAt) + (circle.currentCycle + 1) * Number(circle.cycleLengthSecs)
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Circle #{circle.id.toString()}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {formatXlm(circle.contributionAmount)} XLM &middot; {formatCycleLength(circle.cycleLengthSecs)}
          </h1>
        </div>
        <Badge tone={STATUS_TONE[circle.status]}>{STATUS_LABEL[circle.status]}</Badge>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted">Members</p>
            <p className="mt-1 font-medium">
              {circle.members.length}/{circle.maxMembers}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">Cycle</p>
            <p className="mt-1 font-medium">
              {circle.status === CircleStatus.Completed ? "Done" : `${circle.currentCycle + 1} of ${circle.maxMembers}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">This cycle&apos;s payout</p>
            <p className="mt-1 truncate font-medium">{recipient ? shortenAddress(recipient) : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Deadline</p>
            <p className="mt-1 font-medium">{deadline ? formatDeadline(deadline) : "—"}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {circle.status === CircleStatus.Forming && !isMember && (
            <Button onClick={onJoin} disabled={busy !== null}>
              {busy === "join" ? "Joining…" : "Join this circle"}
            </Button>
          )}
          {circle.status === CircleStatus.Active && isMember && !myRow?.paidThisCycle && (
            <Button onClick={onContribute} disabled={busy !== null}>
              {busy === "contribute" ? "Contributing…" : `Contribute ${formatXlm(circle.contributionAmount)} XLM`}
            </Button>
          )}
          {circle.status === CircleStatus.Active && (
            <Button variant="outline" onClick={onDisburse} disabled={busy !== null}>
              {busy === "disburse" ? "Paying out…" : "Trigger payout"}
            </Button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="eyebrow">Members &middot; payout order</h2>
        </div>
        <ul className="divide-y divide-border">
          {members.map((m, index) => (
            <li key={m.address} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-strong text-xs font-medium text-muted">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-sm">{shortenAddress(m.address, 6)}</p>
                  {m.address === address && <p className="text-xs accent-text">You</p>}
                </div>
                <CopyButton value={m.address} label="" className="shrink-0" />
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-10 sm:flex-nowrap sm:gap-3 sm:pl-0">
                {m.strikes > 0 && (
                  <span className="flex items-center gap-1 text-xs text-accent-rose">
                    <AlertTriangle size={13} />
                    {m.strikes} missed
                  </span>
                )}
                {circle.status === CircleStatus.Active &&
                  (m.paidThisCycle ? (
                    <span className="flex items-center gap-1 text-xs text-accent-green">
                      <CheckCircle2 size={14} />
                      Paid this cycle
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <CircleIcon size={14} />
                      Waiting
                    </span>
                  ))}
                {index === circle.currentCycle && circle.status !== CircleStatus.Completed && (
                  <Badge tone="gold">Next payout</Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof WalletError || err instanceof ContractCallError) return err.message;
  return fallback;
}
