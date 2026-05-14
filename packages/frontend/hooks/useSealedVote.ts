"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useCallback } from "react";
import { SEALED_VOTE_ABI, SEALED_VOTE_ADDRESS } from "../lib/contracts";
import { useEncryptBid } from "./useCofhe";
import { arbitrumSepolia } from "../lib/wagmi";

const CHAIN_ID = arbitrumSepolia.id;

//  Read hooks 

export function useVoteProposalCount() {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: "proposalCount",
    query: { refetchInterval: 15_000 },
  });
}

export function useVoteProposal(proposalId: bigint) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: "getProposal",
    args: [proposalId],
    query: { refetchInterval: 8_000 },
  });
}

export function useHasVotedProposal(proposalId: bigint, voter: `0x${string}` | undefined) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: "hasVoted",
    args: [proposalId, voter!],
    query: { enabled: !!voter },
  });
}

//  Create proposal 

export function useCreateVoteProposal() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const createProposal = useCallback(
    async (title: string, description: string, durationHours: number, quorum: number) => {
      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;

      await writeContractAsync({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: "createProposal",
        args: [title, description, BigInt(durationHours * 3600), BigInt(quorum)],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [writeContractAsync, publicClient],
  );

  return { createProposal, isPending, isConfirming, isSuccess };
}

//  Cast encrypted ballot 
// Reuses single-value encryption from useEncryptBid.
// Caller passes 1n (yes) or 0n (no) — contract normalizes via FHE.gt+FHE.select.

export function useCastBallot() {
  const { encryptBid, steps, isEncrypting, resetSteps } = useEncryptBid();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const castBallot = useCallback(
    async (proposalId: bigint, vote: boolean) => {
      const encVote = await encryptBid(vote ? 1n : 0n);

      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;

      await writeContractAsync({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: "castBallot",
        args: [
          proposalId,
          {
            ctHash: encVote.ctHash,
            securityZone: encVote.securityZone,
            utype: encVote.utype,
            signature: encVote.signature as `0x${string}`,
          },
        ],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [encryptBid, writeContractAsync, publicClient],
  );

  const reset = useCallback(() => resetSteps(), [resetSteps]);

  return { castBallot, steps, isEncrypting, isPending, isConfirming, isSuccess, reset };
}

//  Request on-chain decryption (after deadline) 

export function useRequestVoteDecryption() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const requestDecryption = useCallback(
    async (proposalId: bigint) => {
      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;

      await writeContractAsync({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: "requestDecryption",
        args: [proposalId],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [writeContractAsync, publicClient],
  );

  return { requestDecryption, isPending, isConfirming, isSuccess };
}

//  Settle (reads on-chain decrypt result and finalizes) 

export function useSettleVote() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const settle = useCallback(
    async (proposalId: bigint) => {
      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;

      await writeContractAsync({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: "settle",
        args: [proposalId],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [writeContractAsync, publicClient],
  );

  return { settle, isPending, isConfirming, isSuccess };
}
