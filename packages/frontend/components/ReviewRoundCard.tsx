"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import {
  Clock, ChevronDown, ChevronUp, MessageSquare, Lock,
  Trophy, Plus, CheckCircle2, User, Eye, Loader2,
} from "lucide-react";
import {
  useRoundInfo, useProposalInfo, useHasReviewedProposal, useFinalizeRound,
  useProposalScoreHandle,
} from "../hooks/useBlindReview";
import { useDecryptForView } from "../hooks/useCofhe";
import dynamic from "next/dynamic";
import clsx from "clsx";

const ReviewModal    = dynamic(() => import("./ReviewModal").then(m => m.ReviewModal), { ssr: false });
const AddProposalModal = dynamic(() => import("./AddProposalModal").then(m => m.AddProposalModal), { ssr: false });

// ── Countdown ─────────────────────────────────────────────────────────────────

function useCountdown(deadline: number) {
  const [timeLeft, setTimeLeft] = useState("");
  const [ended, setEnded]       = useState(false);

  useEffect(() => {
    const tick = () => {
      const diff = deadline - Math.floor(Date.now() / 1000);
      if (diff <= 0) { setTimeLeft("Ended"); setEnded(true); return; }
      setEnded(false);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  return { timeLeft, ended };
}

// ── Weight pill ───────────────────────────────────────────────────────────────

function WeightPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
      style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}
    >
      <span className="font-bold">{value}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

// ── Single proposal row (reads its own data) ──────────────────────────────────

function ProposalRow({
  roundId, proposalId, isActive, winnerProposalId, finalized, onReview,
}: {
  roundId: bigint;
  proposalId: bigint;
  isActive: boolean;
  winnerProposalId: bigint;
  finalized: boolean;
  onReview: (proposalId: bigint, title: string) => void;
}) {
  const { address } = useAccount();
  const { data: info } = useProposalInfo(roundId, proposalId);
  const { data: reviewed } = useHasReviewedProposal(roundId, proposalId, address);

  if (!info) return <div className="h-14 shimmer rounded-xl" />;

  const [submitter, title, summary, reviewCount] = info;
  const isWinner = finalized && proposalId === winnerProposalId;

  return (
    <div
      className="rounded-xl px-4 py-3 flex items-start gap-3 border"
      style={
        isWinner
          ? { background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.25)" }
          : { background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }
      }
    >
      {/* Left */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {isWinner && <Trophy size={13} className="text-emerald-400 flex-shrink-0" />}
          <p className="text-sm font-semibold text-white truncate">{title}</p>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{summary}</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
          <span className="flex items-center gap-1"><User size={10} />{submitter.slice(0, 6)}…{submitter.slice(-4)}</span>
          <span className="flex items-center gap-1"><MessageSquare size={10} />{Number(reviewCount)} review{Number(reviewCount) !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0">
        {isWinner ? (
          <span className="text-xs text-emerald-400 font-semibold">Winner</span>
        ) : isActive && address && !reviewed ? (
          <button
            onClick={() => onReview(proposalId, title)}
            className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-all"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}
          >
            <Lock size={11} /> Review
          </button>
        ) : reviewed ? (
          <span className="flex items-center gap-1 text-xs text-violet-400 font-medium">
            <CheckCircle2 size={11} /> Reviewed
          </span>
        ) : null}
      </div>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────

interface Props {
  roundId: bigint;
  index: number;
}

export function ReviewRoundCard({ roundId, index }: Props) {
  const { address } = useAccount();
  const { data: info, refetch } = useRoundInfo(roundId);
  const { finalizeRound, isPending: isFinalizing } = useFinalizeRound();

  const [expanded,        setExpanded]        = useState(false);
  const [showAddProposal, setShowAddProposal] = useState(false);
  const [winnerInput,     setWinnerInput]     = useState("");
  const [showFinalize,    setShowFinalize]    = useState(false);
  const [finalizeError,   setFinalizeError]   = useState("");
  const [revealEnabled,   setRevealEnabled]   = useState(false);
  // Lifted out of ProposalRow so ReviewModal renders outside the motion.div
  // (Framer Motion transforms break position:fixed children)
  const [reviewTarget, setReviewTarget] = useState<{ proposalId: bigint; title: string } | null>(null);

  // Decrypt-for-view — reveal winner score client-side with a permit
  const winnerIdForReveal = info ? (info[8] as bigint) : 0n;
  const { data: scoreHandle } = useProposalScoreHandle(roundId, winnerIdForReveal, revealEnabled);
  const { decrypt, value: revealedScore, isDecrypting, error: revealError, reset: resetReveal } = useDecryptForView();
  const decryptTriggered = useRef(false);

  useEffect(() => {
    if (revealEnabled && scoreHandle != null && !decryptTriggered.current && !isDecrypting) {
      decryptTriggered.current = true;
      decrypt(scoreHandle as bigint).catch(() => {});
    }
  }, [revealEnabled, scoreHandle, isDecrypting, decrypt]);

  // getRound returns: [organizer, title, description, deadline, wImpact, wFeasibility, wInnovation, proposalCount, winnerProposalId, finalized]
  const deadline = info ? Number(info[3]) : 0;
  const { timeLeft, ended } = useCountdown(deadline);

  if (!info) return <div className="glass-card h-52 shimmer" />;

  const [organizer, title, description, , wImpact, wFeasibility, wInnovation, proposalCount, winnerProposalId, finalized] = info;

  const isLive       = !finalized && !ended;
  const isOrganizer  = address?.toLowerCase() === organizer.toLowerCase();
  const proposalIds  = Array.from({ length: Number(proposalCount) }, (_, i) => BigInt(i));
  const weights      = { wImpact: Number(wImpact), wFeasibility: Number(wFeasibility), wInnovation: Number(wInnovation) };

  const statusBadge = finalized
    ? <span className="badge-settled">Finalized</span>
    : isLive
    ? (
      <span className="badge-live">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Active
      </span>
    )
    : <span className="badge-ended">Ended</span>;

  const handleFinalize = async () => {
    setFinalizeError("");
    const id = parseInt(winnerInput, 10);
    if (isNaN(id) || id < 0 || BigInt(id) >= proposalCount) {
      setFinalizeError("Invalid proposal ID");
      return;
    }
    try {
      await finalizeRound(roundId, BigInt(id));
      setShowFinalize(false);
      refetch();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setFinalizeError(msg.slice(0, 120));
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.07 }}
        className="glass-card flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{description}</p>
          </div>
          {statusBadge}
        </div>

        <div className="divider" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="stat-box">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <MessageSquare size={11} /> Proposals
            </div>
            <div className="text-sm font-bold text-white">{Number(proposalCount)}</div>
          </div>
          <div className="stat-box">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
              <Clock size={11} /> {ended ? "Ended" : "Closes in"}
            </div>
            <div className={clsx("text-sm font-bold", isLive ? "text-emerald-400" : "text-slate-400")}>
              {timeLeft}
            </div>
          </div>
        </div>

        {/* Weight pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-600">Weights:</span>
          <WeightPill label="Impact"      value={Number(wImpact)}      color="#8b5cf6" />
          <WeightPill label="Feasibility" value={Number(wFeasibility)} color="#22d3ee" />
          <WeightPill label="Innovation"  value={Number(wInnovation)}  color="#ec4899" />
        </div>

        {/* Privacy note */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs"
          style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}
        >
          <Lock size={13} className="text-violet-400 flex-shrink-0" />
          <span className="text-slate-400">
            Review scores are <span className="text-violet-400 font-medium">FHE-encrypted</span> —
            no reviewer sees another&apos;s inputs
          </span>
        </div>

        {/* Winner banner */}
        {finalized && (
          <div
            className="rounded-xl px-3 py-2.5 text-xs space-y-2"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Trophy size={13} className="text-emerald-400 flex-shrink-0" />
                <span className="text-slate-300">
                  Winner: <span className="text-emerald-400 font-semibold">Proposal #{Number(winnerProposalId)}</span>
                </span>
              </div>
              {isOrganizer && revealedScore === null && (
                <button
                  onClick={() => {
                    resetReveal();
                    decryptTriggered.current = false;
                    setRevealEnabled(true);
                  }}
                  disabled={isDecrypting}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                  style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}
                >
                  {isDecrypting
                    ? <><Loader2 size={11} className="animate-spin" /> Decrypting…</>
                    : <><Eye size={11} /> Reveal Score</>}
                </button>
              )}
            </div>
            {revealedScore !== null && (
              <div className="flex items-center gap-2 pt-1 border-t border-emerald-500/10">
                <Lock size={11} className="text-emerald-400" />
                <span className="text-slate-400">Decrypted winner score:</span>
                <span className="font-bold text-emerald-300">{revealedScore.toString()}</span>
                <span className="text-slate-600 ml-auto">(via FHE permit)</span>
              </div>
            )}
            {revealError && (
              <p className="text-rose-400 pt-1 border-t border-rose-500/10">{revealError}</p>
            )}
          </div>
        )}

        {/* Action bar */}
        <div className="flex gap-2 mt-auto flex-wrap">
          {isLive && address && (
            <button
              onClick={() => setShowAddProposal(true)}
              className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2"
            >
              <Plus size={13} /> Add Proposal
            </button>
          )}
          {ended && !finalized && isOrganizer && !showFinalize && (
            <button
              onClick={() => setShowFinalize(true)}
              className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2"
            >
              <Trophy size={13} /> Finalize Round
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2 ml-auto"
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? "Hide" : `${Number(proposalCount)} Proposal${Number(proposalCount) !== 1 ? "s" : ""}`}
          </button>
        </div>

        {/* Finalize input */}
        {showFinalize && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl p-4 space-y-3"
            style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <p className="text-xs text-slate-400">
              Enter the winning proposal ID (0-based). Reviewers cannot see scores — select based on your off-chain evaluation.
            </p>
            <div className="flex gap-2">
              <input
                className="input flex-1" type="number" min={0} max={Number(proposalCount) - 1}
                placeholder="Proposal ID (e.g. 0)"
                value={winnerInput} onChange={(e) => setWinnerInput(e.target.value)}
                disabled={isFinalizing}
              />
              <button
                onClick={handleFinalize}
                disabled={isFinalizing}
                className="btn-primary px-4 text-xs"
              >
                {isFinalizing ? "Finalizing…" : "Confirm"}
              </button>
              <button onClick={() => { setShowFinalize(false); setFinalizeError(""); }} className="btn-secondary px-3 text-xs">
                Cancel
              </button>
            </div>
            {finalizeError && <p className="text-xs text-rose-400">{finalizeError}</p>}
          </motion.div>
        )}

        {/* Proposals list */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              {proposalIds.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No proposals yet. {isLive && address ? "Be the first!" : ""}
                </p>
              ) : (
                proposalIds.map((pid) => (
                  <ProposalRow
                    key={pid.toString()}
                    roundId={roundId}
                    proposalId={pid}
                    isActive={isLive}
                    winnerProposalId={winnerProposalId}
                    finalized={finalized}
                    onReview={(id, title) => setReviewTarget({ proposalId: id, title })}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {showAddProposal && (
        <AddProposalModal
          roundId={roundId}
          roundTitle={title}
          onClose={() => setShowAddProposal(false)}
          onAdded={() => { setShowAddProposal(false); refetch(); setExpanded(true); }}
        />
      )}

      {/* Rendered outside motion.div so position:fixed works correctly */}
      {reviewTarget && (
        <ReviewModal
          roundId={roundId}
          proposalId={reviewTarget.proposalId}
          proposalTitle={reviewTarget.title}
          weights={weights}
          onClose={() => { setReviewTarget(null); refetch(); }}
        />
      )}
    </>
  );
}
