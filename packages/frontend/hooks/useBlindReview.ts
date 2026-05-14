"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useState, useCallback } from "react";
import { BLIND_REVIEW_ABI, BLIND_REVIEW_ADDRESS } from "../lib/contracts";
import { useEncryptProposal } from "./useCofhe";
import { arbitrumSepolia } from "../lib/wagmi";

const CHAIN_ID = arbitrumSepolia.id;

//  Read hooks ─

export function useRoundCount() {
  return useReadContract({
    address: BLIND_REVIEW_ADDRESS,
    abi: BLIND_REVIEW_ABI,
    functionName: "roundCount",
    query: { refetchInterval: 15_000 },
  });
}

export function useRoundInfo(roundId: bigint) {
  return useReadContract({
    address: BLIND_REVIEW_ADDRESS,
    abi: BLIND_REVIEW_ABI,
    functionName: "getRound",
    args: [roundId],
    query: { refetchInterval: 10_000 },
  });
}

export function useProposalInfo(roundId: bigint, proposalId: bigint) {
  return useReadContract({
    address: BLIND_REVIEW_ADDRESS,
    abi: BLIND_REVIEW_ABI,
    functionName: "getProposal",
    args: [roundId, proposalId],
    query: { refetchInterval: 10_000 },
  });
}

export function useProposalScoreHandle(
  roundId: bigint,
  proposalId: bigint,
  enabled = false,
) {
  return useReadContract({
    address: BLIND_REVIEW_ADDRESS,
    abi: BLIND_REVIEW_ABI,
    functionName: "getProposalScoreHandle",
    args: [roundId, proposalId],
    query: { enabled },
  });
}

export function useHasReviewedProposal(
  roundId: bigint,
  proposalId: bigint,
  reviewer: `0x${string}` | undefined,
) {
  return useReadContract({
    address: BLIND_REVIEW_ADDRESS,
    abi: BLIND_REVIEW_ABI,
    functionName: "hasReviewed",
    args: [roundId, proposalId, reviewer!],
    query: { enabled: !!reviewer },
  });
}

//  Create review round 

export function useCreateRound() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const createRound = useCallback(
    async (
      title: string,
      description: string,
      durationHours: number,
      wImpact: number,
      wFeasibility: number,
      wInnovation: number,
    ) => {
      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;

      await writeContractAsync({
        address: BLIND_REVIEW_ADDRESS,
        abi: BLIND_REVIEW_ABI,
        functionName: "createRound",
        args: [title, description, BigInt(durationHours * 3600), wImpact, wFeasibility, wInnovation],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [writeContractAsync, publicClient],
  );

  return { createRound, isPending, isConfirming, isSuccess };
}

//  Add proposal to a round 

export function useAddProposal() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const addProposal = useCallback(
    async (roundId: bigint, title: string, summary: string) => {
      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;

      await writeContractAsync({
        address: BLIND_REVIEW_ADDRESS,
        abi: BLIND_REVIEW_ABI,
        functionName: "addProposal",
        args: [roundId, title, summary],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [writeContractAsync, publicClient],
  );

  return { addProposal, isPending, isConfirming, isSuccess };
}

//  Submit encrypted review (impact, feasibility, innovation) ─

export function useSubmitReview() {
  const { encryptProposal, steps, isEncrypting, resetSteps } = useEncryptProposal();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  const submitReview = useCallback(
    async (
      roundId: bigint,
      proposalId: bigint,
      impact: number,      // 0-100
      feasibility: number, // 0-100
      innovation: number,  // 0-100
    ) => {
      setError(null);
      // Reuse 3-factor encryption — impact/feasibility/innovation map to price/quality/delivery slots
      const { encPrice: encImpact, encQuality: encFeasibility, encDelivery: encInnovation } =
        await encryptProposal(impact, feasibility, innovation);

      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;

      await writeContractAsync({
        address: BLIND_REVIEW_ADDRESS,
        abi: BLIND_REVIEW_ABI,
        functionName: "submitReview",
        args: [
          roundId,
          proposalId,
          { ctHash: encImpact.ctHash,      securityZone: encImpact.securityZone,      utype: encImpact.utype,      signature: encImpact.signature      as `0x${string}` },
          { ctHash: encFeasibility.ctHash, securityZone: encFeasibility.securityZone, utype: encFeasibility.utype, signature: encFeasibility.signature as `0x${string}` },
          { ctHash: encInnovation.ctHash,  securityZone: encInnovation.securityZone,  utype: encInnovation.utype,  signature: encInnovation.signature  as `0x${string}` },
        ],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [encryptProposal, writeContractAsync, publicClient],
  );

  const reset = useCallback(() => { resetSteps(); setError(null); }, [resetSteps]);

  return { submitReview, steps, isEncrypting, isPending, isConfirming, isSuccess, error, reset };
}

//  Finalize round (organizer only, after deadline) 

export function useFinalizeRound() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const finalizeRound = useCallback(
    async (roundId: bigint, winnerProposalId: bigint) => {
      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;

      await writeContractAsync({
        address: BLIND_REVIEW_ADDRESS,
        abi: BLIND_REVIEW_ABI,
        functionName: "finalizeRound",
        args: [roundId, winnerProposalId],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [writeContractAsync, publicClient],
  );

  return { finalizeRound, isPending, isConfirming, isSuccess };
}
