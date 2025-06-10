const { MessageMedia } = require('whatsapp-web.js'); const ffmpeg = require('fluent-ffmpeg'); const fs = require('fs'); const path = require('path'); const axios = require('axios'); const { exec } = require('child_process'); const tmp = require('tmp');

const downloadMedia = async (message) => { const media = await message.downloadMedia(); if (!media) throw new Error('No media found'); const extension = media.mimetype.split('/')[1]; const buffer = Buffer.from(media.data, 'base64'); const tmpFile = tmp.fileSync({ postfix: .${extension} }); fs.writeFileSync(tmpFile.name, buffer); return { path: tmpFile.name, mimetype: media.mimetype }; };

module.exports = { sticker: async (msg) => { if (!msg.hasMedia) return msg.reply('❌ Please send an image or video.'); const media = await msg.downloadMedia(); await msg.reply(media, undefined, { sendMediaAsSticker: true }); },

toimg: async (msg) => { if (!msg.hasMedia) return msg.reply('❌ Please send a sticker.'); const media = await msg.downloadMedia(); await msg.reply(media); },

gif: async (msg) => { if (!msg.hasMedia) return msg.reply('❌ Please send a video or GIF.'); const media = await msg.downloadMedia(); await msg.reply(media, undefined, { sendVideoAsGif: true }); },

ytmp3: async (msg, args) => { if (!args[0]) return msg.reply('❌ Provide a YouTube link.'); const ytdl = require('ytdl-core'); const info = await ytdl.getInfo(args[0]); const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' }); const filePath = path.join(__dirname, '../tmp/audio.mp3'); ytdl(args[0], { format: audioFormat }).pipe(fs.createWriteStream(filePath)).on('finish', async () => { const media = MessageMedia.fromFilePath(filePath); await msg.reply(media); }); },

ytmp4: async (msg, args) => { if (!args[0]) return msg.reply('❌ Provide a YouTube link.'); const ytdl = require('ytdl-core'); const info = await ytdl.getInfo(args[0]); const videoFormat = ytdl.chooseFormat(info.formats, { quality: '18' }); const filePath = path.join(__dirname, '../tmp/video.mp4'); ytdl(args[0], { format: videoFormat }).pipe(fs.createWriteStream(filePath)).on('finish', async () => { const media = MessageMedia.fromFilePath(filePath); await msg.reply(media); }); },

tomp3: async (msg) => { if (!msg.hasMedia) return msg.reply('❌ Send a video or voice message.'); const { path: input } = await downloadMedia(msg); const output = input.replace(path.extname(input), '.mp3'); exec(ffmpeg -i "${input}" -vn -ab 128k -ar 44100 -y "${output}", async (err) => { if (err) return msg.reply('❌ Error converting to MP3.'); const media = MessageMedia.fromFilePath(output); await msg.reply(media); }); },

tomp4: async (msg) => { if (!msg.hasMedia) return msg.reply('❌ Send an audio message.'); const { path: input } = await downloadMedia(msg); const output = input.replace(path.extname(input), '.mp4'); exec(ffmpeg -i "${input}" -y "${output}", async (err) => { if (err) return msg.reply('❌ Error converting to MP4.'); const media = MessageMedia.fromFilePath(output); await msg.reply(media); }); },

resize: async (msg, args) => { if (!msg.hasMedia) return msg.reply('❌ Send an image to resize.'); const { path: input } = await downloadMedia(msg); const output = input.replace(path.extname(input), '_resized.jpg'); const size = args[0] || '300x300'; exec(convert "${input}" -resize ${size} "${output}", async (err) => { if (err) return msg.reply('❌ Error resizing image.'); const media = MessageMedia.fromFilePath(output); await msg.reply(media); }); },

rotate: async (msg, args) => { if (!msg.hasMedia) return msg.reply('❌ Send an image to rotate.'); const { path: input } = await downloadMedia(msg); const output = input.replace(path.extname(input), '_rotated.jpg'); const degree = args[0] || '90'; exec(convert "${input}" -rotate ${degree} "${output}", async (err) => { if (err) return msg.reply('❌ Error rotating image.'); const media = MessageMedia.fromFilePath(output); await msg.reply(media); }); },

reverse: async (msg) => { if (!msg.hasMedia) return msg.reply('❌ Send a video to reverse.'); const { path: input } = await downloadMedia(msg); const output = input.replace(path.extname(input), '_reversed.mp4'); exec(ffmpeg -i "${input}" -vf reverse -af areverse "${output}", async (err) => { if (err) return msg.reply('❌ Error reversing video.'); const media = MessageMedia.fromFilePath(output); await msg.reply(media); }); },

crop: async (msg, args) => { if (!msg.hasMedia) return msg.reply('❌ Send an image to crop.'); const { path: input } = await downloadMedia(msg); const output = input.replace(path.extname(input), '_cropped.jpg'); const size = args[0] || '200x200+0+0'; exec(convert "${input}" -crop ${size} "${output}", async (err) => { if (err) return msg.reply('❌ Error cropping image.'); const media = MessageMedia.fromFilePath(output); await msg.reply(media); }); },

filter: async (msg, args) => { if (!msg.hasMedia) return msg.reply('❌ Send an image to apply a filter.'); const { path: input } = await downloadMedia(msg); const output = input.replace(path.extname(input), '_filtered.jpg'); const filter = args[0] || 'grayscale'; const cmd = filter === 'grayscale' ? convert "${input}" -colorspace Gray "${output}" : ''; if (!cmd) return msg.reply('❌ Unknown filter. Available: grayscale'); exec(cmd, async (err) => { if (err) return msg.reply('❌ Error applying filter.'); const media = MessageMedia.fromFilePath(output); await msg.reply(media); }); },

caption: async (msg, args) => { if (!msg.hasMedia || args.length === 0) return msg.reply('❌ Send an image and a caption.'); const media = await msg.downloadMedia(); await msg.reply(media, undefined, { caption: args.join(' ') }); },

download: async (msg) => { if (!msg.hasQuotedMsg) return msg.reply('❌ Reply to a media message to download it.'); const quoted = await msg.getQuotedMessage(); if (!quoted.hasMedia) return msg.reply('❌ The replied message has no media.'); const media = await quoted.downloadMedia(); await msg.reply(media); }, };

