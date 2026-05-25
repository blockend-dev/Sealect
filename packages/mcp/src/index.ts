import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  ADDRESSES,
  VOTE_ABI, PAYROLL_ABI, VENDOR_ABI, PAYMENT_ABI, REVIEW_ABI, KYC_ABI,
} from "./contracts.js";
import { publicClient, walletClient, account } from "./chain.js";
import { encryptUint128, encryptMany } from "./fhe.js";

const server = new McpServer({ name: "sealect-mcp", version: "1.0.0" });

//  helpers

function addr() { return account.address; }

async function read<T>(abi: readonly unknown[], address: `0x${string}`, fn: string, args: unknown[] = []) {
  return publicClient.readContract({ address, abi: abi as never, functionName: fn, args }) as Promise<T>;
}

async function write(abi: readonly unknown[], address: `0x${string}`, fn: string, args: unknown[], value?: bigint) {
  const hash = await walletClient.writeContract({ address, abi: abi as never, functionName: fn, args, value } as never);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { hash, status: receipt.status };
}

//  VOTE 

server.tool("vote_list_proposals", "List all governance proposals", {}, async () => {
  const count = await read<bigint>(VOTE_ABI, ADDRESSES.vote, "proposalCount");
  const proposals = await Promise.all(
    Array.from({ length: Number(count) }, (_, i) =>
      read<readonly unknown[]>(VOTE_ABI, ADDRESSES.vote, "getProposal", [BigInt(i + 1)])
        .then(p => ({ id: i + 1, proposer: p[0], title: p[1], description: p[2], deadline: p[3], quorum: p[4], totalVoters: p[5], decryptRequested: p[6], settled: p[7], passed: p[8], revealedYes: p[9] }))
    )
  );
  return { content: [{ type: "text" as const, text: JSON.stringify({ count: Number(count), proposals }, null, 2) }] };
});

server.tool("vote_create_proposal", "Create a new governance proposal",
  { title: z.string(), description: z.string(), durationSeconds: z.number().int().positive(), quorum: z.number().int().min(0).max(100) },
  async ({ title, description, durationSeconds, quorum }) => {
    const result = await write(VOTE_ABI, ADDRESSES.vote, "createProposal", [title, description, BigInt(durationSeconds), BigInt(quorum)]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("vote_cast_ballot", "Cast an encrypted ballot (1 = yes, 0 = no)",
  { proposalId: z.number().int().positive(), vote: z.number().int().min(0).max(1) },
  async ({ proposalId, vote }) => {
    const encVote = await encryptUint128(BigInt(vote));
    const result = await write(VOTE_ABI, ADDRESSES.vote, "castBallot", [BigInt(proposalId), encVote]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("vote_request_decryption", "Request on-chain decryption of a proposal's tally",
  { proposalId: z.number().int().positive() },
  async ({ proposalId }) => {
    const result = await write(VOTE_ABI, ADDRESSES.vote, "requestDecryption", [BigInt(proposalId)]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("vote_settle", "Settle a proposal after decryption has completed",
  { proposalId: z.number().int().positive() },
  async ({ proposalId }) => {
    const result = await write(VOTE_ABI, ADDRESSES.vote, "settle", [BigInt(proposalId)]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

//  PAYROLL 

server.tool("payroll_list_periods", "List all payroll periods", {}, async () => {
  const count = await read<bigint>(PAYROLL_ABI, ADDRESSES.payroll, "periodCount");
  const periods = await Promise.all(
    Array.from({ length: Number(count) }, (_, i) =>
      read<readonly unknown[]>(PAYROLL_ABI, ADDRESSES.payroll, "getPeriod", [BigInt(i + 1)])
        .then(p => ({ id: i + 1, employer: p[0], name: p[1], minWage: p[2], employeeCount: p[3], submittedCount: p[4], groupZeroCount: p[5], groupOneCount: p[6], certificationRequested: p[7], certified: p[8], passed: p[9] }))
    )
  );
  return { content: [{ type: "text" as const, text: JSON.stringify({ count: Number(count), periods }, null, 2) }] };
});

server.tool("payroll_create_period", "Create a new payroll period",
  { name: z.string(), minWage: z.string().describe("Minimum wage as decimal string (wei)") },
  async ({ name, minWage }) => {
    const result = await write(PAYROLL_ABI, ADDRESSES.payroll, "createPeriod", [name, BigInt(minWage)]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("payroll_enroll_employee", "Enroll an employee in a payroll period",
  { periodId: z.number().int().positive(), employee: z.string(), group: z.number().int().min(0).max(255) },
  async ({ periodId, employee, group }) => {
    const result = await write(PAYROLL_ABI, ADDRESSES.payroll, "enrollEmployee", [BigInt(periodId), employee as `0x${string}`, group]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("payroll_submit_salary", "Submit an encrypted salary for the current period",
  { periodId: z.number().int().positive(), salary: z.string().describe("Salary in wei as decimal string") },
  async ({ periodId, salary }) => {
    const encSalary = await encryptUint128(BigInt(salary));
    const result = await write(PAYROLL_ABI, ADDRESSES.payroll, "submitSalary", [BigInt(periodId), encSalary]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("payroll_request_certification", "Request on-chain certification of a period",
  { periodId: z.number().int().positive() },
  async ({ periodId }) => {
    const result = await write(PAYROLL_ABI, ADDRESSES.payroll, "requestCertification", [BigInt(periodId)]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("payroll_certify", "Finalize certification after decryption has completed",
  { periodId: z.number().int().positive() },
  async ({ periodId }) => {
    const result = await write(PAYROLL_ABI, ADDRESSES.payroll, "certify", [BigInt(periodId)]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

//  VENDOR 

server.tool("vendor_list_requests", "List all vendor selection requests", {}, async () => {
  const count = await read<bigint>(VENDOR_ABI, ADDRESSES.vendor, "requestCount");
  const requests = await Promise.all(
    Array.from({ length: Number(count) }, (_, i) =>
      read<readonly unknown[]>(VENDOR_ABI, ADDRESSES.vendor, "getRequest", [BigInt(i + 1)])
        .then(r => ({ id: i + 1, requester: r[0], title: r[1], startTime: r[2], endTime: r[3], bestVendor: r[4], settled: r[5], depositWei: r[6], wPrice: r[7], wQuality: r[8], wDelivery: r[9] }))
    )
  );
  return { content: [{ type: "text" as const, text: JSON.stringify({ count: Number(count), requests }, null, 2) }] };
});

server.tool("vendor_create_request", "Create a vendor selection request",
  { title: z.string(), durationSeconds: z.number().int().positive(), depositWei: z.string(), wPrice: z.number().int().min(0).max(100), wQuality: z.number().int().min(0).max(100), wDelivery: z.number().int().min(0).max(100) },
  async ({ title, durationSeconds, depositWei, wPrice, wQuality, wDelivery }) => {
    const result = await write(VENDOR_ABI, ADDRESSES.vendor, "createRequest", [title, BigInt(durationSeconds), BigInt(depositWei), wPrice, wQuality, wDelivery]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("vendor_submit_proposal", "Submit an encrypted vendor proposal (price, quality, delivery scores)",
  { id: z.number().int().positive(), price: z.number().int().min(0).max(100), quality: z.number().int().min(0).max(100), delivery: z.number().int().min(0).max(100), depositWei: z.string().describe("Must match or exceed the request depositWei") },
  async ({ id, price, quality, delivery, depositWei }) => {
    const [encPrice, encQuality, encDelivery] = await encryptMany(BigInt(price), BigInt(quality), BigInt(delivery));
    const result = await write(VENDOR_ABI, ADDRESSES.vendor, "submitProposal", [BigInt(id), encPrice, encQuality, encDelivery], BigInt(depositWei));
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("vendor_select_winner", "Select the winning vendor for a request",
  { id: z.number().int().positive(), winner: z.string() },
  async ({ id, winner }) => {
    const result = await write(VENDOR_ABI, ADDRESSES.vendor, "selectVendor", [BigInt(id), winner as `0x${string}`]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("vendor_claim_deposit", "Claim deposit refund for a losing vendor proposal",
  { id: z.number().int().positive() },
  async ({ id }) => {
    const result = await write(VENDOR_ABI, ADDRESSES.vendor, "claimDeposit", [BigInt(id)]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

//  PAYMENT

server.tool("payment_list", "List all confidential payments", {}, async () => {
  const count = await read<bigint>(PAYMENT_ABI, ADDRESSES.payment, "paymentCount");
  const payments = await Promise.all(
    Array.from({ length: Number(count) }, (_, i) =>
      read<readonly unknown[]>(PAYMENT_ABI, ADDRESSES.payment, "getPaymentInfo", [BigInt(i + 1)])
        .then(p => ({ id: i + 1, sender: p[0], recipient: p[1], escrowed: p[2], timestamp: p[3], claimed: p[4], refHash: p[5] }))
    )
  );
  return { content: [{ type: "text" as const, text: JSON.stringify({ count: Number(count), payments }, null, 2) }] };
});

server.tool("payment_send", "Send a confidential payment to a recipient",
  { recipient: z.string(), amount: z.string().describe("Encrypted amount value (uint128) as decimal string"), escrowWei: z.string().describe("ETH to lock in escrow (wei)"), refHash: z.string().describe("bytes32 reference hash (0x...)") },
  async ({ recipient, amount, escrowWei, refHash }) => {
    const encAmount = await encryptUint128(BigInt(amount));
    const result = await write(PAYMENT_ABI, ADDRESSES.payment, "sendPayment", [recipient as `0x${string}`, encAmount, refHash as `0x${string}`], BigInt(escrowWei));
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("payment_claim", "Claim a confidential payment by ID",
  { id: z.number().int().positive() },
  async ({ id }) => {
    const result = await write(PAYMENT_ABI, ADDRESSES.payment, "claimPayment", [BigInt(id)]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("payment_get_receivable", "Get pending payment IDs for an address",
  { address: z.string() },
  async ({ address }) => {
    const ids = await read<bigint[]>(PAYMENT_ABI, ADDRESSES.payment, "getReceivable", [address as `0x${string}`]);
    return { content: [{ type: "text" as const, text: JSON.stringify({ address, pendingIds: ids.map(String) }) }] };
  }
);

//  REVIEW 

server.tool("review_list_rounds", "List all blind review rounds", {}, async () => {
  const count = await read<bigint>(REVIEW_ABI, ADDRESSES.review, "roundCount");
  const rounds = await Promise.all(
    Array.from({ length: Number(count) }, (_, i) =>
      read<readonly unknown[]>(REVIEW_ABI, ADDRESSES.review, "getRound", [BigInt(i + 1)])
        .then(r => ({ id: i + 1, organizer: r[0], title: r[1], description: r[2], deadline: r[3], wImpact: r[4], wFeasibility: r[5], wInnovation: r[6], proposalCount: r[7], winnerProposalId: r[8], finalized: r[9] }))
    )
  );
  return { content: [{ type: "text" as const, text: JSON.stringify({ count: Number(count), rounds }, null, 2) }] };
});

server.tool("review_create_round", "Create a new blind review round",
  { title: z.string(), description: z.string(), durationSeconds: z.number().int().positive(), wImpact: z.number().int().min(0).max(100), wFeasibility: z.number().int().min(0).max(100), wInnovation: z.number().int().min(0).max(100) },
  async ({ title, description, durationSeconds, wImpact, wFeasibility, wInnovation }) => {
    const result = await write(REVIEW_ABI, ADDRESSES.review, "createRound", [title, description, BigInt(durationSeconds), wImpact, wFeasibility, wInnovation]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("review_add_proposal", "Add a proposal to a review round",
  { roundId: z.number().int().positive(), title: z.string(), summary: z.string() },
  async ({ roundId, title, summary }) => {
    const result = await write(REVIEW_ABI, ADDRESSES.review, "addProposal", [BigInt(roundId), title, summary]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("review_submit_review", "Submit encrypted impact/feasibility/innovation scores for a proposal",
  { roundId: z.number().int().positive(), proposalId: z.number().int().positive(), impact: z.number().int().min(0).max(100), feasibility: z.number().int().min(0).max(100), innovation: z.number().int().min(0).max(100) },
  async ({ roundId, proposalId, impact, feasibility, innovation }) => {
    const [encImpact, encFeasibility, encInnovation] = await encryptMany(BigInt(impact), BigInt(feasibility), BigInt(innovation));
    const result = await write(REVIEW_ABI, ADDRESSES.review, "submitReview", [BigInt(roundId), BigInt(proposalId), encImpact, encFeasibility, encInnovation]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("review_finalize_round", "Finalize a review round and record the winner",
  { roundId: z.number().int().positive(), winnerProposalId: z.number().int().positive() },
  async ({ roundId, winnerProposalId }) => {
    const result = await write(REVIEW_ABI, ADDRESSES.review, "finalizeRound", [BigInt(roundId), BigInt(winnerProposalId)]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

//  KYC 

server.tool("kyc_is_verified", "Check whether an address has passed KYC",
  { address: z.string() },
  async ({ address }) => {
    const verified = await read<boolean>(KYC_ABI, ADDRESSES.kyc, "isVerified", [address as `0x${string}`]);
    return { content: [{ type: "text" as const, text: JSON.stringify({ address, verified }) }] };
  }
);

server.tool("kyc_submit", "Submit encrypted age and jurisdiction for KYC verification",
  { age: z.number().int().positive().describe("Age value to encrypt"), jurisdiction: z.number().int().min(0).describe("Jurisdiction code to encrypt") },
  async ({ age, jurisdiction }) => {
    const [encAge, encJurisdiction] = await encryptMany(BigInt(age), BigInt(jurisdiction));
    const result = await write(KYC_ABI, ADDRESSES.kyc, "submitKYC", [encAge, encJurisdiction]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

server.tool("kyc_claim_verified", "Claim verified status after KYC decryption has completed",
  { decryptedResult: z.string() },
  async ({ decryptedResult }) => {
    const result = await write(KYC_ABI, ADDRESSES.kyc, "claimVerified", [BigInt(decryptedResult)]);
    return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
  }
);

//  wallet info 

server.tool("wallet_info", "Return the agent wallet address and ETH balance", {}, async () => {
  const balance = await publicClient.getBalance({ address: addr() });
  return { content: [{ type: "text" as const, text: JSON.stringify({ address: addr(), balanceWei: balance.toString(), balanceEth: (Number(balance) / 1e18).toFixed(6) }) }] };
});

//  start 

const transport = new StdioServerTransport();
await server.connect(transport);
