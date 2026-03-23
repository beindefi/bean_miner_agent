// ============================================
// BEAN MINER AGENT - claim_rewards.js
// GitHub Actions Version
// ============================================
// Runs once, claims rewards, exits cleanly.
// Called by the claimer.yml workflow every 2hrs.
//
// USAGE:
//   node claim_rewards.js --type=eth
//   node claim_rewards.js --type=bean
// ============================================

const { ethers } = require("ethers");
require("dotenv").config();

const PRIVATE_KEY      = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = "0x9632495bDb93FD6B0740Ab69cc6c71C9c01da4f0";
const RPC_URL          = "https://base-mainnet.public.blastapi.io";

const ABI = [
    "function claimETH() external",
    "function claimBEAN() external"
];

async function main(claimType) {
    if (!claimType || (claimType !== "eth" && claimType !== "bean")) {
        console.error("❌  Invalid type. Use --type=eth or --type=bean");
        process.exit(1);
    }

    if (!PRIVATE_KEY || PRIVATE_KEY === "PASTE_YOUR_PRIVATE_KEY_HERE") {
        console.error("❌  PRIVATE_KEY not set in GitHub Secrets!");
        process.exit(1);
    }

    console.log(`🌾  BEAN HARVESTER - Claiming ${claimType.toUpperCase()}`);
    console.log("==========================================");
    console.log(`⏰  Time: ${new Date().toUTCString()}`);
    console.log("==========================================\n");

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    console.log(`✅  Wallet: ${wallet.address}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`💰  Balance: ${ethers.formatEther(balance)} ETH\n`);

    try {
        console.log(`📤  Sending ${claimType.toUpperCase()} claim...`);

        const tx = claimType === "eth"
            ? await contract.claimETH()
            : await contract.claimBEAN();

        console.log(`🔗  Tx Hash : ${tx.hash}`);
        console.log(`🔍  BaseScan: https://basescan.org/tx/${tx.hash}`);
        console.log(`\n⏳  Waiting for confirmation...`);

        const receipt = await tx.wait();
        console.log(`\n✅  CONFIRMED in block #${receipt.blockNumber}`);
        console.log(`🎉  ${claimType.toUpperCase()} rewards claimed!`);

        // Show updated balance
        const newBalance = await provider.getBalance(wallet.address);
        console.log(`💰  New Balance: ${ethers.formatEther(newBalance)} ETH`);

    } catch (error) {
        if (error.message.includes("insufficient funds")) {
            console.error("❌  Not enough ETH for gas fees.");
        } else if (error.message.includes("nothing") || error.message.includes("0x")) {
            console.log("⚠️   Nothing to claim right now. Skipping.");
            process.exit(0); // Not a real error
        } else {
            console.error("❌  Claim failed:", error.message);
        }
        process.exit(1);
    }
}

const args    = process.argv.slice(2);
const typeArg = args.find(a => a.startsWith("--type="));
main(typeArg ? typeArg.split("=")[1] : null);
