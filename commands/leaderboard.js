module.exports = (wallets, dailyCooldowns) => ({
  // Show your current wallet
  wallet: async (message) => {
    const userId = message.from;
    const balance = wallets[userId] || 0;
    await message.reply(`💰 You have *${balance}* coins in your wallet.`);
  },

  // Claim daily coins
  daily: async (message) => {
    const userId = message.from;
    const now = Date.now();
    const lastClaim = dailyCooldowns[userId] || 0;
    const cooldown = 24 * 60 * 60 * 1000;

    if (now - lastClaim < cooldown) {
      const timeLeft = Math.ceil((cooldown - (now - lastClaim)) / 3600000);
      return message.reply(`⏳ You already claimed your daily reward. Try again in *${timeLeft}h*.`);
    }

    const reward = Math.floor(Math.random() * 200 + 100); // 100–300 coins
    wallets[userId] = (wallets[userId] || 0) + reward;
    dailyCooldowns[userId] = now;

    await message.reply(`🎁 You claimed your daily reward and received *${reward}* coins!`);
  },

  // View top 5 richest users
  leaderboard: async (message) => {
    const entries = Object.entries(wallets);
    if (entries.length === 0) return message.reply('📉 No data in leaderboard yet.');

    const top = entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, coins], i) => `${i + 1}. *${id}* — ${coins} coins`)
      .join('\n');

    await message.reply(`🏆 *Top 5 Leaderboard:*\n\n${top}`);
  }
});