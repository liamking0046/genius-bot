// casino.js

// In-memory coin wallet (replace with DB in production)
const wallets = new Map();

// Helpers
function getCoins(userId) {
  return wallets.get(userId) || 1000; // default starting coins
}

function updateCoins(userId, amount) {
  const current = getCoins(userId);
  wallets.set(userId, current + amount);
}

function validateBet(bet, coins) {
  return Number.isInteger(bet) && bet > 0 && bet <= coins;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {

  slot: async (message, args) => {
    const userId = message.from;
    let bet = parseInt(args[0], 10);
    const coins = getCoins(userId);
    if (!validateBet(bet, coins)) return message.reply(`❌ Invalid bet or insufficient coins. You have ${coins} coins.`);

    const symbols = ['🍒', '🍋', '🍊', '🍉', '⭐', '💎'];
    const reels = [randomChoice(symbols), randomChoice(symbols), randomChoice(symbols)];

    if (reels[0] === reels[1] && reels[1] === reels[2]) {
      const payout = bet * 10;
      updateCoins(userId, payout);
      message.reply(`🎰 ${reels.join(' | ')}\n🎉 Jackpot! You won ${payout} coins!\n💰 Balance: ${getCoins(userId)} coins.`);
    } else {
      updateCoins(userId, -bet);
      message.reply(`🎰 ${reels.join(' | ')}\n😞 You lost ${bet} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
    }
  },

  coinflip: async (message, args) => {
    const userId = message.from;
    let bet = parseInt(args[0], 10);
    const guess = (args[1] || '').toLowerCase();
    const coins = getCoins(userId);
    if (!validateBet(bet, coins)) return message.reply(`❌ Invalid bet or insufficient coins. You have ${coins} coins.`);
    if (!['heads', 'tails'].includes(guess)) return message.reply('❌ Please guess "heads" or "tails". Usage: .coinflip <bet> <heads/tails>');

    const flip = Math.random() < 0.5 ? 'heads' : 'tails';

    if (flip === guess) {
      updateCoins(userId, bet);
      message.reply(`🪙 The coin landed on ${flip}.\n🎉 You won ${bet} coins!\n💰 Balance: ${getCoins(userId)} coins.`);
    } else {
      updateCoins(userId, -bet);
      message.reply(`🪙 The coin landed on ${flip}.\n😞 You lost ${bet} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
    }
  },

  dice: async (message, args) => {
    const userId = message.from;
    let bet = parseInt(args[0], 10);
    const guess = parseInt(args[1], 10);
    const coins = getCoins(userId);
    if (!validateBet(bet, coins)) return message.reply(`❌ Invalid bet or insufficient coins. You have ${coins} coins.`);
    if (!guess || guess < 1 || guess > 6) return message.reply('❌ Please guess a number between 1 and 6. Usage: .dice <bet> <number>');

    const roll = Math.floor(Math.random() * 6) + 1;

    if (roll === guess) {
      const payout = bet * 5;
      updateCoins(userId, payout);
      message.reply(`🎲 The dice rolled a ${roll}.\n🎉 You won ${payout} coins!\n💰 Balance: ${getCoins(userId)} coins.`);
    } else {
      updateCoins(userId, -bet);
      message.reply(`🎲 The dice rolled a ${roll}.\n😞 You lost ${bet} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
    }
  },

  roulette: async (message, args) => {
    const userId = message.from;
    let bet = parseInt(args[0], 10);
    let guess = args[1]?.toLowerCase();
    const coins = getCoins(userId);
    if (!validateBet(bet, coins)) return message.reply(`❌ Invalid bet or insufficient coins. You have ${coins} coins.`);

    const pockets = [...Array(37).keys()]; // 0-36
    const spin = randomChoice(pockets);
    const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(spin);
    const color = spin === 0 ? 'green' : isRed ? 'red' : 'black';

    if (!guess) return message.reply('❌ Please guess a number (0-36) or color (red, black, green). Usage: .roulette <bet> <guess>');

    if (['red', 'black', 'green'].includes(guess)) {
      if (guess === color) {
        const payout = bet * (color === 'green' ? 14 : 2);
        updateCoins(userId, payout);
        message.reply(`🎡 Roulette spun: ${spin} (${color}).\n🎉 You won ${payout} coins!\n💰 Balance: ${getCoins(userId)} coins.`);
      } else {
        updateCoins(userId, -bet);
        message.reply(`🎡 Roulette spun: ${spin} (${color}).\n😞 You lost ${bet} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
      }
    } else {
      const guessNum = parseInt(guess, 10);
      if (isNaN(guessNum) || guessNum < 0 || guessNum > 36) return message.reply('❌ Invalid guess number. Choose between 0 and 36.');
      if (guessNum === spin) {
        const payout = bet * 35;
        updateCoins(userId, payout);
        message.reply(`🎡 Roulette spun: ${spin} (${color}).\n🎉 You won ${payout} coins!\n💰 Balance: ${getCoins(userId)} coins.`);
      } else {
        updateCoins(userId, -bet);
        message.reply(`🎡 Roulette spun: ${spin} (${color}).\n😞 You lost ${bet} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
      }
    }
  },

  blackjack: async (message, args) => {
    const userId = message.from;
    let bet = parseInt(args[0], 10);
    const coins = getCoins(userId);
    if (!validateBet(bet, coins)) return message.reply(`❌ Invalid bet or insufficient coins. You have ${coins} coins.`);

    function getCard() {
      const cards = [2,3,4,5,6,7,8,9,10,10,10,10,11];
      return cards[Math.floor(Math.random() * cards.length)];
    }

    let userScore = getCard() + getCard();
    let dealerScore = getCard() + getCard();

    while (userScore < 17) userScore += getCard();
    while (dealerScore < 17) dealerScore += getCard();

    if (userScore > 21) {
      updateCoins(userId, -bet);
      return message.reply(`🃏 Your score: ${userScore}\n🤖 Dealer score: ${dealerScore}\n😞 You busted! Lost ${bet} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
    }
    if (dealerScore > 21 || userScore > dealerScore) {
      const payout = bet * 2;
      updateCoins(userId, payout);
      return message.reply(`🃏 Your score: ${userScore}\n🤖 Dealer score: ${dealerScore}\n🎉 You won ${payout} coins!\n💰 Balance: ${getCoins(userId)} coins.`);
    }
    if (userScore === dealerScore) {
      return message.reply(`🃏 Your score: ${userScore}\n🤖 Dealer score: ${dealerScore}\n😐 It's a tie! Your bet is returned.\n💰 Balance: ${getCoins(userId)} coins.`);
    }
    updateCoins(userId, -bet);
    return message.reply(`🃏 Your score: ${userScore}\n🤖 Dealer score: ${dealerScore}\n😞 You lost ${bet} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
  },

  poker: async (message, args) => {
    const userId = message.from;
    let bet = parseInt(args[0], 10);
    const coins = getCoins(userId);
    if (!validateBet(bet, coins)) return message.reply(`❌ Invalid bet or insufficient coins. You have ${coins} coins.`);

    const handStrength = Math.floor(Math.random() * 10) + 1;
    const payoutTable = {1:0, 2:0, 3:1, 4:1, 5:2, 6:3, 7:5, 8:10, 9:20, 10:50};
    const payoutMultiplier = payoutTable[handStrength] || 0;

    if (payoutMultiplier > 0) {
      const payout = bet * payoutMultiplier;
      updateCoins(userId, payout);
      message.reply(`🃏 Poker hand strength: ${handStrength}\n🎉 You won ${payout} coins!\n💰 Balance: ${getCoins(userId)} coins.`);
    } else {
      updateCoins(userId, -bet);
      message.reply(`🃏 Poker hand strength: ${handStrength}\n😞 You lost ${bet} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
    }
  },

  bingo: async (message, args) => {
    const userId = message.from;
    let bet = parseInt(args[0], 10);
    const coins = getCoins(userId);
    if (!validateBet(bet, coins)) return message.reply(`❌ Invalid bet or insufficient coins. You have ${coins} coins.`);

    const number = Math.floor(Math.random() * 75) + 1;
    if (number <= 5) {
      const payout = bet * 10;
      updateCoins(userId, payout);
      message.reply(`🔢 Bingo number: ${number}\n🎉 Bingo! You won ${payout} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
    } else {
      updateCoins(userId, -bet);
      message.reply(`🔢 Bingo number: ${number}\n😞 No bingo. You lost ${bet} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
    }
  },

  scratch: async (message, args) => {
    const userId = message.from;
    let bet = parseInt(args[0], 10);
    const coins = getCoins(userId);
    if (!validateBet(bet, coins)) return message.reply(`❌ Invalid bet or insufficient coins. You have ${coins} coins.`);

    const symbols = ['🍀', '⭐', '💰', '🎲', '🎯'];
    const picks = [randomChoice(symbols), randomChoice(symbols), randomChoice(symbols)];

    if (picks[0] === picks[1] && picks[1] === picks[2]) {
      const payout = bet * 7;
      updateCoins(userId, payout);
      message.reply(`🃏 Scratch result: ${picks.join(' ')}\n🎉 Jackpot! You won ${payout} coins!\n💰 Balance: ${getCoins(userId)} coins.`);
    } else {
      updateCoins(userId, -bet);
      message.reply(`🃏 Scratch result: ${picks.join(' ')}\n😞 No match. You lost ${bet} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
    }
  },

  lottery: async (message, args) => {
    const userId = message.from;
    let bet = parseInt(args[0], 10);
    const coins = getCoins(userId);
    if (!validateBet(bet, coins)) return message.reply(`❌ Invalid bet or insufficient coins. You have ${coins} coins.`);

    const chance = Math.floor(Math.random() * 100) + 1;
    if (chance === 1) {
      const payout = bet * 100;
      updateCoins(userId, payout);
      message.reply(`🎉 JACKPOT! You won ${payout} coins in the lottery!\n💰 Balance: ${getCoins(userId)} coins.`);
    } else {
      updateCoins(userId, -bet);
      message.reply(`🎟️ No luck this time. You lost ${bet} coins.\n💰 Balance: ${getCoins(userId)} coins.`);
    }
  }

};