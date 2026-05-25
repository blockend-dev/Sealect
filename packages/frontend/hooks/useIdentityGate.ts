"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useState, useCallback } from "react";
import { IDENTITY_GATE_ABI, IDENTITY_GATE_ADDRESS } from "../lib/contracts";
import { useEncryptKYC, useDecryptForView } from "./useCofhe";
import { arbitrumSepolia } from "../lib/wagmi";

const CHAIN_ID = arbitrumSepolia.id;

//  Read hooks 

export function useIsVerified(address: `0x${string}` | undefined) {
  return useReadContract({
    address: IDENTITY_GATE_ADDRESS,
    abi: IDENTITY_GATE_ABI,
    functionName: "isVerified",
    args: [address!],
    query: { enabled: !!address, refetchInterval: 15_000 },
  });
}

export function useVerifiedAt(address: `0x${string}` | undefined) {
  return useReadContract({
    address: IDENTITY_GATE_ADDRESS,
    abi: IDENTITY_GATE_ABI,
    functionName: "verifiedAt",
    args: [address!],
    query: { enabled: !!address },
  });
}

export function useMinAge() {
  return useReadContract({
    address: IDENTITY_GATE_ADDRESS,
    abi: IDENTITY_GATE_ABI,
    functionName: "minAge",
  });
}

export function useKycResultHandle(address: `0x${string}` | undefined) {
  return useReadContract({
    address: IDENTITY_GATE_ADDRESS,
    abi: IDENTITY_GATE_ABI,
    functionName: "kycResultHandle",
    args: [address!],
    query: { enabled: !!address },
  });
}

//  Two-step KYC flow 
//
// Step 1 — submitKYC: encrypts age + jurisdiction, computes FHE condition on-chain,
//           stores encrypted result handle, grants ACL to user.
//
// Step 2 — claimVerified: user decrypts result off-chain via CoFHE permit,
//           submits plaintext value (1 = pass) to finalise verification.

export function useSubmitKYC() {
  const { encryptKYC, steps, isEncrypting, resetSteps } = useEncryptKYC();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  const submitKYC = useCallback(
    async (age: number, jurisdiction: number) => {
      setError(null);
      const { encAge, encJurisdiction } = await encryptKYC(age, jurisdiction);

      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;

      await writeContractAsync({
        address: IDENTITY_GATE_ADDRESS,
        abi: IDENTITY_GATE_ABI,
        functionName: "submitKYC",
        args: [
          { ctHash: encAge.ctHash,          securityZone: encAge.securityZone,          utype: encAge.utype,          signature: encAge.signature          as `0x${string}` },
          { ctHash: encJurisdiction.ctHash, securityZone: encJurisdiction.securityZone, utype: encJurisdiction.utype, signature: encJurisdiction.signature as `0x${string}` },
        ],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [encryptKYC, writeContractAsync, publicClient],
  );

  const reset = useCallback(() => { resetSteps(); setError(null); }, [resetSteps]);

  return { submitKYC, steps, isEncrypting, isPending, isConfirming, isSuccess, error, reset };
}

export function useClaimVerified() {
  const { decrypt, value: decryptedScore, isDecrypting, error: decryptError, reset: resetDecrypt } = useDecryptForView();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const [error, setError] = useState<string | null>(null);
  const publicClient = usePublicClient();

  const claimVerified = useCallback(
    async (ctHash: bigint) => {
      setError(null);
      // Decrypt the KYC result stored on-chain using a CoFHE self permit
      const result = await decrypt(ctHash);
      if (result !== 1n) throw new Error("KYC conditions not met — age < 18 or restricted jurisdiction.");

      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;

      await writeContractAsync({
        address: IDENTITY_GATE_ADDRESS,
        abi: IDENTITY_GATE_ABI,
        functionName: "claimVerified",
        args: [1n],
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [decrypt, writeContractAsync, publicClient],
  );

  const reset = useCallback(() => { resetDecrypt(); setError(null); }, [resetDecrypt]);

  return {
    claimVerified,
    decryptedScore,
    isDecrypting,
    isPending,
    isConfirming,
    isSuccess,
    error: error ?? decryptError,
    reset,
  };
}
