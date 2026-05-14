"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, ExternalLink, Send, FileText, ShieldCheck, ShieldAlert, Radio, DollarSign } from "lucide-react";
import { useAccount } from "wagmi";
import { useRequestCount } from "../hooks/useRequest";
import { useRoundCount } from "../hooks/useBlindReview";
import { useVoteProposalCount } from "../hooks/useSealedVote";
import { usePayrollPeriodCount } from "../hooks/useConfidentialPayroll";
import { useIsVerified } from "../hooks/useIdentityGate";
import { RequestCard } from "../components/RequestCard";
import dynamicImport from "next/dynamic";
import { WalletButton } from "../components/WalletButton";
import { HeroSection } from "../components/HeroSection";

const CreateRequestModal = dynamicImport(
  () => import("../components/CreateRequestModal").then(mod => mod.CreateRequestModal),
  { ssr: false }
);
const SendPaymentModal = dynamicImport(
  () => import("../components/SendPaymentModal").then(mod => mod.SendPaymentModal),
  { ssr: false }
);
const PaymentInbox = dynamicImport(
  () => import("../components/PaymentInbox").then(mod => mod.PaymentInbox),
  { ssr: false }
);
const CreateRoundModal = dynamicImport(
  () => import("../components/CreateRoundModal").then(mod => mod.CreateRoundModal),
  { ssr: false }
);
const ReviewRoundCard = dynamicImport(
  () => import("../components/ReviewRoundCard").then(mod => mod.ReviewRoundCard),
  { ssr: false }
);
const KYCModal = dynamicImport(
  () => import("../components/KYCModal").then(mod => mod.KYCModal),
  { ssr: false }
);
const VoteCard = dynamicImport(
  () => import("../components/VoteCard").then(mod => mod.VoteCard),
  { ssr: false }
);
const CreateProposalModal = dynamicImport(
  () => import("../components/CreateProposalModal").then(mod => mod.CreateProposalModal),
  { ssr: false }
);
const PayrollCard = dynamicImport(
  () => import("../components/PayrollCard").then(mod => mod.PayrollCard),
  { ssr: false }
);
const CreatePayrollModal = dynamicImport(
  () => import("../components/CreatePayrollModal").then(mod => mod.CreatePayrollModal),
  { ssr: false }
);

export default function Home() {
  const { isConnected, address } = useAccount();
  const { data: count, refetch } = useRequestCount();
  const { data: roundCount, refetch: refetchRounds } = useRoundCount();
  const { data: voteCount, refetch: refetchVotes }       = useVoteProposalCount();
  const { data: payrollCount, refetch: refetchPayroll }  = usePayrollPeriodCount();
  const { data: isVerified, refetch: refetchVerified }   = useIsVerified(address);
  const [showCreate,          setShowCreate]          = useState(false);
  const [showSendPayment,     setShowSendPayment]     = useState(false);
  const [showCreateRound,     setShowCreateRound]     = useState(false);
  const [showKYC,             setShowKYC]             = useState(false);
  const [showCreateProposal,  setShowCreateProposal]  = useState(false);
  const [showCreatePayroll,   setShowCreatePayroll]   = useState(false);

  const requestIds = count
    ? Array.from({ length: Number(count) }, (_, i) => BigInt(i)).reverse()
    : [];
  const roundIds = roundCount
    ? Array.from({ length: Number(roundCount) }, (_, i) => BigInt(i)).reverse()
    : [];
  const voteIds = voteCount
    ? Array.from({ length: Number(voteCount) }, (_, i) => BigInt(i)).reverse()
    : [];
  const payrollIds = payrollCount
    ? Array.from({ length: Number(payrollCount) }, (_, i) => BigInt(i)).reverse()
    : [];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-40 w-full"
        style={{ background: "rgba(3,3,8,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
              style={{ background: "linear-gradient(135deg,#7c3aed,#22d3ee)" }}>
              🔐
            </div>
            <div>
              <span className="font-bold text-white text-sm">Sealect</span>
              <span className="ml-2 text-xs text-slate-500 hidden sm:inline">by Fhenix</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="https://tundra-icon-9ac.notion.site/Sealect-Confidential-Decision-Platform-33310f526b26804baeb0d9355eeae6ee" target="_blank" rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Docs <ExternalLink size={11} />
            </a>
            <WalletButton />
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 pb-24">
        <HeroSection />

        {/* Identity Gate — full section */}
        {isConnected && (
          <motion.section
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Compliance Gate</h2>
                <p className="text-sm text-slate-500 mt-0.5">FHE-verified identity · age &amp; jurisdiction checked on encrypted data</p>
              </div>
            </div>

            <div
              className="relative overflow-hidden rounded-2xl p-6"
              style={
                isVerified
                  ? { background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }
                  : { background: "linear-gradient(135deg,rgba(139,92,246,0.10) 0%,rgba(34,211,238,0.06) 100%)", border: "1px solid rgba(139,92,246,0.25)" }
              }
            >
              {/* Decorative background icon */}
              {!isVerified && (
                <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-[96px] opacity-[0.04] select-none">🛡️</div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={
                      isVerified
                        ? { background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }
                        : { background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }
                    }
                  >
                    {isVerified
                      ? <ShieldCheck size={22} className="text-emerald-400" />
                      : <ShieldAlert size={22} className="text-violet-400" />}
                  </div>

                  <div>
                    <p className={`text-base font-bold ${isVerified ? "text-emerald-300" : "text-white"}`}>
                      {isVerified ? "Identity Verified" : "Verify Your Identity"}
                    </p>
                    <p className="text-sm text-slate-400 mt-0.5 max-w-lg">
                      {isVerified
                        ? "Your FHE on-chain permit is active. Age and jurisdiction were checked on ciphertext — your raw values were never revealed."
                        : "Submit encrypted age & jurisdiction. The contract verifies both conditions fully on ciphertext — no data ever leaves your browser in plaintext."}
                    </p>

                    {/* 2-step pill row — only when not yet verified */}
                    {!isVerified && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-violet-300 rounded-full px-3 py-1"
                          style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                          <span className="w-4 h-4 rounded-full bg-violet-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                          Encrypt &amp; Submit
                        </span>
                        <span className="text-slate-700 text-xs">→</span>
                        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 rounded-full px-3 py-1"
                          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-[10px] font-bold">2</span>
                          Reveal &amp; Claim
                        </span>
                        <span className="text-xs text-slate-600 ml-1">· two-step · no raw data on-chain</span>
                      </div>
                    )}
                  </div>
                </div>

                {!isVerified ? (
                  <button
                    onClick={() => setShowKYC(true)}
                    className="btn-primary flex-shrink-0 flex items-center gap-2"
                  >
                    <ShieldCheck size={15} /> Get Verified
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-emerald-400 font-semibold flex-shrink-0">
                    <ShieldCheck size={16} /> Verified
                  </div>
                )}
              </div>
            </div>
          </motion.section>
        )}

        {/* Decision Requests */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Decision Requests</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {requestIds.length} request{requestIds.length !== 1 ? "s" : ""} · all proposals encrypted
              </p>
            </div>
            {isConnected && (
              <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
                <Plus size={15} /> New Request
              </button>
            )}
          </div>

          {requestIds.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center py-20">
              <div className="text-4xl mb-4">🔐</div>
              <p className="text-lg font-semibold text-slate-300 mb-2">No requests yet</p>
              <p className="text-sm text-slate-500 mb-6">
                Be the first to post a confidential vendor selection request on Sealect.
              </p>
              {isConnected ? (
                <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
                  <Plus size={15} /> Create First Request
                </button>
              ) : (
                <p className="text-sm text-slate-600">Connect your wallet to get started.</p>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {requestIds.map((id, i) => (
                <RequestCard key={id.toString()} requestId={id} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Blind Review Rounds */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Blind Review Rounds</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {roundIds.length} round{roundIds.length !== 1 ? "s" : ""} · review scores FHE-encrypted
              </p>
            </div>
            {isConnected && (
              <button onClick={() => setShowCreateRound(true)} className="btn-primary flex items-center gap-2">
                <Plus size={15} /> New Round
              </button>
            )}
          </div>

          {roundIds.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center py-20">
              <div className="text-4xl mb-4">🔬</div>
              <p className="text-lg font-semibold text-slate-300 mb-2">No review rounds yet</p>
              <p className="text-sm text-slate-500 mb-6">
                Create a blind peer review round — grant committees, DAO proposals, academic submissions.
              </p>
              {isConnected ? (
                <button onClick={() => setShowCreateRound(true)} className="btn-primary inline-flex items-center gap-2">
                  <FileText size={15} /> Create First Round
                </button>
              ) : (
                <p className="text-sm text-slate-600">Connect your wallet to get started.</p>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {roundIds.map((id, i) => (
                <ReviewRoundCard key={id.toString()} roundId={id} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* DAO Voting */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">DAO Voting</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {voteIds.length} proposal{voteIds.length !== 1 ? "s" : ""} · ballots FHE-encrypted · tally revealed on-chain
              </p>
            </div>
            {isConnected && (
              <button onClick={() => setShowCreateProposal(true)} className="btn-primary flex items-center gap-2">
                <Plus size={15} /> New Proposal
              </button>
            )}
          </div>

          {voteIds.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center py-20">
              <div className="text-4xl mb-4">🗳️</div>
              <p className="text-lg font-semibold text-slate-300 mb-2">No proposals yet</p>
              <p className="text-sm text-slate-500 mb-6">
                Create a DAO proposal — votes accumulate homomorphically, result revealed on-chain via{" "}
                <span className="text-violet-400 font-mono text-xs">FHE.decrypt</span>.
              </p>
              {isConnected ? (
                <button onClick={() => setShowCreateProposal(true)} className="btn-primary inline-flex items-center gap-2">
                  <Radio size={15} /> Create First Proposal
                </button>
              ) : (
                <p className="text-sm text-slate-600">Connect your wallet to get started.</p>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {voteIds.map((id, i) => (
                <VoteCard key={id.toString()} proposalId={id} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Pay Equity */}
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">Pay Equity Engine</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {payrollIds.length} period{payrollIds.length !== 1 ? "s" : ""} · salaries FHE-encrypted · cert result on-chain
              </p>
            </div>
            {isConnected && (
              <button onClick={() => setShowCreatePayroll(true)} className="btn-primary flex items-center gap-2">
                <Plus size={15} /> New Period
              </button>
            )}
          </div>

          {payrollIds.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card text-center py-20">
              <div className="text-4xl mb-4">💼</div>
              <p className="text-lg font-semibold text-slate-300 mb-2">No pay periods yet</p>
              <p className="text-sm text-slate-500 mb-6">
                Create a pay period — employer enrolls team, employees submit encrypted salaries,
                contract verifies min wage + pay equity fully on ciphertext.
              </p>
              {isConnected ? (
                <button onClick={() => setShowCreatePayroll(true)} className="btn-primary inline-flex items-center gap-2">
                  <DollarSign size={15} /> Create First Period
                </button>
              ) : (
                <p className="text-sm text-slate-600">Connect your wallet to get started.</p>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {payrollIds.map((id, i) => (
                <PayrollCard key={id.toString()} periodId={id} index={i} />
              ))}
            </div>
          )}
        </section>

        {/* Confidential Payments */}
        {isConnected && address && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Confidential Payments</h2>
                <p className="text-sm text-slate-500 mt-0.5">Send ETH with FHE-encrypted amounts · powered by Privara</p>
              </div>
              <button onClick={() => setShowSendPayment(true)} className="btn-emerald flex items-center gap-2">
                <Send size={15} /> Send Private
              </button>
            </div>
            <div className="glass-card">
              <PaymentInbox address={address} />
            </div>
          </section>
        )}

        <footer className="mt-24 text-center space-y-3">
          <div className="divider max-w-xs mx-auto" />
          <div className="flex items-center justify-center gap-6 text-xs text-slate-600">
            <a href="https://fhenix.io" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">Fhenix</a>
            <a href="https://cofhe-docs.fhenix.zone" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">CoFHE Docs</a>
            <a href="https://github.com/FhenixProtocol/awesome-fhenix" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">GitHub</a>
            <a href="https://reineira.xyz/docs" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors">Privara</a>
          </div>
          <p className="text-xs text-slate-700">Arbitrum Sepolia · Sealect · Fhenix CoFHE</p>
        </footer>
      </main>

      {showCreate && <CreateRequestModal onClose={() => setShowCreate(false)} onCreated={() => refetch()} />}
      {showSendPayment && <SendPaymentModal onClose={() => setShowSendPayment(false)} />}
      {showCreateRound && <CreateRoundModal onClose={() => setShowCreateRound(false)} onCreated={() => { refetchRounds(); setShowCreateRound(false); }} />}
      {showKYC && <KYCModal onClose={() => setShowKYC(false)} onVerified={() => refetchVerified()} />}
      {showCreateProposal && (
        <CreateProposalModal
          onClose={() => setShowCreateProposal(false)}
          onCreated={() => { refetchVotes(); setShowCreateProposal(false); }}
        />
      )}
      {showCreatePayroll && (
        <CreatePayrollModal
          onClose={() => setShowCreatePayroll(false)}
          onCreated={() => { refetchPayroll(); setShowCreatePayroll(false); }}
        />
      )}
    </div>
  );
}
