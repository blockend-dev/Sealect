"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import {
  Users, ShieldCheck, ShieldAlert, Plus, Loader2, Lock,
  CheckCircle2, BadgeCheck, Eye, UserPlus, DollarSign,
} from "lucide-react";
import {
  usePayrollPeriod, useIsEnrolled, useHasSubmittedSalary,
  useSalaryHandle, useTotalPayrollHandle,
  useEnrollEmployee, useSubmitPayrollSalary,
  useRequestPayrollCertification, useCertifyPayroll,
} from "../hooks/useConfidentialPayroll";
import { useDecryptForView } from "../hooks/useCofhe";
import { EncryptionSteps } from "./EncryptionSteps";
import clsx from "clsx";
import { formatEther, parseEther } from "viem";

interface Props {
  periodId: bigint;
  index: number;
}

export function PayrollCard({ periodId, index }: Props) {
  const { address } = useAccount();
  const { data: info, refetch }          = usePayrollPeriod(periodId);
  const { data: enrolled, refetch: refetchEnrolled } = useIsEnrolled(periodId, address);
  const { data: submitted, refetch: refetchSubmitted } = useHasSubmittedSalary(periodId, address);
  const { data: mySalaryCtHash }         = useSalaryHandle(periodId, address);
  const { data: totalCtHash }            = useTotalPayrollHandle(periodId);

  const { enrollEmployee, isPending: isEnrolling, isConfirming: isEnrollConfirming } = useEnrollEmployee();
  const { submitSalary, steps, isEncrypting, isPending: isSubmitting, isConfirming: isSubmitConfirming, isSuccess: submitDone, resetSteps } = useSubmitPayrollSalary();
  const { requestCertification, isPending: isRequesting, isConfirming: isRequestConfirming } = useRequestPayrollCertification();
  const { certify, isPending: isCertifying, isConfirming: isCertifyConfirming } = useCertifyPayroll();

  // Salary decrypt — employee's own
  const { decrypt: decryptSalary, value: mySalary, isDecrypting: isDecryptingSalary, reset: resetSalaryDecrypt } = useDecryptForView();
  // Total payroll decrypt — employer audit
  const { decrypt: decryptTotal, value: totalPayroll, isDecrypting: isDecryptingTotal, reset: resetTotalDecrypt } = useDecryptForView();

  const salaryDecryptTriggered = useRef(false);
  const totalDecryptTriggered  = useRef(false);

  const [showEnroll,     setShowEnroll]     = useState(false);
  const [enrollAddr,     setEnrollAddr]     = useState("");
  const [enrollGroup,    setEnrollGroup]    = useState<0 | 1>(0);
  const [salaryInput,    setSalaryInput]    = useState("");
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [revealSalary,   setRevealSalary]   = useState(false);
  const [revealTotal,    setRevealTotal]    = useState(false);
  const [error,          setError]          = useState("");

  // Auto-decrypt salary when handle + trigger ready
  useEffect(() => {
    if (revealSalary && mySalaryCtHash != null && !salaryDecryptTriggered.current && !isDecryptingSalary) {
      salaryDecryptTriggered.current = true;
      decryptSalary(mySalaryCtHash as bigint).catch(() => {});
    }
  }, [revealSalary, mySalaryCtHash, isDecryptingSalary, decryptSalary]);

  // Auto-decrypt total payroll when handle + trigger ready
  useEffect(() => {
    if (revealTotal && totalCtHash != null && !totalDecryptTriggered.current && !isDecryptingTotal) {
      totalDecryptTriggered.current = true;
      decryptTotal(totalCtHash as bigint).catch(() => {});
    }
  }, [revealTotal, totalCtHash, isDecryptingTotal, decryptTotal]);

  useEffect(() => {
    if (submitDone) {
      refetch(); refetchSubmitted(); setShowSalaryForm(false); resetSteps();
    }
  }, [submitDone, refetch, refetchSubmitted, resetSteps]);

  if (!info) return <div className="glass-card h-56 shimmer" />;

  // getPeriod: [employer, name, minWage, employeeCount, submittedCount, groupZeroCount, groupOneCount, certReq, certified, passed]
  const [employer, name, minWage, employeeCount, submittedCount, groupZeroCount, groupOneCount, certReq, certified, passed] = info;

  const isEmployer  = address?.toLowerCase() === employer.toLowerCase();
  const allSubmitted = Number(submittedCount) > 0 && Number(submittedCount) === Number(employeeCount);

  const statusBadge = certified ? (
    passed
      ? <span className="badge-settled" style={{ color: "#34d399", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>Certified ✓</span>
      : <span className="badge-settled" style={{ color: "#f87171", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>Failed ✗</span>
  ) : certReq ? (
    <span className="badge-ended">Verifying…</span>
  ) : (
    <span className="badge-live">
      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
      Open
    </span>
  );

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!enrollAddr.startsWith("0x") || enrollAddr.length !== 42) { setError("Invalid address"); return; }
    try {
      await enrollEmployee(periodId, enrollAddr as `0x${string}`, enrollGroup);
      setEnrollAddr(""); setShowEnroll(false); refetch(); refetchEnrolled();
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : String(err)).slice(0, 120));
    }
  };

  const handleSubmitSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const ethVal = parseFloat(salaryInput);
    if (isNaN(ethVal) || ethVal <= 0) { setError("Enter a valid salary in ETH"); return; }
    try {
      await submitSalary(periodId, parseEther(salaryInput));
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : String(err)).slice(0, 120));
    }
  };

  const handleRequestCert = async () => {
    setError("");
    try { await requestCertification(periodId); refetch(); }
    catch (err: unknown) { setError((err instanceof Error ? err.message : String(err)).slice(0, 120)); }
  };

  const handleCertify = async () => {
    setError("");
    try { await certify(periodId); refetch(); }
    catch (err: unknown) { setError((err instanceof Error ? err.message : String(err)).slice(0, 120)); }
  };

  const isBusy = isRequesting || isRequestConfirming || isCertifying || isCertifyConfirming;

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
          <h3 className="text-base font-bold text-white truncate">{name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Min wage: <span className="text-slate-400 font-mono">{formatEther(minWage)} ETH</span>
          </p>
        </div>
        {statusBadge}
      </div>

      <div className="divider" />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="stat-box">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1"><Users size={10} /> Enrolled</div>
          <div className="text-sm font-bold text-white">{Number(employeeCount)}</div>
        </div>
        <div className="stat-box">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1"><CheckCircle2 size={10} /> Submitted</div>
          <div className={clsx("text-sm font-bold", allSubmitted ? "text-emerald-400" : "text-white")}>
            {Number(submittedCount)}/{Number(employeeCount)}
          </div>
        </div>
        <div className="stat-box">
          <div className="flex items-center gap-1 text-xs text-slate-500 mb-1"><Users size={10} /> Groups</div>
          <div className="text-xs font-medium text-white">
            <span className="text-violet-400">{Number(groupZeroCount)}A</span>
            <span className="text-slate-600 mx-1">/</span>
            <span className="text-cyan-400">{Number(groupOneCount)}B</span>
          </div>
        </div>
      </div>

      {/* Certification result */}
      {certified && (
        <div
          className="rounded-xl px-4 py-3 space-y-1.5"
          style={
            passed
              ? { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }
              : { background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }
          }
        >
          <div className="flex items-center gap-2">
            {passed ? <BadgeCheck size={14} className="text-emerald-400" /> : <ShieldAlert size={14} className="text-rose-400" />}
            <span className={clsx("text-sm font-semibold", passed ? "text-emerald-300" : "text-rose-300")}>
              {passed ? "Pay equity certificate issued" : "Certification failed"}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {passed
              ? "All salaries exceed minimum wage · Group 0 avg ≥ Group 1 avg · Result revealed on-chain via FHE.getDecryptResultSafe"
              : "One or more checks failed on ciphertext · No individual salary was revealed"}
          </p>
        </div>
      )}

      {/* Verifying notice */}
      {certReq && !certified && (
        <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs"
          style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <Loader2 size={13} className="text-amber-400 animate-spin flex-shrink-0" />
          <span className="text-slate-400">Co-processor decrypting cert check — call <span className="text-amber-400 font-medium">Certify</span> when ready</span>
        </div>
      )}

      {/* Privacy note */}
      <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs"
        style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
        <Lock size={13} className="text-violet-400 flex-shrink-0" />
        <span className="text-slate-400">
          Salaries <span className="text-violet-400 font-medium">FHE-encrypted</span> end-to-end ·
          employer sees totals only · employee decrypts own value via permit
        </span>
      </div>

      {/* Employer: enroll panel */}
      {isEmployer && !certified && (
        <AnimatePresence>
          {showEnroll && (
            <motion.form
              key="enroll"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleEnroll}
              className="rounded-xl p-4 space-y-3 overflow-hidden"
              style={{ background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.18)" }}
            >
              <p className="text-xs text-slate-400 font-medium">Enroll employee</p>
              <input
                className="input text-sm" placeholder="0x… employee address"
                value={enrollAddr} onChange={(e) => setEnrollAddr(e.target.value)}
                disabled={isEnrolling || isEnrollConfirming}
              />
              <div className="flex gap-2 items-center">
                <span className="text-xs text-slate-500">Group:</span>
                {([0, 1] as const).map((g) => (
                  <button key={g} type="button"
                    onClick={() => setEnrollGroup(g)}
                    className="rounded-lg px-3 py-1 text-xs font-medium transition-all"
                    style={
                      enrollGroup === g
                        ? { background: g === 0 ? "rgba(139,92,246,0.25)" : "rgba(34,211,238,0.2)", color: g === 0 ? "#a78bfa" : "#22d3ee", border: `1px solid ${g === 0 ? "rgba(139,92,246,0.4)" : "rgba(34,211,238,0.3)"}` }
                        : { background: "rgba(255,255,255,0.04)", color: "#64748b", border: "1px solid rgba(255,255,255,0.08)" }
                    }
                  >
                    Group {g === 0 ? "A" : "B"}
                  </button>
                ))}
                <button type="submit" className="btn-primary ml-auto text-xs px-3 py-1.5" disabled={isEnrolling || isEnrollConfirming}>
                  {isEnrolling || isEnrollConfirming ? <Loader2 size={12} className="animate-spin" /> : "Add"}
                </button>
                <button type="button" onClick={() => setShowEnroll(false)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      )}

      {/* Employee: submit salary panel */}
      {enrolled && !submitted && !certified && (
        <AnimatePresence>
          {showSalaryForm && (
            <motion.form
              key="salary"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmitSalary}
              className="rounded-xl p-4 space-y-3 overflow-hidden"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)" }}
            >
              {isEncrypting || isSubmitting || isSubmitConfirming ? (
                <div className="space-y-3">
                  <p className="text-xs text-emerald-300 font-medium">Encrypting your salary…</p>
                  <EncryptionSteps steps={steps} />
                  {(isSubmitting || isSubmitConfirming) && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Loader2 size={11} className="animate-spin" />
                      {isSubmitting ? "Submitting to chain…" : "Confirming…"}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-400">Your salary is encrypted before it leaves your browser — the contract never sees the plaintext amount.</p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        className="input pl-8 text-sm" type="number" step="0.001" min="0"
                        placeholder="Salary in ETH (e.g. 0.05)"
                        value={salaryInput} onChange={(e) => setSalaryInput(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn-primary text-xs px-3">Encrypt &amp; Submit</button>
                    <button type="button" onClick={() => setShowSalaryForm(false)} className="btn-secondary text-xs px-3">Cancel</button>
                  </div>
                </>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      )}

      {/* Employer: audit decryption */}
      {isEmployer && certified && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (totalPayroll !== null) return;
              resetTotalDecrypt(); totalDecryptTriggered.current = false; setRevealTotal(true);
            }}
            disabled={isDecryptingTotal || totalPayroll !== null}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}
          >
            {isDecryptingTotal ? <><Loader2 size={11} className="animate-spin" /> Decrypting…</> : <><Eye size={11} /> View Total Payroll</>}
          </button>
          {totalPayroll !== null && (
            <span className="text-xs text-violet-300 font-mono">
              {formatEther(totalPayroll)} ETH total
            </span>
          )}
        </div>
      )}

      {/* Employee: view own salary */}
      {submitted && mySalaryCtHash != null && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              if (mySalary !== null) return;
              resetSalaryDecrypt(); salaryDecryptTriggered.current = false; setRevealSalary(true);
            }}
            disabled={isDecryptingSalary || mySalary !== null}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#34d399" }}
          >
            {isDecryptingSalary ? <><Loader2 size={11} className="animate-spin" /> Decrypting…</> : <><Eye size={11} /> View My Salary</>}
          </button>
          {mySalary !== null && (
            <span className="text-xs text-emerald-300 font-mono">
              {formatEther(mySalary)} ETH · via FHE permit
            </span>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-400">{error}</p>}

      {/* Action bar */}
      <div className="flex gap-2 mt-auto flex-wrap">
        {isEmployer && !certified && (
          <button onClick={() => setShowEnroll(!showEnroll)} className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2">
            <UserPlus size={13} /> Add Employee
          </button>
        )}

        {enrolled && !submitted && !showSalaryForm && (
          <button onClick={() => setShowSalaryForm(true)} className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2">
            <Lock size={13} /> Submit Salary
          </button>
        )}

        {submitted && !enrolled && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 py-2">
            <CheckCircle2 size={13} /> Salary submitted
          </span>
        )}

        {submitted && enrolled && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 py-2">
            <CheckCircle2 size={13} /> Salary submitted
          </span>
        )}

        {isEmployer && allSubmitted && !certReq && !certified && (
          <button onClick={handleRequestCert} disabled={isBusy} className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2">
            {isRequesting || isRequestConfirming
              ? <><Loader2 size={11} className="animate-spin" /> Requesting…</>
              : <><ShieldCheck size={13} /> Request Certification</>}
          </button>
        )}

        {certReq && !certified && (
          <button onClick={handleCertify} disabled={isBusy}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-medium transition-all"
            style={{ background: "rgba(245,158,11,0.18)", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }}
          >
            {isCertifying || isCertifyConfirming
              ? <><Loader2 size={11} className="animate-spin" /> Certifying…</>
              : <><BadgeCheck size={13} /> Certify</>}
          </button>
        )}

        <div className="ml-auto text-xs text-slate-700 flex items-center py-2">
          {employer.slice(0, 6)}…{employer.slice(-4)}
        </div>
      </div>
    </motion.div>
  );
}
