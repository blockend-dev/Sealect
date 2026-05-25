import { createCofheConfig, createCofheClient } from "@cofhe/sdk/node";
import { Encryptable } from "@cofhe/sdk";
import { arbSepolia } from "@cofhe/sdk/chains";
import { publicClient, walletClient } from "./chain.js";
import type { CofheClient } from "@cofhe/sdk";

let _client: CofheClient | null = null;

export async function getCofheClient(): Promise<CofheClient> {
  if (_client) return _client;
  const config = createCofheConfig({ supportedChains: [arbSepolia] });
  _client = createCofheClient(config);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await _client.connect(publicClient as any, walletClient as any);
  return _client;
}

type EncInput = { ctHash: bigint; securityZone: number; utype: number; signature: `0x${string}` };

export async function encryptUint128(value: bigint): Promise<EncInput> {
  const client = await getCofheClient();
  const [enc] = await client.encryptInputs([Encryptable.uint128(value)]).execute();
  return enc as EncInput;
}

export async function encryptMany(...values: bigint[]): Promise<EncInput[]> {
  const client = await getCofheClient();
  const encrypted = await client.encryptInputs(values.map(v => Encryptable.uint128(v))).execute();
  return encrypted as EncInput[];
}
