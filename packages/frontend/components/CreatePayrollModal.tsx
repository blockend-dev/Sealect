"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, DollarSign, Loader2 } from "lucide-react";
import { useCreatePayrollPeriod } from "../hooks/useConfidentialPayroll";
import { parseEther } from "viem";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export function CreatePayrollModal({ onClose, onCreated }: Props) {
  const { createPeriod, isPending, isConfirming, isSuccess } = useCreatePayrollPeriod();

  const [name,    setName]    = useState("");
  const [minWage, setMinWage] = useState("0.01");
  const [error,   setError]   = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const wageVal = parseFloat(minWage);
    if (isNaN(wageVal) || wageVal <= 0) { setError("Minimum wage must be > 0 ETH"); return; }
    try {
      await createPeriod(name.trim(), parseEther(minWage));
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : String(err)).slice(0, 200));
    }
  };

  if (isSuccess) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="modal-card" onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center py-8 space-y-4">
            <div className="text-4xl">💼</div>
            <p className="text-lg font-bold text-white">Pay Period Created</p>
            <p className="text-sm text-slate-400">Enroll employees and have them submit encrypted salaries.</p>
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
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="modal-card" onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#22d3ee)" }}>
              <DollarSign size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">New Pay Period</h2>
              <p className="text-xs text-slate-500">Salaries stay encrypted · only cert result goes on-chain</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Period Name</label>
            <input className="input" placeholder="e.g. Q2 2025 Engineering" value={name}
              onChange={(e) => setName(e.target.value)} required disabled={busy} />
          </div>

          <div>
            <label className="label">Minimum Wage (ETH)</label>
            <input className="input" type="number" step="0.001" min="0.001"
              placeholder="0.01" value={minWage}
              onChange={(e) => setMinWage(e.target.value)} required disabled={busy} />
            <p className="text-xs text-slate-600 mt-1">
              Contract checks each encrypted salary against this floor — nobody sees which employees pass or fail individually.
            </p>
          </div>

          <div className="rounded-xl px-3 py-3 text-xs text-slate-400 space-y-1.5"
            style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
            <p>💼 <span className="text-violet-400 font-medium">You enroll employees</span> after creation (address + group A/B)</p>
            <p>🔐 <span className="text-violet-400 font-medium">Each employee submits</span> their encrypted salary independently</p>
            <p>⚖️ Cert checks: <span className="text-violet-400">min wage compliance</span> + <span className="text-cyan-400">group A avg ≥ group B avg</span></p>
            <p>📊 You see total payroll + group totals via <span className="text-violet-400">FHE permit</span> · no individual values</p>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1" disabled={busy}>Cancel</button>
            <button type="submit" disabled={busy || !name.trim()} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {busy
                ? <><Loader2 size={14} className="animate-spin" />{isPending ? "Confirm in wallet…" : "Creating…"}</>
                : <><DollarSign size={14} /> Create Period</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
