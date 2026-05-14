"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Radio, Loader2 } from "lucide-react";
import { useCreateVoteProposal } from "../hooks/useSealedVote";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreateProposalModal({ onClose, onCreated }: Props) {
  const { createProposal, isPending, isConfirming, isSuccess } = useCreateVoteProposal();

  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [duration,    setDuration]    = useState(24);
  const [quorum,      setQuorum]      = useState(3);
  const [error,       setError]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await createProposal(title.trim(), description.trim(), duration, quorum);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.slice(0, 200));
    }
  };

  if (isSuccess) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="modal-card"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl">🗳️</div>
            <p className="text-lg font-bold text-white">Proposal Created</p>
            <p className="text-sm text-slate-400">Voters can now cast encrypted ballots.</p>
            <button onClick={onCreated} className="btn-primary mx-auto">Done</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const busy = isPending || isConfirming;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#22d3ee)" }}>
              <Radio size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">New DAO Proposal</h2>
              <p className="text-xs text-slate-500">Ballots are FHE-encrypted — tally hidden until deadline</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Proposal Title</label>
            <input
              className="input"
              placeholder="e.g. Allocate 5 ETH to dev fund"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={busy}
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="What is being decided and why?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={busy}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Duration (hours)</label>
              <input
                className="input"
                type="number"
                min={1}
                max={720}
                value={duration}
                onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                required
                disabled={busy}
              />
            </div>
            <div>
              <label className="label">Quorum (min yes votes)</label>
              <input
                className="input"
                type="number"
                min={1}
                value={quorum}
                onChange={(e) => setQuorum(Math.max(1, parseInt(e.target.value) || 1))}
                required
                disabled={busy}
              />
            </div>
          </div>

          <div
            className="rounded-xl px-3 py-2.5 text-xs text-slate-400 space-y-1"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}
          >
            <p>🔐 Each ballot is encrypted to <span className="text-violet-400">euint128</span> before reaching the contract.</p>
            <p>📊 Votes accumulate via <span className="text-violet-400">FHE.add</span> — no running tally visible until <span className="text-violet-400">settle()</span>.</p>
            <p>⛓️ Decryption happens fully on-chain via <span className="text-violet-400">FHE.decrypt + FHE.getDecryptResultSafe</span>.</p>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={busy}>Cancel</button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={busy || !title.trim()}>
              {busy
                ? <><Loader2 size={14} className="animate-spin" /> {isPending ? "Confirm in wallet…" : "Creating…"}</>
                : <><Radio size={14} /> Create Proposal</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
