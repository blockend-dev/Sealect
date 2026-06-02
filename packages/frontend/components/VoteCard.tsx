"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import {
  Clock, Lock, CheckCircle2, ThumbsUp, ThumbsDown,
  Radio, Loader2, Users, Target, BarChart3,
} from "lucide-react";
import {
  useVoteProposal, useHasVotedProposal, useCastBallot,
  useRequestVoteDecryption, useSettleVote,
} from "../hooks/useSealedVote";
import { EncryptionSteps } from "./EncryptionSteps";
import clsx from "clsx";

//  Countdown 

function useCountdown(deadline: number) {
  const [timeLeft, setTimeLeft] = useState("");
  const [ended, setEnded] = useState(false);

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

//  Main card 

interface Props {
  proposalId: bigint;
  index: number;
}

export function VoteCard({ proposalId, index }: Props) {
  const { address } = useAccount();
  const { data: info, refetch } = useVoteProposal(proposalId);
  const { data: voted, refetch: refetchVoted } = useHasVotedProposal(proposalId, address);

  const { castBallot, steps, isEncrypting, isPending: isCasting, isConfirming: isCastConfirming, isSuccess: castDone, reset: resetBallot } = useCastBallot();
  const { requestDecryption, isPending: isRequesting, isConfirming: isRequestConfirming } = useRequestVoteDecryption();
  const { settle, isPending: isSettling, isConfirming: isSettleConfirming } = useSettleVote();

  const [voteChoice, setVoteChoice] = useState<boolean | null>(null);
  const [showVotePanel, setShowVotePanel] = useState(false);
  const [actionError, setActionError] = useState("");

  // Auto-refetch after successful cast
  useEffect(() => {
    if (castDone) {
      refetch();
      refetchVoted();
      setShowVotePanel(false);
      resetBallot();
    }
  }, [castDone, refetch, refetchVoted, resetBallot]);

  const deadline = info ? Number(info[3]) : 0;
  const { timeLeft, ended } = useCountdown(deadline);

  if (!info) return <div className="glass-card h-52 shimmer" />;

  // getProposal returns: [proposer, title, description, deadline, quorum, totalVoters, decryptRequested, settled, passed, revealedYes]
  const [proposer, title, description, , quorum, totalVoters, decryptRequested, settled, passed, revealedYes] = info;

  const isActive  = !ended && !settled;
  const noCount   = Number(totalVoters) - Number(revealedYes);

  const statusBadge = settled ? (
    passed
      ? <span className="badge-settled" style={{ color: "#34d399", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>Passed</span>
      : <span className="badge-settled" style={{ color: "#f87171", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>Failed</span>
  ) : decryptRequested ? (
    <span className="badge-ended">Tallying…</span>
  ) : ended ? (
    <span className="badge-ended">Ended</span>
  ) : (
    <span className="badge-live">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Active
    </span>
  );

  const handleVote = async (choice: boolean) => {
    setActionError("");
    setVoteChoice(choice);
    try {
      await castBallot(proposalId, choice);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setActionError(msg.slice(0, 120));
    }
  };

  const handleRequestDecryption = async () => {
    setActionError("");
    try {
      await requestDecryption(proposalId);
      refetch();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setActionError(msg.slice(0, 120));
    }
  };

  const handleSettle = async () => {
    setActionError("");
    try {
      await settle(proposalId);
      refetch();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setActionError(msg.slice(0, 120));
    }
  };

  const isActionBusy = isRequesting || isRequestConfirming || isSettling || isSettleConfirming;

  return (
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
      <div className="grid grid-cols-3 gap-2">
        <div className="stat-box">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Users size={10} /> Voters
          </div>
          <div className="text-sm font-bold text-white">{Number(totalVoters)}</div>
        </div>
        <div className="stat-box">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Target size={10} /> Quorum
          </div>
          <div className="text-sm font-bold text-white">{Number(quorum)}</div>
        </div>
        <div className="stat-box">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <Clock size={10} /> {ended ? "Ended" : "Closes in"}
          </div>
          <div className={clsx("text-sm font-bold", isActive ? "text-emerald-400" : "text-slate-400")}>
            {timeLeft}
          </div>
        </div>
      </div>

      {/* Settled result */}
      {settled && (
        <div
          className="rounded-xl px-4 py-3 space-y-2"
          style={
            passed
              ? { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }
              : { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }
          }
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={13} className={passed ? "text-emerald-400" : "text-rose-400"} />
            <span className="text-xs font-semibold text-slate-300">On-chain tally revealed</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <ThumbsUp size={13} className="text-emerald-400" />
              <span className="font-bold text-emerald-300">{Number(revealedYes)}</span>
              <span className="text-slate-500 text-xs">yes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ThumbsDown size={13} className="text-slate-400" />
              <span className="font-bold text-slate-300">{noCount}</span>
              <span className="text-slate-500 text-xs">no</span>
            </div>
            <div className="ml-auto text-xs text-slate-600">
              quorum: {Number(quorum)} · {passed ? "✓ met" : "✗ not met"}
            </div>
          </div>
        </div>
      )}

      {/* Decryption pending notice */}
      {decryptRequested && !settled && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs"
          style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <Loader2 size={13} className="text-amber-400 animate-spin flex-shrink-0" />
          <span className="text-slate-400">
            Co-processor decrypting tally — call <span className="text-amber-400 font-medium">Settle</span> once ready
          </span>
        </div>
      )}

      {/* Privacy note */}
      {!settled && (
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs"
          style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}
        >
          <Lock size={13} className="text-violet-400 flex-shrink-0" />
          <span className="text-slate-400">
            Running tally is <span className="text-violet-400 font-medium">FHE-encrypted</span> —
            result hidden until <span className="text-violet-400 font-medium">settle()</span> reads it on-chain
          </span>
        </div>
      )}

      {/* Vote panel */}
      <AnimatePresence>
        {showVotePanel && isActive && !voted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl p-4 space-y-3 overflow-hidden"
            style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.18)" }}
          >
            {isEncrypting || isCasting || isCastConfirming ? (
              <div className="space-y-3">
                <p className="text-xs text-violet-300 font-medium">
                  Encrypting your ballot: <span className="font-bold">{voteChoice ? "YES" : "NO"}</span>
                </p>
                <EncryptionSteps steps={steps} isEncrypting={isEncrypting} />
                {(isCasting || isCastConfirming) && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 size={11} className="animate-spin" />
                    {isCasting ? "Submitting to chain…" : "Confirming…"}
                  </div>
                )}
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-400">
                  Your ballot is encrypted before leaving your browser — the contract never sees your raw vote.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote(true)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all"
                    style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }}
                  >
                    <ThumbsUp size={14} /> Yes
                  </button>
                  <button
                    onClick={() => handleVote(false)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all"
                    style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                  >
                    <ThumbsDown size={14} /> No
                  </button>
                  <button onClick={() => setShowVotePanel(false)} className="btn-secondary px-3 text-xs">Cancel</button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {actionError && <p className="text-xs text-rose-400">{actionError}</p>}

      {/* Action bar */}
      <div className="flex gap-2 mt-auto flex-wrap">
        {isActive && address && !voted && !showVotePanel && (
          <button
            onClick={() => setShowVotePanel(true)}
            className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2"
          >
            <Radio size={13} /> Cast Ballot
          </button>
        )}

        {isActive && voted && (
          <span className="flex items-center gap-1.5 text-xs text-violet-400 font-medium py-2">
            <CheckCircle2 size={13} /> Ballot cast — tally hidden until deadline
          </span>
        )}

        {ended && !decryptRequested && !settled && address && (
          <button
            onClick={handleRequestDecryption}
            disabled={isActionBusy}
            className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2"
          >
            {isRequesting || isRequestConfirming
              ? <><Loader2 size={11} className="animate-spin" /> Requesting…</>
              : <><BarChart3 size={13} /> Reveal Tally</>}
          </button>
        )}

        {decryptRequested && !settled && address && (
          <button
            onClick={handleSettle}
            disabled={isActionBusy}
            className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2"
            style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}
          >
            {isSettling || isSettleConfirming
              ? <><Loader2 size={11} className="animate-spin" /> Settling…</>
              : <><CheckCircle2 size={13} /> Settle</>}
          </button>
        )}

        <div className="ml-auto text-xs text-slate-700 flex items-center gap-1 py-2">
          <span>{proposer.slice(0, 6)}…{proposer.slice(-4)}</span>
        </div>
      </div>
    </motion.div>
  );
}
