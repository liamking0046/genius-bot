// wallet.js

// In-memory Map to store user wallets (userId -> balance)
const wallets = new Map();

/**
 * Get the wallet balance for a user.
 * @param {string} userId - The unique ID of the user.
 * @returns {number} The current balance, or 0 if not found.
 */
function getBalance(userId) {
  return wallets.get(userId) || 0;
}

/**
 * Add coins to a user's wallet.
 * @param {string} userId - The unique ID of the user.
 * @param {number} amount - The amount to add (must be positive).
 * @returns {number} The updated balance.
 */
function addCoins(userId, amount) {
  if (amount <= 0) throw new Error("Amount must be positive");
  const currentBalance = getBalance(userId);
  const newBalance = currentBalance + amount;
  wallets.set(userId, newBalance);
  return newBalance;
}

/**
 * Remove coins from a user's wallet.
 * @param {string} userId - The unique ID of the user.
 * @param {number} amount - The amount to remove (must be positive).
 * @returns {number} The updated balance.
 * @throws Will throw if balance is insufficient.
 */
function removeCoins(userId, amount) {
  if (amount <= 0) throw new Error("Amount must be positive");
  const currentBalance = getBalance(userId);
  if (currentBalance < amount) {
    throw new Error("Insufficient balance");
  }
  const newBalance = currentBalance - amount;
  wallets.set(userId, newBalance);
  return newBalance;
}

module.exports = {
  getBalance,
  addCoins,
  removeCoins,
};