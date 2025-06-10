const axios = require('axios');

const memeCommands = [
  { name: 'meme', subreddit: '' },
  { name: 'dankmeme', subreddit: 'dankmemes' },
  { name: 'wholesomememe', subreddit: 'wholesomememes' },
  { name: 'me_irl', subreddit: 'me_irl' },
  { name: '2meirl4meirl', subreddit: '2meirl4meirl' },
  { name: 'funny', subreddit: 'funny' },
  { name: 'memes', subreddit: 'memes' },
  { name: 'comedyheaven', subreddit: 'comedyheaven' },
  { name: 'historymemes', subreddit: 'historymemes' },
  { name: 'prequelmemes', subreddit: 'prequelmemes' },
  { name: 'terriblefacebookmemes', subreddit: 'terriblefacebookmemes' },
  { name: 'programmerhumor', subreddit: 'programmerhumor' },
  { name: 'techsupportmemes', subreddit: 'techsupportmemes' },
  { name: 'animemes', subreddit: 'animemes' },
  { name: 'AdviceAnimals', subreddit: 'AdviceAnimals' },
];

module.exports = memeCommands.map(({ name, subreddit }) => ({
  name,
  description: `Sends a random meme from ${subreddit || 'general'}`,
  async execute(client, message, args) {
    try {
      const url = subreddit
        ? `https://meme-api.com/gimme/${subreddit}`
        : 'https://meme-api.com/gimme';

      const response = await axios.get(url);
      const meme = response.data;

      if (!meme || !meme.url) {
        return message.reply('Sorry, no memes available at the moment.');
      }

      await client.sendMessage(message.from, meme.url, { caption: meme.title });
    } catch (error) {
      console.error(`Error fetching meme for command ${name}:`, error);
      message.reply('Oops! Something went wrong while fetching the meme.');
    }
  },
}));