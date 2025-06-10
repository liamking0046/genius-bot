module.exports = {
  kick: async (message) => {
    if (!message.isGroup) return message.reply('❌ This command is only for groups.');
    if (!await isAdmin(message)) return message.reply('❌ You must be an admin to use this.');
    const mentioned = message.mentionedIds;
    if (!mentioned.length) return message.reply('❌ Mention the user to kick.');
    try {
      await message.getChat().then(chat => chat.removeParticipants(mentioned));
      message.reply('✅ User(s) kicked.');
    } catch {
      message.reply('❌ Failed to kick user.');
    }
  },

  ban: async (message) => {
    // Ban can mean remove + block
    if (!message.isGroup) return message.reply('❌ This command is only for groups.');
    if (!await isAdmin(message)) return message.reply('❌ You must be an admin to use this.');
    const mentioned = message.mentionedIds;
    if (!mentioned.length) return message.reply('❌ Mention the user to ban.');
    try {
      await message.getChat().then(async chat => {
        await chat.removeParticipants(mentioned);
        for (const id of mentioned) {
          await message.client.contactBlock(id);
        }
      });
      message.reply('✅ User(s) banned and blocked.');
    } catch {
      message.reply('❌ Failed to ban user.');
    }
  },

  mute: async (message) => {
    if (!message.isGroup) return message.reply('❌ Only works in groups.');
    if (!await isAdmin(message)) return message.reply('❌ You must be an admin.');
    try {
      const chat = await message.getChat();
      await chat.setMessagesMute(true);
      message.reply('🔇 Group muted.');
    } catch {
      message.reply('❌ Failed to mute group.');
    }
  },

  warn: async (message) => {
    if (!message.isGroup) return message.reply('❌ Only in groups.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const user = message.mentionedIds[0];
    if (!user) return message.reply('❌ Mention a user to warn.');
    // You'd normally store warnings in DB — for demo just reply
    message.reply(`⚠️ User @${user.split('@')[0]} has been warned.`);
  },

  promote: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const user = message.mentionedIds[0];
    if (!user) return message.reply('❌ Mention a user to promote.');
    try {
      const chat = await message.getChat();
      await chat.promoteParticipants([user]);
      message.reply('✅ User promoted to admin.');
    } catch {
      message.reply('❌ Could not promote user.');
    }
  },

  demote: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const user = message.mentionedIds[0];
    if (!user) return message.reply('❌ Mention a user to demote.');
    try {
      const chat = await message.getChat();
      await chat.demoteParticipants([user]);
      message.reply('✅ User demoted.');
    } catch {
      message.reply('❌ Could not demote user.');
    }
  },

  add: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const chat = await message.getChat();
    const args = message.body.split(' ');
    if (args.length < 2) return message.reply('❌ Usage: .add <number>');
    try {
      await chat.addParticipants([args[1] + '@c.us']);
      message.reply('✅ User added.');
    } catch {
      message.reply('❌ Failed to add user.');
    }
  },

  remove: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const mentioned = message.mentionedIds;
    if (!mentioned.length) return message.reply('❌ Mention user(s) to remove.');
    try {
      const chat = await message.getChat();
      await chat.removeParticipants(mentioned);
      message.reply('✅ User(s) removed.');
    } catch {
      message.reply('❌ Failed to remove user(s).');
    }
  },

  clear: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    try {
      const chat = await message.getChat();
      await chat.clearMessages();
      message.reply('✅ Chat cleared.');
    } catch {
      message.reply('❌ Failed to clear chat.');
    }
  },

  info: async (message) => {
    if (message.isGroup) {
      const chat = await message.getChat();
      let desc = chat.description || 'No description';
      let subject = chat.name || 'No subject';
      message.reply(`📋 Group Info\nSubject: ${subject}\nDescription: ${desc}\nParticipants: ${chat.participants.length}`);
    } else {
      const contact = await message.getContact();
      message.reply(`👤 Contact Info\nName: ${contact.pushname || contact.number}\nNumber: ${contact.number}`);
    }
  },

  role: async (message) => {
    // This is typically custom — could reply user role, for demo: admin or member
    if (!message.isGroup) return message.reply('❌ Groups only.');
    const chat = await message.getChat();
    const user = message.mentionedIds[0] || message.from;
    const participant = chat.participants.find(p => p.id._serialized === user);
    if (!participant) return message.reply('❌ User not found.');
    message.reply(`🔰 Role: ${participant.isAdmin ? 'Admin' : 'Member'}`);
  },

  setdesc: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const desc = message.body.split(' ').slice(1).join(' ');
    if (!desc) return message.reply('❌ Usage: .setdesc <text>');
    try {
      const chat = await message.getChat();
      await chat.setDescription(desc);
      message.reply('✅ Description updated.');
    } catch {
      message.reply('❌ Failed to update description.');
    }
  },

  setsubject: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    const subject = message.body.split(' ').slice(1).join(' ');
    if (!subject) return message.reply('❌ Usage: .setsubject <text>');
    try {
      const chat = await message.getChat();
      await chat.setSubject(subject);
      message.reply('✅ Subject updated.');
    } catch {
      message.reply('❌ Failed to update subject.');
    }
  },

  seticon: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    if (!message.hasMedia) return message.reply('❌ Please send an image with the command.');
    try {
      const media = await message.downloadMedia();
      const chat = await message.getChat();
      await chat.setPicture(media);
      message.reply('✅ Group icon updated.');
    } catch {
      message.reply('❌ Failed to update icon.');
    }
  },

  leave: async (message) => {
    if (!message.isGroup) return message.reply('❌ Groups only.');
    if (!await isAdmin(message)) return message.reply('❌ Admins only.');
    try {
      const chat = await message.getChat();
      await chat.leave();
      // no reply needed as bot left
    } catch {
      message.reply('❌ Failed to leave group.');
    }
  },
};

// Helper function to check admin status of command sender
async function isAdmin(message) {
  if (!message.isGroup) return false;
  const chat = await message.getChat();
  const participant = chat.participants.find(p => p.id._serialized === message.author || message.from);
  return participant ? participant.isAdmin : false;
}