const ytdl = require('ytdl-core');
const SpotifyWebApi = require('spotify-web-api-node');
const axios = require('axios');

let queue = [];  // Simple in-memory music queue
let nowPlaying = null;

// Setup Spotify API client (You need to add your client ID/secret and get tokens)
const spotifyApi = new SpotifyWebApi({
  clientId: 'your_spotify_client_id',
  clientSecret: 'your_spotify_client_secret',
  redirectUri: 'your_redirect_uri'
});

async function play(message, args) {
  if (!args.length) return message.reply('❌ Please provide a song name or YouTube link.');

  let query = args.join(' ');
  let url = '';

  if (ytdl.validateURL(query)) {
    url = query;
  } else {
    // Search YouTube for the song
    const searchResult = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        key: 'your_youtube_api_key',
        part: 'snippet',
        maxResults: 1,
        q: query,
        type: 'video'
      }
    });
    if (!searchResult.data.items.length) {
      return message.reply('❌ No results found on YouTube.');
    }
    url = `https://www.youtube.com/watch?v=${searchResult.data.items[0].id.videoId}`;
  }

  queue.push(url);
  if (!nowPlaying) {
    nowPlaying = queue.shift();
    message.reply(`▶️ Now playing: ${nowPlaying}`);
  } else {
    message.reply(`✅ Added to queue: ${url}`);
  }
}

async function stop(message) {
  if (!nowPlaying) return message.reply('❌ Nothing is playing right now.');
  nowPlaying = null;
  queue = [];
  message.reply('⏹️ Stopped playback and cleared the queue.');
}

async function queueCmd(message) {
  if (!queue.length) return message.reply('ℹ️ The queue is empty.');
  let text = '🎵 **Current Queue:**\n';
  queue.forEach((link, idx) => {
    text += `${idx + 1}. ${link}\n`;
  });
  message.reply(text);
}

async function nowplaying(message) {
  if (!nowPlaying) return message.reply('ℹ️ No song is currently playing.');
  message.reply(`▶️ Now playing: ${nowPlaying}`);
}

async function lyrics(message, args) {
  if (!args.length) return message.reply('❌ Please provide a song name or artist.');
  const query = args.join(' ');
  try {
    const response = await axios.get(`https://some-lyrics-api.com/api/lyrics/${encodeURIComponent(query)}`);
    if (response.data && response.data.lyrics) {
      message.reply(`🎶 Lyrics for *${query}*:\n\n${response.data.lyrics}`);
    } else {
      message.reply('❌ Lyrics not found.');
    }
  } catch (err) {
    message.reply('❌ Error fetching lyrics.');
  }
}

async function spotify(message, args) {
  if (!args.length) return message.reply('❌ Please provide a Spotify track or artist name.');
  const query = args.join(' ');
  // For simplicity: this example searches tracks on Spotify and sends basic info
  try {
    const data = await spotifyApi.searchTracks(query, { limit: 1 });
    if (!data.body.tracks.items.length) return message.reply('❌ No tracks found on Spotify.');
    const track = data.body.tracks.items[0];
    let text = `🎵 *${track.name}* by *${track.artists.map(a => a.name).join(', ')}*\n`;
    text += `Album: ${track.album.name}\n`;
    text += `Preview: ${track.preview_url || 'Not available'}\n`;
    text += `Link: ${track.external_urls.spotify}`;
    message.reply(text);
  } catch (e) {
    message.reply('❌ Error fetching Spotify info.');
  }
}

async function ytsearch(message, args) {
  if (!args.length) return message.reply('❌ Provide search keywords.');
  const query = args.join(' ');
  try {
    const searchResult = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
        key: 'your_youtube_api_key',
        part: 'snippet',
        maxResults: 3,
        q: query,
        type: 'video'
      }
    });
    if (!searchResult.data.items.length) {
      return message.reply('❌ No results found on YouTube.');
    }
    let text = '🔎 *YouTube Search Results:*\n';
    searchResult.data.items.forEach((item, idx) => {
      text += `${idx + 1}. ${item.snippet.title}\nhttps://youtu.be/${item.id.videoId}\n\n`;
    });
    message.reply(text);
  } catch (err) {
    message.reply('❌ Error searching YouTube.');
  }
}

module.exports = {
  play,
  stop,
  queue: queueCmd,
  nowplaying,
  lyrics,
  spotify,
  ytsearch,
  // Additional commands (pause, resume, skip, volume, shuffle, repeat, join, leave, playlist) can be added similarly
};