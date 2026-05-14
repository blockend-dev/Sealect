"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { useCallback } from "react";
import { PAYROLL_ABI, PAYROLL_ADDRESS } from "../lib/contracts";
import { useEncryptBid } from "./useCofhe";
import { arbitrumSepolia } from "../lib/wagmi";

const CHAIN_ID = arbitrumSepolia.id;

//  Read hooks 

export function usePayrollPeriodCount() {
  return useReadContract({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "periodCount",
    query: { refetchInterval: 15_000 },
  });
}

export function usePayrollPeriod(periodId: bigint) {
  return useReadContract({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "getPeriod",
    args: [periodId],
    query: { refetchInterval: 8_000 },
  });
}

export function useIsEnrolled(periodId: bigint, employee: `0x${string}` | undefined) {
  return useReadContract({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "isEnrolled",
    args: [periodId, employee!],
    query: { enabled: !!employee },
  });
}

export function useHasSubmittedSalary(periodId: bigint, employee: `0x${string}` | undefined) {
  return useReadContract({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "hasSubmitted",
    args: [periodId, employee!],
    query: { enabled: !!employee },
  });
}

export function useEmployeeGroup(periodId: bigint, employee: `0x${string}` | undefined) {
  return useReadContract({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "employeeGroup",
    args: [periodId, employee!],
    query: { enabled: !!employee },
  });
}

// Returns the ctHash of an employee's salary — use with useDecryptForView
export function useSalaryHandle(periodId: bigint, employee: `0x${string}` | undefined) {
  return useReadContract({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "salaryHandle",
    args: [periodId, employee!],
    query: { enabled: !!employee },
  });
}

// Returns the ctHash of total payroll — employer decrypts after certification
export function useTotalPayrollHandle(periodId: bigint) {
  return useReadContract({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "getTotalPayrollHandle",
    args: [periodId],
  });
}

export function useGroupZeroHandle(periodId: bigint) {
  return useReadContract({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "getGroupZeroHandle",
    args: [periodId],
  });
}

export function useGroupOneHandle(periodId: bigint) {
  return useReadContract({
    address: PAYROLL_ADDRESS,
    abi: PAYROLL_ABI,
    functionName: "getGroupOneHandle",
    args: [periodId],
  });
}

//  Create period 

export function useCreatePayrollPeriod() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const createPeriod = useCallback(
    async (name: string, minWage: bigint) => {
      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;
      await writeContractAsync({
        address: PAYROLL_ADDRESS,
        abi: PAYROLL_ABI,
        functionName: "createPeriod",
        args: [name, minWage],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [writeContractAsync, publicClient],
  );

  return { createPeriod, isPending, isConfirming, isSuccess };
}

//  Enroll employee 

export function useEnrollEmployee() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const enrollEmployee = useCallback(
    async (periodId: bigint, employee: `0x${string}`, group: number) => {
      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;
      await writeContractAsync({
        address: PAYROLL_ADDRESS,
        abi: PAYROLL_ABI,
        functionName: "enrollEmployee",
        args: [periodId, employee, group],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [writeContractAsync, publicClient],
  );

  return { enrollEmployee, isPending, isConfirming, isSuccess };
}

//  Submit encrypted salary 

export function useSubmitPayrollSalary() {
  const { encryptBid, steps, isEncrypting, resetSteps } = useEncryptBid();
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const submitSalary = useCallback(
    async (periodId: bigint, salaryWei: bigint) => {
      const encSalary = await encryptBid(salaryWei);
      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;
      await writeContractAsync({
        address: PAYROLL_ADDRESS,
        abi: PAYROLL_ABI,
        functionName: "submitSalary",
        args: [
          periodId,
          {
            ctHash: encSalary.ctHash,
            securityZone: encSalary.securityZone,
            utype: encSalary.utype,
            signature: encSalary.signature as `0x${string}`,
          },
        ],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [encryptBid, writeContractAsync, publicClient],
  );

  return { submitSalary, steps, isEncrypting, isPending, isConfirming, isSuccess, resetSteps };
}

//  Request certification 

export function useRequestPayrollCertification() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const requestCertification = useCallback(
    async (periodId: bigint) => {
      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;
      await writeContractAsync({
        address: PAYROLL_ADDRESS,
        abi: PAYROLL_ABI,
        functionName: "requestCertification",
        args: [periodId],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [writeContractAsync, publicClient],
  );

  return { requestCertification, isPending, isConfirming, isSuccess };
}

//  Certify 

export function useCertifyPayroll() {
  const { writeContractAsync, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const publicClient = usePublicClient();

  const certify = useCallback(
    async (periodId: bigint) => {
      const fees = await publicClient!.estimateFeesPerGas();
      const maxFeePerGas = fees.maxFeePerGas! * 4n / 3n;
      await writeContractAsync({
        address: PAYROLL_ADDRESS,
        abi: PAYROLL_ABI,
        functionName: "certify",
        args: [periodId],
        chainId: CHAIN_ID,
        maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas ?? BigInt(1_500_000),
      });
    },
    [writeContractAsync, publicClient],
  );

  return { certify, isPending, isConfirming, isSuccess };
}
