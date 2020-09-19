require('dotenv').config()
const { decryptMedia, Client } = require('@open-wa/wa-automate')
const moment = require('moment-timezone')
moment.tz.setDefault('Asia/Jakarta').locale('id')
const { downloader, cekResi, removebg, urlShortener, meme, translate, getLocationData } = require('../../lib')
const quotedd = require('../../lib/quote')
const { quotemaker, liriklagu } = require('../../lib/functions')
const { msgFilter, color, processTime, isUrl } = require('../../utils')
const mentionList = require('../../utils/mention')
const { uploadImages } = require('../../utils/fetcher')

const { menuId, menuEn } = require('./text') // Indonesian & English menu

module.exports = msgHandler = async (client = new Client(), message) => {
    try {
        const { type, id, from, t, sender, isGroupMsg, chat, caption, isMedia, mimetype, quotedMsg, quotedMsgObj, mentionedJidList } = message
        let { body } = message
        const { name, formattedTitle } = chat
        let { pushname, verifiedName, formattedName } = sender
        pushname = pushname || verifiedName || formattedName // verifiedName is the name of someone who uses a business account
        const botNumber = await client.getHostNumber() + '@c.us'
        const groupId = isGroupMsg ? chat.groupMetadata.id : ''
        const groupAdmins = isGroupMsg ? await client.getGroupAdmins(groupId) : ''
        const groupMembers = isGroupMsg ? await client.getGroupMembersId(groupId) : ''
        const isGroupAdmins = groupAdmins.includes(sender.id) || false
        const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
        const isOwner = sender.id === '6289636035164@c.us'
        const processTime = now => moment.duration(now - moment(t * 1000)).asSeconds() // t => timestamp when message was received

        // Bot Prefix
        const prefix = '!'
        body = (type === 'chat' && body.startsWith(prefix)) ? body : ((type === 'image' && caption) && caption.startsWith(prefix)) ? caption : ''
        const command = body.slice(1).trim().split(/ +/).shift().toLowerCase()
        const arg = body.trim().substring(body.indexOf(' ') + 1)
        const args = body.trim().split(/ +/).slice(1)
        const isCmd = body.startsWith(prefix)
        const uaOverride = process.env.UserAgent
        const url = args.length !== 0 ? args[0] : ''
        const isQuotedImage = quotedMsg && quotedMsg.type === 'image'

        // [BETA] Avoid Spam Message
        if (isCmd && msgFilter.isFiltered(from) && !isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && msgFilter.isFiltered(from) && isGroupMsg) { return console.log(color('[SPAM]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }
        //
        if (!isCmd && !isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname)) }
        if (!isCmd && isGroupMsg) { return console.log('[RECV]', color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Message from', color(pushname), 'in', color(name || formattedTitle)) }
        if (isCmd && !isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname)) }
        if (isCmd && isGroupMsg) { console.log(color('[EXEC]'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), color(`${command} [${args.length}]`), 'from', color(pushname), 'in', color(name || formattedTitle)) }

        // [BETA] Avoid Spam Message
        msgFilter.addFilter(from)
        switch (command) {
        // Menu and TnC
        case 'speed':
        case 'ping':
            await client.sendText(from, `Pong!!!!\nSpeed: ${processTime(t, moment())} _Second_`)
            break
             case 'qmaker':
            arg = body.trim().split('|')
            if (arg.length >= 3) {
                client.reply(from, 'Sedang proses . . .', message.id) 
                const quotes = arg[1]
                const author = arg[2]
                const theme = arg[3]
                try {
                    const resolt = await quotemaker(quotes, author, theme)
                    client.sendFile(from, resolt, 'quotesmaker.jpg','Neh....', message.id)
                } catch {
                    client.reply(from, 'Maaf quotesmaker gagal di proses:(', message.id)
                }
            } else {
                client.reply(from, 'Usage: \n!quotemaker |teks|watermark|theme\n\nEx :\n!quotemaker |Dandi ganteng|@dandisubhani_|random', message.id)
            }
            break
        case 'tnc':
            await client.sendText(from, menuId.textTnC())
            break
        case 'menu':
        case 'help':
            await client.sendText(from, menuId.textMenu(pushname), message.id)
                .then(() => ((isGroupMsg) && (isGroupAdmins)) ? client.sendText(from, 'Menu Admin Grup: *!menuadmin*') : null)
            break
        case 'menuadmin':
            if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            await client.sendText(from, menuId.textAdmin())
            break
        case 'do':
        case 'd':
            await client.sendText(from, menuId.textDonasi())
            break
              case 'hi':
            client.sendFile(from, './img/yuli.jpg', 'Tutor.jpg', `Hi *${pushname}*`, message.id)
        if(isGroupMsg)
        client.sendTextWithMentions(from, `Hi juga @${message.author}`, message.id)
        break
        // Sticker Creator
           case 'sticker':
            case 'stiker':
            case 'Sticker':
            case 'Stiker':
            case '#stiker':
            case '#sticker':
            case 'P':
            case 'p':
            case '#STIKER':
            case '#STICKER':
            case 'stimker':
                if (isMedia) {
                    const mediaData = await decryptMedia(message)
                    const imageBase64 = `data:${mimetype};base64,${mediaData.toString('base64')}`
                     client.reply(from, `Hai *${pushname}*,Tunggu Ya Stiker sedang dibuat`, message.id)
                    await client.sendImageAsSticker(from, imageBase64, message.id)
                    .then(() => client.reply(from, `Follow https://instagram.com/dandisubhani_ Auto Follback:v`, message.id))
                    .then(() => client.reply(from, `Durasi Pembuatan: ${processTime(moment())} *Detik*`))
                } else if (quotedMsg && quotedMsg.type == 'image') {
                    const mediaData = await decryptMedia(quotedMsg)
                    const imageBase64 = `data:${quotedMsg.mimetype};base64,${mediaData.toString('base64')}`
                    client.reply(from, `Hi , *${pushname}* Tunggu Bentar eaaa`, message.id)
                    await client.sendImageAsSticker(from, imageBase64, message.id)
                    .then(() => client.reply(from, `Durasi Pembuatan: ${processTime(moment())} *Detik*`))
                } else if (args.length >= 1) {
                    const url = args[1]
                    if (url.match(isUrl)) {
                        await client.sendStickerfromUrl(from, url, { method: 'get' })
                            .catch(err => console.log('Caught exception: ', err))
                    } else {
                        client.sendText(from, 'Url is invalid')
                    }
                } else {
                    if(isGroupMsg) {
                        client.sendTextWithMentions(from, `@${message.author} Kirim gambar dengan caption *!P*.`)
                    } else {
                        client.reply(from, 'Cara Bikin Stiker:\nKirim Gambar Yang Pengen di Jadiin Stiker,Pake Caption !P', message)
                    }
                }
            break
            case 'quotemaker':
            client.reply(from, 'quotemaker off', message.id)
            break
            case 'ytmp3':
            client.reply(from, 'ytmp3 off', message.id)
            break
            case 'ig':
            client.reply(from, 'ig downloader bug (off)', message.id)
            break

             case 'bc':
            if(!isOwner) return client.reply(from, 'Perintah ini hanya untuk owner bot!', message.id)
            let msg = body.slice(4)
            const chatz = await client.getAllChatIds()
            for (let ids of chatz) {
                var cvk = await client.getChatById(ids)
                if (!cvk.isReadOnly) client.sendText(ids, `[ Me Bot Broadcast ]\n\n${msg}`)
            }
            client.reply(from, 'Broadcast Success!', message.id)
            break
        case 'stikergif':
        case 'stickergif':
        case 'gifstiker':
        case 'gifsticker': {
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            const isGiphy = url.match(new RegExp(/https?:\/\/(www\.)?giphy.com/, 'gi'))
            const isMediaGiphy = url.match(new RegExp(/https?:\/\/media.giphy.com\/media/, 'gi'))
            if (isGiphy) {
                const getGiphyCode = url.match(new RegExp(/(\/|\-)(?:.(?!(\/|\-)))+$/, 'gi'))
                if (!getGiphyCode) { return client.reply(from, 'Gagal mengambil kode giphy', id) }
                const giphyCode = getGiphyCode[0].replace(/[-\/]/gi, '')
                const smallGifUrl = 'https://media.giphy.com/media/' + giphyCode + '/giphy-downsized.gif'
                client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    client.reply(from, 'Here\'s your sticker')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                }).catch((err) => console.log(err))
            } else if (isMediaGiphy) {
                const gifUrl = url.match(new RegExp(/(giphy|source).(gif|mp4)/, 'gi'))
                if (!gifUrl) { return client.reply(from, 'Gagal mengambil kode giphy', id) }
                const smallGifUrl = url.replace(gifUrl[0], 'giphy-downsized.gif')
                client.sendGiphyAsSticker(from, smallGifUrl).then(() => {
                    client.reply(from, 'Here\'s your sticker')
                    console.log(`Sticker Processed for ${processTime(t, moment())} Second`)
                }).catch((err) => console.log(err))
            } else {
                await client.reply(from, 'maaf, untuk saat ini sticker gif hanya bisa menggunakan link dari giphy.  [Giphy Only]', id)
            }
            break
        }
        // Video Downloader
        case 'tiktok':
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!isUrl(url) && !url.includes('tiktok.com')) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._`, id)
            downloader.tiktok(url).then(async (videoMeta) => {
                const filename = videoMeta.authorMeta.name + '.mp4'
                const caps = `*Metadata:*\nUsername: ${videoMeta.authorMeta.name} \nMusic: ${videoMeta.musicMeta.musicName} \nView: ${videoMeta.playCount.toLocaleString()} \nLike: ${videoMeta.diggCount.toLocaleString()} \nComment: ${videoMeta.commentCount.toLocaleString()} \nShare: ${videoMeta.shareCount.toLocaleString()} \nCaption: ${videoMeta.text.trim() ? videoMeta.text : '-'}`
                await client.sendFileFromUrl(from, videoMeta.url, filename, videoMeta.NoWaterMark ? caps : `⚠ Video tanpa watermark tidak tersedia. \n\n${caps}`, '', { headers: { 'User-Agent': 'okhttp/4.5.0', referer: 'https://www.tiktok.com/' } }, true)
                    .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            }).catch(() => client.reply(from, 'Gagal mengambil metadata, link yang kamu kirim tidak valid. [Invalid Link]', id))
            break
        /*case 'ig':
        case 'instagram':
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!isUrl(url) && !url.includes('instagram.com')) return client.reply(from, 'Maaf, link yang kamu kirim tidak valid. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._ \n\n${menuId.textDonasi()}`, id)
            downloader.insta(url).then(async (data) => {
                if (data.type == 'GraphSidecar') {
                    if (data.image.length != 0) {
                        data.image.map((x) => client.sendFileFromUrl(from, x, 'photo.jpg', '', null, null, true))
                            .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                    if (data.video.length != 0) {
                        data.video.map((x) => client.sendFileFromUrl(from, x.videoUrl, 'video.jpg', '', null, null, true))
                            .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                } else if (data.type == 'GraphImage') {
                    client.sendFileFromUrl(from, data.image, 'photo.jpg', '', null, null, true)
                        .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type == 'GraphVideo') {
                    client.sendFileFromUrl(from, data.video.videoUrl, 'video.mp4', '', null, null, true)
                        .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                }
            })
                .catch((err) => {
                    if (err === 'Not a video') { return client.reply(from, 'Error, tidak ada video di link yang kamu kirim. [Invalid Link]', id) }
                    client.reply(from, 'Error, user private atau link salah [Private or Invalid Link]', id)
                })
            break
        case 'twt':
        case 'twitter':
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!isUrl(url) & !url.includes('twitter.com') || url.includes('t.co')) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid. [Invalid Link]', id)
            await client.reply(from, `_Scraping Metadata..._ \n\n${menuId.textDonasi()}`, id)
            downloader.tweet(url).then(async (data) => {
                if (data.type === 'video') {
                    const content = data.variants.filter(x => x.content_type !== 'application/x-mpegURL').sort((a, b) => b.bitrate - a.bitrate)
                    const result = await urlShortener(content[0].url)
                    console.log('Shortlink: ' + result)
                    await client.sendFileFromUrl(from, content[0].url, 'video.mp4', `Link Download: ${result} \n\nProcessed for ${processTime(t, moment())} _Second_`, null, null, true)
                        .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                        .catch((err) => console.error(err))
                } else if (data.type === 'photo') {
                    for (let i = 0; i < data.variants.length; i++) {
                        await client.sendFileFromUrl(from, data.variants[i], data.variants[i].split('/media/')[1], '', null, null, true)
                            .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                            .catch((err) => console.error(err))
                    }
                }
            })
                .catch(() => client.sendText(from, 'Maaf, link tidak valid atau tidak ada media di link yang kamu kirim. [Invalid Link]'))
            break*/
        case 'fb':
        case 'facebook':
            if (args.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!isUrl(url) && !url.includes('facebook.com')) return client.reply(from, 'Maaf, url yang kamu kirim tidak valid. [Invalid Link]', id)
            await client.reply(from, '_Scraping Metadata..._', id)
            downloader.facebook(url).then(async (videoMeta) => {
                const title = videoMeta.response.title
                const thumbnail = videoMeta.response.thumbnail
                const links = videoMeta.response.links
                const shorts = []
                for (let i = 0; i < links.length; i++) {
                    const shortener = await urlShortener(links[i].url)
                    console.log('Shortlink: ' + shortener)
                    links[i].short = shortener
                    shorts.push(links[i])
                }
                const link = shorts.map((x) => `${x.resolution} Quality: ${x.short}`)
                const caption = `Text: ${title} \n\nLink Download: \n${link.join('\n')} \n\nProcessed for ${processTime(t, moment())} _Second_`
                await client.sendFileFromUrl(from, thumbnail, 'videos.jpg', caption, null, null, true)
                    .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            })
                .catch((err) => client.reply(from, `Error, url tidak valid atau tidak memuat video. [Invalid Link or No Video] \n\n${err}`, id))
            break
        // Other Command
        case 'meme':
            if ((isMedia || isQuotedImage) && args.length >= 2) {
                const top = arg.split('|')[0]
                const bottom = arg.split('|')[1]
                const encryptMedia = isQuotedImage ? quotedMsg : message
                const mediaData = await decryptMedia(encryptMedia, uaOverride)
                const getUrl = await uploadImages(mediaData, false)
                const ImageBase64 = await meme.custom(getUrl, top, bottom)
                client.sendFile(from, ImageBase64, 'image.png', '', null, true)
                    .then((serialized) => console.log(`Sukses Mengirim File dengan id: ${serialized} diproses selama ${processTime(t, moment())}`))
                    .catch((err) => console.error(err))
            } else {
                await client.reply(from, 'Tidak ada gambar! Untuk membuka cara penggnaan kirim !menu [Wrong Format]', id)
            }
            break
            /*case 'quotemaker':
            arg = body.trim().split('|')
            if (arg.length >= 3) {
                client.reply(from, 'Sedang proses . . .', message.id) 
                const quotes = arg[1]
                const author = arg[2]
                const theme = arg[3]
                try {
                    const resolt = await quotemaker(quotes, author, theme)
                    client.sendFile(from, resolt, 'quotesmaker.jpg','Neh....', message.id)
                } catch {
                    client.reply(from, 'Maaf quotesmaker gagal di proses:(', message.id)
                }
            } else {
                client.reply(from, 'Usage: \n!quotemaker |teks|watermark|theme\n\nEx :\n!quotemaker |Dandi ganteng|@dandisubhani_|random', message.id)
            }
            break*/
        case 'linkgrup':
            if(!isBotGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', message.id)
            if(isGroupMsg) {
                const inviteLink = await client.getGroupInviteLink(groupId);
                client.sendLinkWithAutoPreview(from, inviteLink, `\nLink group *${name}*`)
            } else {
                client.reply(from, 'Perintah ini hanya bisa di gunakan dalam group!', message.id)
            }
            break
        case 'resi':
            if (args.length !== 2) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            const kurirs = ['jne', 'pos', 'tiki', 'wahana', 'jnt', 'rpx', 'sap', 'sicepat', 'pcp', 'jet', 'dse', 'first', 'ninja', 'lion', 'idl', 'rex']
            if (!kurirs.includes(args[0])) return client.sendText(from, `Maaf, jenis ekspedisi pengiriman tidak didukung layanan ini hanya mendukung ekspedisi pengiriman ${kurirs.join(', ')} Tolong periksa kembali.`)
            console.log('Memeriksa No Resi', args[1], 'dengan ekspedisi', args[0])
            cekResi(args[0], args[1]).then((result) => client.sendText(from, result))
            break
        case 'translate':
            if (args.length != 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!quotedMsg) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            const quoteText = quotedMsg.type == 'chat' ? quotedMsg.body : quotedMsg.type == 'image' ? quotedMsg.caption : ''
            translate(quoteText, args[0])
                .then((result) => client.sendText(from, result))
                .catch(() => client.sendText(from, 'Error, Kode bahasa salah.'))
            break
            case 'codebahasa':
            client.reply(from, `Hi ${pushname} Berikut adalah list kode bahasa:

  Afrikaans: "af",
  Albanian: "sq",
  Amharic: "am",
  Arabic: "ar",
  Armenian: "hy",
  Azerbaijani: "az",
  Basque: "eu",
  Belarusian: "be",
  Bengali: "bn",
  Bosnian: "bs",
  Bulgarian: "bg",
  Catalan: "ca",
  Cebuano: "ceb",
  Chichewa: "ny",
  "Chinese Simplified": "zh-cn",
  "Chinese Traditional": "zh-tw",
  Corsican: "co",
  Croatian: "hr",
  Czech: "cs",
  Danish: "da",
  Dutch: "nl",
  English: "en",
  Esperanto: "eo",
  Estonian: "et",
  Filipino: "tl",
  Finnish: "fi",
  French: "fr",
  Frisian: "fy",
  Galician: "gl",
  Georgian: "ka",
  German: "de",
  Greek: "el",
  Gujarati: "gu",
  "Haitian Creole": "ht",
  Hausa: "ha",
  Hawaiian: "haw",
  Hebrew: "iw",
  Hindi: "hi",
  Hmong: "hmn",
  Hungarian: "hu",
  Icelandic: "is",
  Igbo: "ig",
  Indonesian: "id",
  Irish: "ga",
  Italian: "it",
  Japanese: "ja",
  Javanese: "jw",
  Kannada: "kn",
  Kazakh: "kk",
  Khmer: "km",
  Korean: "ko",
  "Kurdish (Kurmanji)": "ku",
  Kyrgyz: "ky",
  Lao: "lo",
  Latin: "la",
  Latvian: "lv",
  Lithuanian: "lt",
  Luxembourgish: "lb",
  Macedonian: "mk",
  Malagasy: "mg",
  Malay: "ms",
  Malayalam: "ml",
  Maltese: "mt",
  Maori: "mi",
  Marathi: "mr",
  Mongolian: "mn",
  "Myanmar (Burmese)": "my",
  Nepali: "ne",
  Norwegian: "no",
  Pashto: "ps",
  Persian: "fa",
  Polish: "pl",
  Portuguese: "pt",
  Punjabi: "ma",
  Romanian: "ro",
  Russian: "ru",
  Samoan: "sm",
  "Scots Gaelic": "gd",
  Serbian: "sr",
  Sesotho: "st",
  Shona: "sn",
  Sindhi: "sd",
  Sinhala: "si",
  Slovak: "sk",
  Slovenian: "sl",
  Somali: "so",
  Spanish: "es",
  Sundanese: "su",
  Swahili: "sw",
  Swedish: "sv",
  Tajik: "tg",
  Tamil: "ta",
  Telugu: "te",
  Thai: "th",
  Turkish: "tr",
  Ukrainian: "uk",
  Urdu: "ur",
  Uyghur: "ug",
  Uzbek: "uz",
  Vietnamese: "vi",
  Welsh: "cy",
  Xhosa: "xh",
  Yiddish: "yi",
  Yoruba: "yo",
  Zulu: "zu"`)
            break
        case 'ceklokasi':
        case 'ceklok':
            if (quotedMsg.type !== 'location') return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            console.log(`Request Status Zona Penyebaran Covid-19 (${quotedMsg.lat}, ${quotedMsg.lng}).`)
            const zoneStatus = await getLocationData(quotedMsg.lat, quotedMsg.lng)
            if (zoneStatus.kode !== 200) client.sendText(from, 'Maaf, Terjadi error ketika memeriksa lokasi yang anda kirim.')
            let data = ''
            for (let i = 0; i < zoneStatus.data.length; i++) {
                const { zone, region } = zoneStatus.data[i]
                const _zone = zone == 'green' ? 'Hijau* (Aman) \n' : zone == 'yellow' ? 'Kuning* (Waspada) \n' : 'Merah* (Bahaya) \n'
                data += `${i + 1}. Kel. *${region}* Berstatus *Zona ${_zone}`
            }
            const text = `*CEK LOKASI PENYEBARAN COVID-19*\nHasil pemeriksaan dari lokasi yang anda kirim adalah *${zoneStatus.status}* ${zoneStatus.optional}\n\nInformasi lokasi terdampak disekitar anda:\n${data}`
            client.sendText(from, text)
            break
        case 'quote' :
        case 'quotes' :
            client.reply(from, quotedd())
            break
              case 'lirik':
            if (args.length == 0) return client.reply(from, 'Kirim perintah *!lirik* judul lagu, contoh *!lirik* aku bukan boneka', message.id)
            const lagu = body.slice(7)
            console.log(lagu)
            const lirik = await liriklagu(lagu)
            client.reply(from, lirik)
            break
            /*case 'waifu': 
            const data = fs.readFileSync('./lib/waifu.json')
            const dataJson = JSON.parse(data)
            const randIndex = Math.floor(Math.random() * dataJson.length)
            const randKey = dataJson[randIndex]
            client.sendFileFromUrl(from, randKey.image, 'Waifu.jpg', randKey.teks)
            break*/
            case 'inu':
            case 'anjing':
            const list = ["https://cdn.shibe.online/shibes/247d0ac978c9de9d9b66d72dbdc65f2dac64781d.jpg","https://cdn.shibe.online/shibes/1cf322acb7d74308995b04ea5eae7b520e0eae76.jpg","https://cdn.shibe.online/shibes/1ce955c3e49ae437dab68c09cf45297d68773adf.jpg","https://cdn.shibe.online/shibes/ec02bee661a797518d37098ab9ad0c02da0b05c3.jpg","https://cdn.shibe.online/shibes/1e6102253b51fbc116b887e3d3cde7b5c5083542.jpg","https://cdn.shibe.online/shibes/f0c07a7205d95577861eee382b4c8899ac620351.jpg","https://cdn.shibe.online/shibes/3eaf3b7427e2d375f09fc883f94fa8a6d4178a0a.jpg","https://cdn.shibe.online/shibes/c8b9fcfde23aee8d179c4c6f34d34fa41dfaffbf.jpg","https://cdn.shibe.online/shibes/55f298bc16017ed0aeae952031f0972b31c959cb.jpg","https://cdn.shibe.online/shibes/2d5dfe2b0170d5de6c8bc8a24b8ad72449fbf6f6.jpg","https://cdn.shibe.online/shibes/e9437de45e7cddd7d6c13299255e06f0f1d40918.jpg","https://cdn.shibe.online/shibes/6c32141a0d5d089971d99e51fd74207ff10751e7.jpg","https://cdn.shibe.online/shibes/028056c9f23ff40bc749a95cc7da7a4bb734e908.jpg","https://cdn.shibe.online/shibes/4fb0c8b74dbc7653e75ec1da597f0e7ac95fe788.jpg","https://cdn.shibe.online/shibes/125563d2ab4e520aaf27214483e765db9147dcb3.jpg","https://cdn.shibe.online/shibes/ea5258fad62cebe1fedcd8ec95776d6a9447698c.jpg","https://cdn.shibe.online/shibes/5ef2c83c2917e2f944910cb4a9a9b441d135f875.jpg","https://cdn.shibe.online/shibes/6d124364f02944300ae4f927b181733390edf64e.jpg","https://cdn.shibe.online/shibes/92213f0c406787acd4be252edb5e27c7e4f7a430.jpg","https://cdn.shibe.online/shibes/40fda0fd3d329be0d92dd7e436faa80db13c5017.jpg","https://cdn.shibe.online/shibes/e5c085fc427528fee7d4c3935ff4cd79af834a82.jpg","https://cdn.shibe.online/shibes/f83fa32c0da893163321b5cccab024172ddbade1.jpg","https://cdn.shibe.online/shibes/4aa2459b7f411919bf8df1991fa114e47b802957.jpg","https://cdn.shibe.online/shibes/2ef54e174f13e6aa21bb8be3c7aec2fdac6a442f.jpg","https://cdn.shibe.online/shibes/fa97547e670f23440608f333f8ec382a75ba5d94.jpg","https://cdn.shibe.online/shibes/fb1b7150ed8eb4ffa3b0e61ba47546dd6ee7d0dc.jpg","https://cdn.shibe.online/shibes/abf9fb41d914140a75d8bf8e05e4049e0a966c68.jpg","https://cdn.shibe.online/shibes/f63e3abe54c71cc0d0c567ebe8bce198589ae145.jpg","https://cdn.shibe.online/shibes/4c27b7b2395a5d051b00691cc4195ef286abf9e1.jpg","https://cdn.shibe.online/shibes/00df02e302eac0676bb03f41f4adf2b32418bac8.jpg","https://cdn.shibe.online/shibes/4deaac9baec39e8a93889a84257338ebb89eca50.jpg","https://cdn.shibe.online/shibes/199f8513d34901b0b20a33758e6ee2d768634ebb.jpg","https://cdn.shibe.online/shibes/f3efbf7a77e5797a72997869e8e2eaa9efcdceb5.jpg","https://cdn.shibe.online/shibes/39a20ccc9cdc17ea27f08643b019734453016e68.jpg","https://cdn.shibe.online/shibes/e67dea458b62cf3daa4b1e2b53a25405760af478.jpg","https://cdn.shibe.online/shibes/0a892f6554c18c8bcdab4ef7adec1387c76c6812.jpg","https://cdn.shibe.online/shibes/1b479987674c9b503f32e96e3a6aeca350a07ade.jpg","https://cdn.shibe.online/shibes/0c80fc00d82e09d593669d7cce9e273024ba7db9.jpg","https://cdn.shibe.online/shibes/bbc066183e87457b3143f71121fc9eebc40bf054.jpg","https://cdn.shibe.online/shibes/0932bf77f115057c7308ef70c3de1de7f8e7c646.jpg","https://cdn.shibe.online/shibes/9c87e6bb0f3dc938ce4c453eee176f24636440e0.jpg","https://cdn.shibe.online/shibes/0af1bcb0b13edf5e9b773e34e54dfceec8fa5849.jpg","https://cdn.shibe.online/shibes/32cf3f6eac4673d2e00f7360753c3f48ed53c650.jpg","https://cdn.shibe.online/shibes/af94d8eeb0f06a0fa06f090f404e3bbe86967949.jpg","https://cdn.shibe.online/shibes/4b55e826553b173c04c6f17aca8b0d2042d309fb.jpg","https://cdn.shibe.online/shibes/a0e53593393b6c724956f9abe0abb112f7506b7b.jpg","https://cdn.shibe.online/shibes/7eba25846f69b01ec04de1cae9fed4b45c203e87.jpg","https://cdn.shibe.online/shibes/fec6620d74bcb17b210e2cedca72547a332030d0.jpg","https://cdn.shibe.online/shibes/26cf6be03456a2609963d8fcf52cc3746fcb222c.jpg","https://cdn.shibe.online/shibes/c41b5da03ad74b08b7919afc6caf2dd345b3e591.jpg","https://cdn.shibe.online/shibes/7a9997f817ccdabac11d1f51fac563242658d654.jpg","https://cdn.shibe.online/shibes/7221241bad7da783c3c4d84cfedbeb21b9e4deea.jpg","https://cdn.shibe.online/shibes/283829584e6425421059c57d001c91b9dc86f33b.jpg","https://cdn.shibe.online/shibes/5145c9d3c3603c9e626585cce8cffdfcac081b31.jpg","https://cdn.shibe.online/shibes/b359c891e39994af83cf45738b28e499cb8ffe74.jpg","https://cdn.shibe.online/shibes/0b77f74a5d9afaa4b5094b28a6f3ee60efcb3874.jpg","https://cdn.shibe.online/shibes/adccfdf7d4d3332186c62ed8eb254a49b889c6f9.jpg","https://cdn.shibe.online/shibes/3aac69180f777512d5dabd33b09f531b7a845331.jpg","https://cdn.shibe.online/shibes/1d25e4f592db83039585fa480676687861498db8.jpg","https://cdn.shibe.online/shibes/d8349a2436420cf5a89a0010e91bf8dfbdd9d1cc.jpg","https://cdn.shibe.online/shibes/eb465ef1906dccd215e7a243b146c19e1af66c67.jpg","https://cdn.shibe.online/shibes/3d14e3c32863195869e7a8ba22229f457780008b.jpg","https://cdn.shibe.online/shibes/79cedc1a08302056f9819f39dcdf8eb4209551a3.jpg","https://cdn.shibe.online/shibes/4440aa827f88c04baa9c946f72fc688a34173581.jpg","https://cdn.shibe.online/shibes/94ea4a2d4b9cb852e9c1ff599f6a4acfa41a0c55.jpg","https://cdn.shibe.online/shibes/f4478196e441aef0ada61bbebe96ac9a573b2e5d.jpg","https://cdn.shibe.online/shibes/96d4db7c073526a35c626fc7518800586fd4ce67.jpg","https://cdn.shibe.online/shibes/196f3ed10ee98557328c7b5db98ac4a539224927.jpg","https://cdn.shibe.online/shibes/d12b07349029ca015d555849bcbd564d8b69fdbf.jpg","https://cdn.shibe.online/shibes/80fba84353000476400a9849da045611a590c79f.jpg","https://cdn.shibe.online/shibes/94cb90933e179375608c5c58b3d8658ef136ad3c.jpg","https://cdn.shibe.online/shibes/8447e67b5d622ef0593485316b0c87940a0ef435.jpg","https://cdn.shibe.online/shibes/c39a1d83ad44d2427fc8090298c1062d1d849f7e.jpg","https://cdn.shibe.online/shibes/6f38b9b5b8dbf187f6e3313d6e7583ec3b942472.jpg","https://cdn.shibe.online/shibes/81a2cbb9a91c6b1d55dcc702cd3f9cfd9a111cae.jpg","https://cdn.shibe.online/shibes/f1f6ed56c814bd939645138b8e195ff392dfd799.jpg","https://cdn.shibe.online/shibes/204a4c43cfad1cdc1b76cccb4b9a6dcb4a5246d8.jpg","https://cdn.shibe.online/shibes/9f34919b6154a88afc7d001c9d5f79b2e465806f.jpg","https://cdn.shibe.online/shibes/6f556a64a4885186331747c432c4ef4820620d14.jpg","https://cdn.shibe.online/shibes/bbd18ae7aaf976f745bc3dff46b49641313c26a9.jpg","https://cdn.shibe.online/shibes/6a2b286a28183267fca2200d7c677eba73b1217d.jpg","https://cdn.shibe.online/shibes/06767701966ed64fa7eff2d8d9e018e9f10487ee.jpg","https://cdn.shibe.online/shibes/7aafa4880b15b8f75d916b31485458b4a8d96815.jpg","https://cdn.shibe.online/shibes/b501169755bcf5c1eca874ab116a2802b6e51a2e.jpg","https://cdn.shibe.online/shibes/a8989bad101f35cf94213f17968c33c3031c16fc.jpg","https://cdn.shibe.online/shibes/f5d78feb3baa0835056f15ff9ced8e3c32bb07e8.jpg","https://cdn.shibe.online/shibes/75db0c76e86fbcf81d3946104c619a7950e62783.jpg","https://cdn.shibe.online/shibes/8ac387d1b252595bbd0723a1995f17405386b794.jpg","https://cdn.shibe.online/shibes/4379491ef4662faa178f791cc592b52653fb24b3.jpg","https://cdn.shibe.online/shibes/4caeee5f80add8c3db9990663a356e4eec12fc0a.jpg","https://cdn.shibe.online/shibes/99ef30ea8bb6064129da36e5673649e957cc76c0.jpg","https://cdn.shibe.online/shibes/aeac6a5b0a07a00fba0ba953af27734d2361fc10.jpg","https://cdn.shibe.online/shibes/9a217cfa377cc50dd8465d251731be05559b2142.jpg","https://cdn.shibe.online/shibes/65f6047d8e1d247af353532db018b08a928fd62a.jpg","https://cdn.shibe.online/shibes/fcead395cbf330b02978f9463ac125074ac87ab4.jpg","https://cdn.shibe.online/shibes/79451dc808a3a73f99c339f485c2bde833380af0.jpg","https://cdn.shibe.online/shibes/bedf90869797983017f764165a5d97a630b7054b.jpg","https://cdn.shibe.online/shibes/dd20e5801badd797513729a3645c502ae4629247.jpg","https://cdn.shibe.online/shibes/88361ee50b544cb1623cb259bcf07b9850183e65.jpg","https://cdn.shibe.online/shibes/0ebcfd98e8aa61c048968cb37f66a2b5d9d54d4b.jpg"]
            let kya = list[Math.floor(Math.random() * list.length)]
            client.sendFileFromUrl(from, kya, 'Dog.jpeg', 'Anjing:v', message.id)
            break
            case 'neko': 
            case 'kucing':         
            q2 = Math.floor(Math.random() * 900) + 300;
            q3 = Math.floor(Math.random() * 900) + 300;
            client.sendFileFromUrl(from, 'http://placekitten.com/'+q3+'/'+q2, 'neko.png','Kucing ', message.id)
            break
            case 'pokemon':
            q7 = Math.floor(Math.random() * 890) + 1;
            client.sendFileFromUrl(from, 'https://assets.pokemon.com/assets/cms2/img/pokedex/full/'+q7+'.png','Pokemon.png',)
            break
            case 'wallpaper' :
            q4 = Math.floor(Math.random() * 800) + 100;
            client.sendFileFromUrl(from, 'https://wallpaperaccess.com/download/anime-'+q4,'Liat dikamera wa.png','coba liat di kamera wa')
            break
           case 'tagall':
           case 'absen':
           case 'mentionall':
            if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            const groupMem = await client.getGroupMembers(groupId)
            let hehe = '╔══✪〘 Absen dulu woi 〙✪══\n'
            for (let i = 0; i < groupMem.length; i++) {
                hehe += '╠➥'
                hehe += ` @${groupMem[i].id.replace(/@c.us/g, '')}\n`
            }
            hehe += '╚═〘 @dandisubhani_ 〙'
            client.sendTextWithMentions(from, hehe, message.id)
            break
            case 'tts':
            if (args.length == 0) return client.reply(from, 'Kirim perintah *!tts* [id, en, jp, ar] <teks>, contoh *!tts* id halo semua')
            const ttsId = require('node-gtts')('id')
                const ttsEn = require('node-gtts')('en')
            const ttsJp = require('node-gtts')('ja')
                const ttsAr = require('node-gtts')('ar')
                const dataText = body.slice(8)
                var dataBhs = body.slice(5, 7)
            if (dataBhs == 'id') {
                    ttsId.save('./tts/resId.mp3', dataText, function () {
                        client.sendPtt(from, './tts/resId.mp3', message.id)
                })
        } else if (dataBhs == 'en') {
                    ttsEn.save('./tts/resEn.mp3', dataText, function () {
                        client.sendPtt(from, './tts/resEn.mp3', message.id)
                })
        } else if (dataBhs == 'jp') {
                    ttsJp.save('./tts/resJp.mp3', dataText, function () {
                        client.sendPtt(from, './tts/resJp.mp3', message.id)
                })
        } else if (dataBhs == 'ar') {
                    ttsAr.save('./tts/resAr.mp3', dataText, function () {
                        client.sendPtt(from, './tts/resAr.mp3', message.id)
                })
        } else {
            client.reply(from, 'Masukkan data bahasa : [id] untuk indonesia, [en] untuk inggris, [jp] untuk jepang, dan [ar] untuk arab', message.id)
            }
            break
        // Group Commands (group admin only)
          case 'add':
            if(!isGroupMsg) return client.reply(from, 'Fitur ini hanya bisa di gunakan dalam group', message.id)
            if(args.length == 0) return client.reply(from, 'Untuk menggunakan fitur ini, kirim perintah *!add* 628xxxxx', message.id)
            if(!isGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan oleh admin group', message.id)
            if(!isBotGroupAdmins) return client.reply(from, 'Perintah ini hanya bisa di gunakan ketika bot menjadi admin', message.id)
            try {
                await client.addParticipant(from,`${body.slice(5)}@c.us`)
            } catch {
                client.reply(from, `Tidak dapat menambahkan ${body.slice(5)} mungkin karena di private`, message.id)
            }
            break
        case 'kick':
            if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup! [Bot Not Admin]', id)
            if (mentionedJidList.length === 0) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            await client.sendTextWithMentions(from, `Request diterima, mengeluarkan:\n${mentionedJidList.map(x => `@${x.replace('@c.us', '')}`).join('\n')}`)
            for (let i = 0; i < mentionedJidList.length; i++) {
                if (groupAdmins.includes(mentionedJidList[i])) return await client.sendText(from, 'Gagal, kamu tidak bisa mengeluarkan admin grup.')
                await client.removeParticipant(groupId, mentionedJidList[i])
            }
            break
        case 'promote':
            if (!isGroupMsg) return await client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
            if (!isGroupAdmins) return await client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            if (!isBotGroupAdmins) return await client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup! [Bot not Admin]', id)
            if (mentionedJidList.length != 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format, Only 1 user]', id)
            if (groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Maaf, user tersebut sudah menjadi admin. [Bot is Admin]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            await client.promoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Request diterima, menambahkan @${mentionedJidList[0].replace('@c.us', '')} sebagai admin.`)
            break
        case 'demote':
            if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            if (!isBotGroupAdmins) return client.reply(from, 'Gagal, silahkan tambahkan bot sebagai admin grup! [Bot not Admin]', id)
            if (mentionedJidList.length !== 1) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format, Only 1 user]', id)
            if (!groupAdmins.includes(mentionedJidList[0])) return await client.reply(from, 'Maaf, user tersebut tidak menjadi admin. [user not Admin]', id)
            if (mentionedJidList[0] === botNumber) return await client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            await client.demoteParticipant(groupId, mentionedJidList[0])
            await client.sendTextWithMentions(from, `Request diterima, menghapus jabatan @${mentionedJidList[0].replace('@c.us', '')}.`)
            break
        case 'bye':
            if (!isGroupMsg) return client.reply(from, 'Maaf, perintah ini hanya dapat dipakai didalam grup! [Group Only]', id)
            if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            client.sendText(from, 'Good bye... ( ⇀‸↼‶ )').then(() => client.leaveGroup(groupId))
            break
        case 'del':
            if (!isGroupAdmins) return client.reply(from, 'Gagal, perintah ini hanya dapat digunakan oleh admin grup! [Admin Group Only]', id)
            if (!quotedMsg) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            if (!quotedMsgObj.fromMe) return client.reply(from, 'Maaf, format pesan salah silahkan periksa menu. [Wrong Format]', id)
            client.deleteMessage(quotedMsgObj.chatId, quotedMsgObj.id, false)
            break
        case 'tagall':
        case 'everyone':
            /**
            * This is Premium feature.
            * Check premium feature at https://trakteer.id/red-emperor/showcase or chat Author for Information.
            */
            client.reply(from, 'ehhh, what\'s that???', id)
            break
        case 'botstat': {
            const loadedMsg = await client.getAmountOfLoadedMessages()
            const chatIds = await client.getAllChatIds()
            const groups = await client.getAllGroups()
            client.sendText(from, `Status :\n- *${loadedMsg}* Loaded Messages\n- *${groups.length}* Group Chats\n- *${chatIds.length - groups.length}* Personal Chats\n- *${chatIds.length}* Total Chats`)
            break
        }
        default:
            console.log(color('[ERROR]', 'red'), color(moment(t * 1000).format('DD/MM/YY HH:mm:ss'), 'yellow'), 'Unregistered Command from', color(pushname))
            break
        }
    } catch (err) {
        console.log(color('[ERROR]', 'red'), err)
    }
}
