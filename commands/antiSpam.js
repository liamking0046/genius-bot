// Simple in-memory storage for demo — replace with DB for persistence
const groupSettings = {};
const warnings = {};
const blacklist = new Set();
const whitelist = new Set();
const reports = [];
const logs = [];

module.exports = {
  antispam: async (message, args) => {
    if (!message.isGroup) return message.reply('❌ This command works only in groups.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');

    const chatId = message.from;
    groupSettings[chatId] = groupSettings[chatId] || { antispam: false, slowmode: 0, filter: [] };

    if (args[0] === 'on') {
      groupSettings[chatId].antispam = true;
      message.reply('✅ Anti-spam enabled.');
    } else if (args[0] === 'off') {
      groupSettings[chatId].antispam = false;
      message.reply('✅ Anti-spam disabled.');
    } else {
      message.reply('Usage: .antispam on/off');
    }
  },

  warn: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const user = message.mentionedIds[0];
    if (!user) return message.reply('❌ Mention a user to warn.');

    warnings[user] = (warnings[user] || 0) + 1;
    message.reply(`⚠️ User @${user.split('@')[0]} has been warned. Total warnings: ${warnings[user]}`);
  },

  mute: async (message) => {
    // For anti-spam, mute means restricting messages for user
    // whatsapp-web.js has no granular mute, so simulate with ban + warn or admin mute
    message.reply('❌ Mute by bot not supported due to WhatsApp API limitations.');
  },

  ban: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const user = message.mentionedIds[0];
    if (!user) return message.reply('❌ Mention a user to ban.');
    try {
      const chat = await message.getChat();
      await chat.removeParticipants([user]);
      await message.client.contactBlock(user);
      message.reply('✅ User banned and blocked.');
    } catch {
      message.reply('❌ Could not ban user.');
    }
  },

  kick: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const user = message.mentionedIds[0];
    if (!user) return message.reply('❌ Mention a user to kick.');
    try {
      const chat = await message.getChat();
      await chat.removeParticipants([user]);
      message.reply('✅ User kicked.');
    } catch {
      message.reply('❌ Could not kick user.');
    }
  },

  slowmode: async (message, args) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const chatId = message.from;
    groupSettings[chatId] = groupSettings[chatId] || { slowmode: 0 };
    const delay = parseInt(args[0], 10);
    if (isNaN(delay) || delay < 0) return message.reply('❌ Usage: .slowmode <seconds>');
    groupSettings[chatId].slowmode = delay;
    message.reply(`✅ Slowmode set to ${delay} seconds.`);
  },

  filter: async (message, args) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const chatId = message.from;
    groupSettings[chatId] = groupSettings[chatId] || { filter: [] };
    if (args.length === 0) return message.reply('❌ Usage: .filter add|remove|list [word]');
    const action = args[0];
    const word = args[1];
    if (action === 'add') {
      if (!word) return message.reply('❌ Specify a word to add.');
      if (!groupSettings[chatId].filter.includes(word.toLowerCase())) {
        groupSettings[chatId].filter.push(word.toLowerCase());
        message.reply(`✅ Word "${word}" added to filter.`);
      } else {
        message.reply('❌ Word already in filter.');
      }
    } else if (action === 'remove') {
      if (!word) return message.reply('❌ Specify a word to remove.');
      groupSettings[chatId].filter = groupSettings[chatId].filter.filter(w => w !== word.toLowerCase());
      message.reply(`✅ Word "${word}" removed from filter.`);
    } else if (action === 'list') {
      const list = groupSettings[chatId].filter;
      message.reply(`📋 Filtered words:\n${list.length ? list.join(', ') : 'No words filtered'}`);
    } else {
      message.reply('❌ Usage: .filter add|remove|list [word]');
    }
  },

  blacklist: async (message, args) => {
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    if (args.length < 2) return message.reply('❌ Usage: .blacklist add|remove [number]');
    const action = args[0];
    const number = args[1];
    if (!number.match(/^\d+$/)) return message.reply('❌ Invalid number.');
    const userId = number + '@c.us';
    if (action === 'add') {
      blacklist.add(userId);
      message.reply(`✅ ${number} added to blacklist.`);
    } else if (action === 'remove') {
      blacklist.delete(userId);
      message.reply(`✅ ${number} removed from blacklist.`);
    } else {
      message.reply('❌ Usage: .blacklist add|remove [number]');
    }
  },

  whitelist: async (message, args) => {
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    if (args.length < 2) return message.reply('❌ Usage: .whitelist add|remove [number]');
    const action = args[0];
    const number = args[1];
    if (!number.match(/^\d+$/)) return message.reply('❌ Invalid number.');
    const userId = number + '@c.us';
    if (action === 'add') {
      whitelist.add(userId);
      message.reply(`✅ ${number} added to whitelist.`);
    } else if (action === 'remove') {
      whitelist.delete(userId);
      message.reply(`✅ ${number} removed from whitelist.`);
    } else {
      message.reply('❌ Usage: .whitelist add|remove [number]');
    }
  },

  report: async (message) => {
    if (message.mentionedIds.length === 0) return message.reply('❌ Mention a user to report.');
    const userId = message.mentionedIds[0];
    reports.push({ userId, reporter: message.from, time: Date.now() });
    message.reply('✅ Report submitted. Admins will review it.');
  },

  cleanup: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    try {
      const chat = await message.getChat();
      await chat.clearMessages();
      message.reply('✅ Chat cleaned up.');
    } catch {
      message.reply('❌ Failed to clean chat.');
    }
  },

  block: async (message, args) => {
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    if (args.length < 1) return message.reply('❌ Usage: .block [number]');
    const number = args[0];
    const userId = number + '@c.us';
    try {
      await message.client.contactBlock(userId);
      message.reply(`✅ ${number} blocked.`);
    } catch {
      message.reply('❌ Failed to block number.');
    }
  },

  unblock: async (message, args) => {
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    if (args.length < 1) return message.reply('❌ Usage: .unblock [number]');
    const number = args[0];
    const userId = number + '@c.us';
    try {
      await message.client.contactUnblock(userId);
      message.reply(`✅ ${number} unblocked.`);
    } catch {
      message.reply('❌ Failed to unblock number.');
    }
  },

  audit: async (message) => {
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    message.reply(`📝 Audit logs:\n${logs.length ? logs.join('\n') : 'No logs available.'}`);
  },

  log: async (message, args) => {
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    if (!args.length) return message.reply('Usage: .log <message>');
    logs.push(`[${new Date().toLocaleString()}] ${args.join(' ')}`);
    message.reply('✅ Log added.');
  },
};

// Helper for admin check
async function isAdmin(message) {
  if (!message.isGroup) return false;
  const chat = await message.getChat();
  const participant = chat.participants.find(p => p.id._serialized === message.author || message.from);
  return participant ? participant.isAdmin : false;
}