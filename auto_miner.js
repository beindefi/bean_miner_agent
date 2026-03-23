// ============================================
// BEAN MINER AGENT - auto_miner.js
// GitHub Actions Version [public]
// ============================================
// DIFFERENCE FROM VPS VERSION:
//   Instead of looping forever, this script
//   runs ONCE, checks if there's a new round,
//   bets if yes, then exits cleanly.
//   GitHub Actions calls it every 5 minutes.
// ============================================

const { ethers } = require("ethers");
require("dotenv").config();

const PRIVATE_KEY      = process.env.PRIVATE_KEY;
const RPC_URL          = "https://base-mainnet.public.blastapi.io";
const RPC_FALLBACK     = "https://base.llamarpc.com";
const CONTRACT_ADDRESS = "0x9632495bDb93FD6B0740Ab69cc6c71C9c01da4f0";

const ABI = [
    "function deploy(uint8[] calldata blockIds) external payable",
    "function getCurrentRoundInfo() external view returns (uint64 roundId, uint64 startTime, uint64 endTime, uint256 totalDeployed, uint64 timeRemaining, bool isActive)"
];

// ============================================
// ⚙️  YOUR SETTINGS — Edit these two values
// ============================================
const BET_AMOUNT_ETH    = "0.0001"; // ETH to bet PER block
const NUM_RANDOM_BLOCKS = 3;        // How many blocks per round (max 25)
// ============================================

async function main() {
    console.log("🫘  BEAN MINER AGENT - GitHub Actions Run");
    console.log("==========================================");
    console.log(`⏰  Time     : ${new Date().toUTCString()}`);
    console.log(`⚙️   Bet/block : ${BET_AMOUNT_ETH} ETH`);
    console.log(`⚙️   Blocks   : ${NUM_RANDOM_BLOCKS}`);
    console.log("==========================================\n");

    // --- Validate private key ---
    if (!PRIVATE_KEY || PRIVATE_KEY === "PASTE_YOUR_PRIVATE_KEY_HERE") {
        console.error("❌  ERROR: PRIVATE_KEY not set in GitHub Secrets!");
        console.error("    Go to: Your Repo → Settings → Secrets → Actions → New secret");
        process.exit(1);
    }

    // --- Connect to Base chain ---
    let provider = new ethers.JsonRpcProvider(RPC_URL);
    let wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
    let contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

    // --- Try fallback RPC if primary fails ---
    try {
        await provider.getBlockNumber();
        console.log("✅  Connected to Base chain (primary RPC)");
    } catch {
        console.warn("⚠️   Primary RPC failed, switching to fallback...");
        provider = new ethers.JsonRpcProvider(RPC_FALLBACK);
        wallet   = new ethers.Wallet(PRIVATE_KEY, provider);
        contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);
        console.log("✅  Connected to Base chain (fallback RPC)");
    }

    // --- Show wallet balance ---
    const balance = await provider.getBalance(wallet.address);
    const balanceETH = parseFloat(ethers.formatEther(balance));
    console.log(`✅  Wallet  : ${wallet.address}`);
    console.log(`💰  Balance : ${balanceETH.toFixed(6)} ETH\n`);

    // --- Low balance warning ---
    const totalPerRound = parseFloat(BET_AMOUNT_ETH) * NUM_RANDOM_BLOCKS;
    if (balanceETH < totalPerRound * 2) {
        console.warn("⚠️   WARNING: Balance is very low! Top up your wallet soon.");
        if (balanceETH < totalPerRound) {
            console.error("❌  Not enough ETH to place bets. Exiting.");
            process.exit(0); // Exit cleanly (not an error, just skip this round)
        }
    }

    // --- Get current round info ---
    let roundInfo;
    try {
        roundInfo = await contract.getCurrentRoundInfo();
    } catch (e) {
        console.error("❌  Could not fetch round info:", e.message);
        process.exit(1);
    }

    const [currentRoundId, , , , timeRemaining, isActive] = roundInfo;
    console.log(`📊  Round      : #${currentRoundId}`);
    console.log(`📊  Active     : ${isActive ? "Yes ✅" : "No ⏸️"}`);
    console.log(`📊  Time left  : ${timeRemaining}s\n`);

    // --- Skip if game not active ---
    if (!isActive) {
        console.log("⏸️   Game is not active right now. Nothing to do.");
        console.log("    Will try again in 5 minutes.");
        process.exit(0);
    }

    // --- Skip if round is almost over (less than 20s left) ---
    if (Number(timeRemaining) < 20) {
        console.log("⏩  Round ending soon, skipping to avoid wasted gas.");
        console.log("    Will catch the next round in 5 minutes.");
        process.exit(0);
    }

    // --- Pick random blocks ---
    const targetBlocks = [];
    while (targetBlocks.length < NUM_RANDOM_BLOCKS) {
        const rand = Math.floor(Math.random() * 25);
        if (!targetBlocks.includes(rand)) targetBlocks.push(rand);
    }

    console.log(`🎯  Targeting blocks: [ ${targetBlocks.map(b => `#${b}`).join(", ")} ]`);

    // --- Calculate total bet ---
    const singleBet   = ethers.parseEther(BET_AMOUNT_ETH);
    const totalAmount = singleBet * BigInt(targetBlocks.length);
    console.log(`💸  Total bet: ${ethers.formatEther(totalAmount)} ETH\n`);

    // --- Send transaction ---
    try {
        const feeData = await provider.getFeeData();
        const tx = await contract.deploy(targetBlocks, {
            value: totalAmount,
            maxFeePerGas: feeData.maxFeePerGas,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        });

        console.log(`📤  Transaction sent!`);
        console.log(`🔗  Tx Hash : ${tx.hash}`);
        console.log(`🔍  BaseScan: https://basescan.org/tx/${tx.hash}`);
        console.log(`\n⏳  Waiting for confirmation...`);

        const receipt = await tx.wait();
        console.log(`\n✅  CONFIRMED in block #${receipt.blockNumber}`);
        console.log(`🫘  Round #${currentRoundId} — Bets placed successfully!`);

    } catch (error) {
        if (error.message.includes("insufficient funds")) {
            console.error("❌  Insufficient funds for gas. Top up your wallet!");
        } else {
            console.error("❌  Transaction failed:", error.message);
        }
        process.exit(1);
    }
}

main();
