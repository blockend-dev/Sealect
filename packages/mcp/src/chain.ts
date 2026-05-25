import "dotenv/config";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";

const rpcUrl = process.env.RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc";
const privateKey = process.env.PRIVATE_KEY as `0x${string}`;

if (!privateKey) throw new Error("PRIVATE_KEY env var is required");

export const account = privateKeyToAccount(privateKey);

export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(rpcUrl),
});

export const walletClient = createWalletClient({
  account,
  chain: arbitrumSepolia,
  transport: http(rpcUrl),
});
