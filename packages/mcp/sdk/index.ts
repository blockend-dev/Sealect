/**
 * sealect-fhe — typed async helpers for all six Sealect contracts.
 * Prerequisites: PRIVATE_KEY and (optionally) RPC_URL env vars.
 */

export { encryptUint128, encryptMany, getCofheClient } from "../src/fhe.js";
export { publicClient, walletClient, account } from "../src/chain.js";
export {
  ADDRESSES,
  VOTE_ABI, PAYROLL_ABI, VENDOR_ABI, PAYMENT_ABI, REVIEW_ABI, KYC_ABI,
} from "../src/contracts.js";

import { publicClient, walletClient } from "../src/chain.js";
import { encryptUint128, encryptMany } from "../src/fhe.js";
import { ADDRESSES, VOTE_ABI, PAYROLL_ABI, VENDOR_ABI, PAYMENT_ABI, REVIEW_ABI, KYC_ABI } from "../src/contracts.js";

type Hash = `0x${string}`;
type TxResult = { hash: Hash; status: "success" | "reverted" };

async function read<T>(abi: readonly unknown[], address: Hash, fn: string, args: unknown[] = []) {
  return publicClient.readContract({ address, abi: abi as never, functionName: fn, args }) as Promise<T>;
}

async function write(abi: readonly unknown[], address: Hash, fn: string, args: unknown[], value?: bigint): Promise<TxResult> {
  const hash = await walletClient.writeContract({ address, abi: abi as never, functionName: fn, args, value } as never);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, status: receipt.status };
}

// Vote 

export async function createProposal(title: string, description: string, durationSeconds: number, quorum: number) {
  return write(VOTE_ABI, ADDRESSES.vote, "createProposal", [title, description, BigInt(durationSeconds), BigInt(quorum)]);
}

export async function castEncryptedBallot(proposalId: number, voteYes: boolean) {
  const encVote = await encryptUint128(voteYes ? 1n : 0n);
  return write(VOTE_ABI, ADDRESSES.vote, "castBallot", [BigInt(proposalId), encVote]);
}

export async function requestVoteDecryption(proposalId: number) {
  return write(VOTE_ABI, ADDRESSES.vote, "requestDecryption", [BigInt(proposalId)]);
}

export async function settleProposal(proposalId: number) {
  return write(VOTE_ABI, ADDRESSES.vote, "settle", [BigInt(proposalId)]);
}

export async function getProposal(proposalId: number) {
  const p = await read<readonly unknown[]>(VOTE_ABI, ADDRESSES.vote, "getProposal", [BigInt(proposalId)]);
  return { proposer: p[0] as Hash, title: p[1] as string, description: p[2] as string, deadline: p[3] as bigint, quorum: p[4] as bigint, totalVoters: p[5] as bigint, decryptRequested: p[6] as boolean, settled: p[7] as boolean, passed: p[8] as boolean, revealedYes: p[9] as bigint };
}

//  Payroll 

export async function createPayrollPeriod(name: string, minWageBigInt: bigint) {
  return write(PAYROLL_ABI, ADDRESSES.payroll, "createPeriod", [name, minWageBigInt]);
}

export async function enrollEmployee(periodId: number, employee: Hash, group: number) {
  return write(PAYROLL_ABI, ADDRESSES.payroll, "enrollEmployee", [BigInt(periodId), employee, group]);
}

export async function submitEncryptedSalary(periodId: number, salaryWei: bigint) {
  const encSalary = await encryptUint128(salaryWei);
  return write(PAYROLL_ABI, ADDRESSES.payroll, "submitSalary", [BigInt(periodId), encSalary]);
}

export async function requestPayrollCertification(periodId: number) {
  return write(PAYROLL_ABI, ADDRESSES.payroll, "requestCertification", [BigInt(periodId)]);
}

export async function certifyPayroll(periodId: number) {
  return write(PAYROLL_ABI, ADDRESSES.payroll, "certify", [BigInt(periodId)]);
}

//  Vendor 

export async function createVendorRequest(title: string, durationSeconds: number, depositWei: bigint, wPrice: number, wQuality: number, wDelivery: number) {
  return write(VENDOR_ABI, ADDRESSES.vendor, "createRequest", [title, BigInt(durationSeconds), depositWei, wPrice, wQuality, wDelivery]);
}

export async function submitVendorProposal(id: number, price: number, quality: number, delivery: number, depositWei: bigint) {
  const [encPrice, encQuality, encDelivery] = await encryptMany(BigInt(price), BigInt(quality), BigInt(delivery));
  return write(VENDOR_ABI, ADDRESSES.vendor, "submitProposal", [BigInt(id), encPrice, encQuality, encDelivery], depositWei);
}

export async function selectVendorWinner(id: number, winner: Hash) {
  return write(VENDOR_ABI, ADDRESSES.vendor, "selectVendor", [BigInt(id), winner]);
}

//  Payment 

export async function sendConfidentialPayment(recipient: Hash, amount: bigint, escrowWei: bigint, refHash: Hash) {
  const encAmount = await encryptUint128(amount);
  return write(PAYMENT_ABI, ADDRESSES.payment, "sendPayment", [recipient, encAmount, refHash], escrowWei);
}

export async function claimPayment(id: number) {
  return write(PAYMENT_ABI, ADDRESSES.payment, "claimPayment", [BigInt(id)]);
}

export async function getPaymentInfo(id: number) {
  const p = await read<readonly unknown[]>(PAYMENT_ABI, ADDRESSES.payment, "getPaymentInfo", [BigInt(id)]);
  return { sender: p[0] as Hash, recipient: p[1] as Hash, escrowed: p[2] as bigint, timestamp: p[3] as bigint, claimed: p[4] as boolean, refHash: p[5] as Hash };
}

//  Review 

export async function createReviewRound(title: string, description: string, durationSeconds: number, wImpact: number, wFeasibility: number, wInnovation: number) {
  return write(REVIEW_ABI, ADDRESSES.review, "createRound", [title, description, BigInt(durationSeconds), wImpact, wFeasibility, wInnovation]);
}

export async function addReviewProposal(roundId: number, title: string, summary: string) {
  return write(REVIEW_ABI, ADDRESSES.review, "addProposal", [BigInt(roundId), title, summary]);
}

export async function submitEncryptedReview(roundId: number, proposalId: number, impact: number, feasibility: number, innovation: number) {
  const [encImpact, encFeasibility, encInnovation] = await encryptMany(BigInt(impact), BigInt(feasibility), BigInt(innovation));
  return write(REVIEW_ABI, ADDRESSES.review, "submitReview", [BigInt(roundId), BigInt(proposalId), encImpact, encFeasibility, encInnovation]);
}

export async function finalizeReviewRound(roundId: number, winnerProposalId: number) {
  return write(REVIEW_ABI, ADDRESSES.review, "finalizeRound", [BigInt(roundId), BigInt(winnerProposalId)]);
}

//  KYC 

export async function isKycVerified(address: Hash) {
  return read<boolean>(KYC_ABI, ADDRESSES.kyc, "isVerified", [address]);
}

export async function submitKyc(age: number, jurisdiction: number) {
  const [encAge, encJurisdiction] = await encryptMany(BigInt(age), BigInt(jurisdiction));
  return write(KYC_ABI, ADDRESSES.kyc, "submitKYC", [encAge, encJurisdiction]);
}

export async function claimKycVerified(decryptedResult: bigint) {
  return write(KYC_ABI, ADDRESSES.kyc, "claimVerified", [decryptedResult]);
}
