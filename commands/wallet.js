// commands/wallet.js

const wallets = new Map(); // Temporary in-memory wallet store

function getBalance(userId) {
  return wallets.get(userId) || 0;
}

function addCoins(userId, amount) {
  if (amount <= 0) throw new Error("Amount must be positive");
  const newBalance = getBalance(userId) + amount;
  wallets.set(userId, newBalance);
  return newBalance;
}

function removeCoins(userId, amount) {
  const current = getBalance(userId);
  if (amount <= 0 || current < amount) throw new Error("Insufficient balance");
  const newBalance = current - amount;
  wallets.set(userId, newBalance);
  return newBalance;
}

module.exports = {
  balance: async (m, args) => {
    const userId = m.from;
    const coins = getBalance(userId);
    await m.reply(`💰 Your current balance is: *${coins}* coins.`);
  },

  wallet: async (m, args) => {  // Alias for .wallet command
    const userId = m.from;
    const coins = getBalance(userId);
    await m.reply(`💰 Your current balance is: *${coins}* coins.`);
  },

  addcoins: async (m, args) => {
    if (!args[0] || isNaN(args[0])) return m.reply('❌ Usage: .addcoins [amount]');
    const amount = parseInt(args[0]);
    const userId = m.from;
    const newBalance = addCoins(userId, amount);
    await m.reply(`✅ Added *${amount}* coins.\nNew Balance: *${newBalance}*`);
  },

  removecoins: async (m, args) => {
    if (!args[0] || isNaN(args[0])) return m.reply('❌ Usage: .removecoins [amount]');
    const amount = parseInt(args[0]);
    const userId = m.from;
    try {
      const newBalance = removeCoins(userId, amount);
      await m.reply(`✅ Removed *${amount}* coins.\nNew Balance: *${newBalance}*`);
    } catch (err) {
      await m.reply('❌ Insufficient balance.');
    }
  },

  // Helper functions for other commands (like daily.js)
  _getBalance: getBalance,
  _addCoins: addCoins,
  _removeCoins: removeCoins,
};