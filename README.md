# 🫘 BEAN Miner Agent — GitHub Actions Edition [public]

---

## ⚠️ Warnings (Read First!)
- Use a **FRESH wallet only** — never your main wallet
- Real ETH is at stake — only use what you can afford to lose
- Not financial advice

---

## 🏗️ How It Works

```
GitHub Actions (free cloud)
  ├── Every 5 mins  →  auto_miner.js   → checks for new round → bets ETH
  └── Every 2 hours →  claim_rewards.js → sweeps ETH + BEAN back to wallet
```
---

### Enable GitHub Actions

1. Click the **Actions** tab in your repo
2. If prompted, click **"I understand my workflows, enable them"**
3. You'll see two workflows:
   - 🫘 BEAN Miner
   - 🌾 BEAN Harvester

---

###  Fund Your Wallet

Your bot needs Base ETH for gas and betting.

1. Buy ETH on Coinbase, Binance, etc.
2. Bridge to Base chain: https://bridge.base.org
3. Send to your fresh wallet address
4. Recommended starting amount: **$10–20**

---

### Test It Manually

Before waiting for the cron schedule, trigger it manually:

1. Go to **Actions** tab
2. Click **🫘 BEAN Miner** in the left sidebar
3. Click **Run workflow** → **Run workflow** (green button)
4. Watch the logs in real time!

You should see something like:
```
🫘  BEAN MINER AGENT - GitHub Actions Run
==========================================
✅  Connected to Base chain (primary RPC)
✅  Wallet  : 0xYourAddress...
💰  Balance : 0.05 ETH

📊  Round      : #142
📊  Active     : Yes ✅
📊  Time left  : 45s

🎯  Targeting blocks: [ #3, #17, #22 ]
💸  Total bet: 0.0003 ETH

📤  Transaction sent!
🔗  Tx Hash : 0xabc123...
✅  CONFIRMED in block #14829201
```

---

## ⚙️ Adjusting Your Settings

Open `auto_miner.js` and find these lines:

```javascript
const BET_AMOUNT_ETH    = "0.0001"; // ← ETH per block
const NUM_RANDOM_BLOCKS = 3;        // ← Blocks per round (1–25)
```

Change them, commit the file, and GitHub Actions picks up the new settings automatically.

---

## 📊 Monitoring Your Bot

**View run history:**
→ GitHub repo → Actions tab → click any run to see logs

**View your transactions:**
→ https://basescan.org/address/YOUR_WALLET_ADDRESS

**Manually trigger a claim:**
→ Actions → 🌾 BEAN Harvester → Run workflow

---

## 💰 Cost Summary

| Item | Cost |
|---|---|
| GitHub account | FREE |
| Private repo | FREE |
| GitHub Actions (2,000 min/month free) | FREE |
| This bot | FREE |
| Base ETH for gas + bets | ~$10–20 to start |

**Monthly hosting: $0**

> GitHub Actions free tier = 2,000 minutes/month.
> Each miner run takes ~30 seconds.
> That's ~4,000 possible runs/month — well within the limit.

---

## ❓ Common Problems

**Workflow doesn't run automatically**
→ GitHub disables scheduled workflows after 60 days of repo inactivity.
→ Fix: Push any small commit (like editing README) to re-activate.

**"PRIVATE_KEY not set" error**
→ Double-check Settings → Secrets → Actions → `PRIVATE_KEY` exists

**"Insufficient funds" error**
→ Top up your wallet with more Base ETH

**"Nothing to claim" on harvester**
→ Normal — just means no rewards accumulated yet. Keep mining.

**Actions tab is missing**
→ Go to Settings → Actions → General → Allow all actions → Save

---

## 🔗 Useful Links

| Resource | Link |
|---|---|
| Your transaction history | https://basescan.org/address/YOUR_WALLET_ADDRESS |
| Bridge ETH to Base | https://bridge.base.org |
| MineBEAN site | https://www.minebean.com |
| GitHub Actions docs | https://docs.github.com/en/actions |

---

*⚠️ Disclaimer: Educational purposes only. DeFi carries inherent financial risk. Not financial advice.*
