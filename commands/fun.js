const fetch = require('node-fetch');

module.exports = {
  '8ball': async (msg) => {
    const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Ask again later'];
    const response = answers[Math.floor(Math.random() * answers.length)];
    msg.reply(`🎱 ${response}`);
  },

  'joke': async (msg) => {
    try {
      const res = await fetch('https://official-joke-api.appspot.com/random_joke');
      const joke = await res.json();
      msg.reply(`${joke.setup}\n${joke.punchline}`);
    } catch (e) {
      msg.reply('❌ Could not fetch a joke right now.');
    }
  },

  'meme': async (msg) => {
    try {
      const res = await fetch('https://meme-api.com/gimme');
      const data = await res.json();
      msg.reply(data.url);
    } catch (e) {
      msg.reply('❌ Could not fetch a meme.');
    }
  },

  'fact': async (msg) => {
    try {
      const res = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
      const fact = await res.json();
      msg.reply(`🤓 ${fact.text}`);
    } catch (e) {
      msg.reply('❌ Could not fetch a fact.');
    }
  },

  'trivia': async (msg) => {
    try {
      const res = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
      const data = await res.json();
      const q = data.results[0];
      msg.reply(`❓ ${q.question.replace(/&quot;|&#039;/g, "'")}`);
    } catch {
      msg.reply('❌ Trivia question unavailable.');
    }
  },

  'riddle': async (msg) => {
    const riddles = [
      "What has keys but can't open locks? — A piano.",
      "What comes once in a minute, twice in a moment, but never in a thousand years? — The letter M.",
      "I speak without a mouth and hear without ears. What am I? — An echo."
    ];
    msg.reply(riddles[Math.floor(Math.random() * riddles.length)]);
  },

  'quote': async (msg) => {
    try {
      const res = await fetch('https://api.quotable.io/random');
      const quote = await res.json();
      msg.reply(`💬 "${quote.content}" — ${quote.author}`);
    } catch (e) {
      msg.reply('❌ Could not fetch a quote.');
    }
  },

  'fortune': async (msg) => {
    const fortunes = [
      "You will find happiness in unexpected places.",
      "Today is a good day to start something new.",
      "Good news is coming your way.",
      "Adventure awaits you this weekend!"
    ];
    msg.reply(`🔮 ${fortunes[Math.floor(Math.random() * fortunes.length)]}`);
  },

  'compliment': async (msg) => {
    const compliments = [
      "You're amazing!",
      "You have a great sense of humor!",
      "You're really smart!",
      "You're doing great, keep it up!"
    ];
    msg.reply(`😊 ${compliments[Math.floor(Math.random() * compliments.length)]}`);
  },

  'insult': async (msg) => {
    const insults = [
      "You're as sharp as a marble.",
      "Your secrets are always safe with me. I never even listen when you tell me them.",
      "You're not stupid; you just have bad luck thinking.",
      "You're the reason they put directions on shampoo bottles."
    ];
    msg.reply(`😈 ${insults[Math.floor(Math.random() * insults.length)]}`);
  },

  'say': (msg, args) => {
    const text = args.join(' ');
    if (!text) return msg.reply('🗣️ You need to tell me what to say.');
    msg.reply(text);
  },

  'echo': (msg, args) => {
    const text = args.join(' ');
    msg.reply(`🔁 ${text}`);
  },

  'flip': (msg) => {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    msg.reply(`🪙 ${result}`);
  },

  'roll': (msg) => {
    const roll = Math.floor(Math.random() * 6) + 1;
    msg.reply(`🎲 You rolled a ${roll}`);
  },

  'random': (msg, args) => {
    if (args.length < 2) return msg.reply('⚖️ Usage: .random [option1] [option2] ...');
    const random = args[Math.floor(Math.random() * args.length)];
    msg.reply(`🎯 I choose: ${random}`);
  }
};