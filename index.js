const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const menu = require('./commands/menu');

// Import all command modules
const admin = require('./commands/admin');
const antiSpam = require('./commands/antiSpam');
const casino = require('./commands/casino');
const emotion = require('./commands/emotion');
const fifashop = require('./commands/fifashop');
const fun = require('./commands/fun');
const leaderboard = require('./commands/leaderboard');
const media = require('./commands/media');
const meme = require('./commands/meme');
const music = require('./commands/music');
const wallet = require('./commands/wallet');
const daily = require('./commands/daily');

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
  console.log('📱 Scan this QR code to log in:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('✅ WhatsApp Bot is ready!');
});

client.on('message', async (message) => {
  const body = message.body || '';
  const chatId = message.from;

  if (!body.startsWith('.')) return; // Only commands starting with .

  const args = body.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Show menu
  if (command === 'menu' || command === 'help') {
    return message.reply(menu());
  }

  // Combine all commands into one object
  const allCommands = {
    ...admin,
    ...antiSpam,
    ...casino,
    ...emotion,
    ...fifashop,
    ...fun,
    ...leaderboard,
    ...media,
    ...meme,
    ...music,
    ...wallet,
    ...daily,
  };

  if (allCommands[command]) {
    try {
      await allCommands[command](message, args, client);
    } catch (err) {
      console.error(`❌ Error executing command "${command}":`, err);
      await message.reply('❌ There was an error while executing that command.');
    }
  } else {
    await message.reply('❌ Unknown command. Type .menu to see available commands.');
  }
});

client.initialize();