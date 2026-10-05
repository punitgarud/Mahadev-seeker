
.module.exports = {
  CYCLE_HOURS: 6,
  TOP_N: 4,
  REAL_TRADING_STARTS_AFTER_CYCLES: 1, // Cycle1 PAPER, Cycle2+ REAL
  FUNDS_PERCENT: 25,
  MAX_LOSS_PER_CYCLE_PCT: 7,
  MAX_DAILY_LOSS_PCT: 12,
  SOLANA: { RPC: "https://api.mainnet-beta.solana.com", USE_SEED_VAULT: true },
  MODULES: ['SMC','VWAP','Liquidity','FVG','Breaker','Orderflow','OrderBlock','BOS','CHoCH','EQH-EQL','Premium-Discount','Session']
}
