// commands/daily.js

const wallet = require('./wallet'); // Same folder

const cooldowns = new Map(); // userId -> last claim timestamp
const DAILY_REWARD = 500;
const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in ms

module.exports = {
  daily: async (m, args) => {
    const userId = m.from;
    const now = Date.now();
    const lastClaim = cooldowns.get(userId) || 0;

    const timePassed = now - lastClaim;

    if (timePassed < COOLDOWN) {
      const remaining = COOLDOWN - timePassed;
      const hrs = Math.floor(remaining / (60 * 60 * 1000));
      const min = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const sec = Math.floor((remaining % (60 * 1000)) / 1000);
      return m.reply(`⏳ You already claimed your daily reward!\nCome back in ${hrs}h ${min}m ${sec}s.`);
    }

    // Give reward
    wallet._addCoins(userId, DAILY_REWARD);
    cooldowns.set(userId, now);
    const balance = wallet._getBalance(userId);
    await m.reply(`🎉 You've received *${DAILY_REWARD}* coins!\n💰 Your balance is now *${balance}* coins.`);
  }
};