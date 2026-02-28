/* SC ALISA MD BY DAPZSYZ!!
Rename? Boleh
Note!! No Hapus Credit
Hapus Credit? Gw Ga Update Lagi!!

© DapzSYZ
*/

console.clear();
require('./config');

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    delay,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeCacheableSignalKeyStore,
    makeInMemoryStore,
    jidDecode,
    proto,
    Browsers, 
    getAggregateVotesInPollMessage
} = require("@whiskeysockets/baileys");

const chalk = require('chalk');
const axios = require('axios');
const pino = require('pino');
const crypto = require('crypto')
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const FileType = require('file-type');
const readline = require("readline");
const PhoneNumber = require('awesome-phonenumber');
const path = require('path');
const NodeCache = require("node-cache");
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, sleep } = require('./System/Data1.js');
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./System/Data2.js');
const { color, bgcolor } = require('./library/color')
const { start } = require('./library/spinner')
let _welcome = JSON.parse(fs.readFileSync('./Data/welcome.json'))
let _left = JSON.parse(fs.readFileSync('./Data/left.json'))

const pushnameDB = require('./Data/pushname.json')
function savePushName(jid, pushname) {
  if (!jid || !pushname) return
  pushnameDB[jid] = pushname
  fs.writeFileSync('./Data/pushname.json', JSON.stringify(pushnameDB, null, 2))
}

const prefix = ''
global.db = global.db || {}
global.db.settings = global.db.settings || {}
global.db = JSON.parse(fs.readFileSync('./library/database/database.json'))
if (global.db) global.db = {
sticker: {},
database: {}, 
groups: {}, 
game: {},
others: {},
users: {},
chats: {},
settings: {},
...(global.db || {})
}

const usePairingCode = global.connect;
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(text, ans => { rl.close(); resolve(ans); }));
};

const groupMetadataCache = new Map()

async function StartBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const version = (await (await fetch('https://raw.githubusercontent.com/Itsukichann/Baileys/refs/heads/master/lib/Defaults/baileys-version.json')).json()).version;

    const dapz = makeWASocket({
        printQRInTerminal: !usePairingCode,
        generateHighQualityLinkPreview: true,
        patchMessageBeforeSending: (message) => {
            const requiresPatch = !!(message.buttonsMessage || message.templateMessage || message.listMessage);
            return requiresPatch ? {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadataVersion: 2,
                            deviceListMetadata: {},
                        },
                        ...message,
                    },
                },
            } : message;
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        logger: pino({ level: 'fatal' }),
        auth: state, 
        cachedGroupMetadata: async (jid) => {
      if (groupMetadataCache.has(jid)) {
        return groupMetadataCache.get(jid);
      }

      try {
        const metadata = await dapz.groupMetadata(jid);
        groupMetadataCache.set(jid, metadata); 
        return metadata;
      } catch (err) {
        console.error(`Failed to fetch metadata for group ${jid}:`, err);
        return null;
      }
    }
    });

    if (
  usePairingCode &&
  !dapz.authState.creds.registered &&
  !global.pairingRequested
) {
  global.pairingRequested = true

  const phoneNumber = await question(
    chalk.yellow('\nMasukkan nomor WhatsApp (contoh: 628xxxx):\n')
  )

  try {
    const code = await dapz.requestPairingCode(phoneNumber.trim(), 'ALYADAPZ')
    console.log(
      chalk.green('\n🔐 KODE PAIRING ANDA:\n'),
      chalk.bold(code.match(/.{1,4}/g).join('-'))
    )
    console.log(chalk.cyan('📲 Masukkan kode di WhatsApp → Perangkat Tertaut'))
  } catch (err) {
    console.error(chalk.red('❌ Gagal meminta pairing code:'), err)
    global.pairingRequested = false
  }
}

    store.bind(dapz.ev);

    dapz.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server && decode.user + '@' + decode.server || jid;
        }
        return jid;
    };
   

dapz.ev.on('group-participants.update', async (anu) => {
  try {
    const { welcome } = require('./library/welcome')
    await welcome(dapz, anu)
  } catch (e) {
    console.log(e)
  }
})
    // ===== LOAD DATABASE =====
global.db = JSON.parse(fs.readFileSync('./library/database/database.json'))


    
dapz.ev.on("messages.upsert", async (chatUpdate) => {
  try {
    const mek = chatUpdate.messages[0];
    if (!mek?.message) return;

    const jid = mek.key.remoteJid
    const isGroup = jid.endsWith('@g.us')
    const sender = mek.key.participant || mek.key.remoteJid

    // ===== ONLY GROUP / ONLY PRIVATE FILTER (GLOBAL) =====
    if (!mek.key.fromMe && global.db?.settings?.[botNumber]) {

      // only group ON → blok private
      if (db.settings[botNumber].onlygroup && !isGroup) {
        return
      }

      // only private ON → blok group
      if (db.settings[botNumber].onlypc && isGroup) {
        return
      }
    }

    // ===== LANJUT NORMAL =====
    mek.message = mek.message?.ephemeralMessage?.message || mek.message;
    if (!dapz.public && !mek.key.fromMe && chatUpdate.type === 'notify') return;
    if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return;
    if (mek.key.id.length < 32) return;

    const m = smsg(dapz, mek, store);
const { savePushName } = require('./library/pushnameCache')

if (m?.sender && m?.pushName) {
  savePushName(m.sender, m.pushName)
}
    require("./case")(dapz, m, chatUpdate, groupMetadataCache);

  } catch (err) {
    console.log(err);
  }
});
    dapz.ev.on('messages.update', async chatUpdate => {
        for(const { key, update } of chatUpdate) {
			if(update.pollUpdates && !key.fromMe) {
				const pollCreation = await getMessage(key)
				if(pollCreation) {
				    const pollUpdate = await getAggregateVotesInPollMessage({
							message: pollCreation,
							pollUpdates: update.pollUpdates,
						})
	                var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name
	                if (toCmd == undefined) return
                    var prefCmd = prefix+toCmd
	                dapz.appenTextMessage(prefCmd, chatUpdate)
				}
			}
		}
    })
    dapz.sendTextWithMentions = async (jid, text, quoted, options = {}) => dapz.sendMessage(jid, { text: text, contextInfo: { mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, ...options }, { quoted })

    dapz.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = dapz.decodeJid(contact.id);
            if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
        }
    });

    dapz.ev.on('call', async () => {
        console.log("CALL OUTGOING");
    });

    dapz.getFile = async (PATH, save) => {
        let res;
        let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split(',')[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? fs.readFileSync(PATH) : Buffer.alloc(0);
        let type = await FileType.fromBuffer(data) || { mime: 'application/octet-stream', ext: '.bin' };
        const filename = path.join(__dirname, '/' + new Date * 1 + '.' + type.ext);
        if (save) await fs.promises.writeFile(filename, data);
        return { res, filename, size: await getSizeMedia(data), ...type, data };
    };

    dapz.downloadMediaMessage = async (message) => {
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(message, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        return buffer;
    };

    dapz.sendText = (jid, text, quoted = '', options) => dapz.sendMessage(jid, { text, ...options }, { quoted });

    dapz.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split(',')[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let buffer = (options.packname || options.author) ? await writeExifImg(buff, options) : await imageToWebp(buff);
        await dapz.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
        return buffer;
    };

    dapz.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
        let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split(',')[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
        let buffer = (options.packname || options.author) ? await writeExifVid(buff, options) : await videoToWebp(buff);
        await dapz.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
        return buffer;
    };

    dapz.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let quoted = message.msg ? message.msg : message;
        let mime = (message.msg || message).mimetype || '';
        let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0];
        const stream = await downloadContentFromMessage(quoted, messageType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        let type = await FileType.fromBuffer(buffer);
        let trueFileName = attachExtension ? (filename + '.' + type.ext) : filename;
        await fs.writeFileSync(trueFileName, buffer);
        return trueFileName;
    };

    dapz.sendMedia = async (jid, path, caption = '', quoted = '', options = {}) => {
        let { mime, data } = await dapz.getFile(path, true);
        let messageType = mime.split('/')[0];
        let messageContent = {};

        if (messageType === 'image') {
            messageContent = { image: data, caption, ...options };
        } else if (messageType === 'video') {
            messageContent = { video: data, caption, ...options };
        } else if (messageType === 'audio') {
            messageContent = { audio: data, ptt: options.ptt || false, ...options };
        } else {
            messageContent = { document: data, mimetype: mime, fileName: options.fileName || 'file' };
        }

        await dapz.sendMessage(jid, messageContent, { quoted });
    };

    dapz.sendPoll = async (jid, question, options) => {
        await dapz.sendMessage(jid, {
            pollCreationMessage: {
                name: question,
                options: options.map(option => ({ optionName: option })),
                selectableCount: 1
            }
        });
    };
    
    dapz.getName = (jid, withoutContact  = false) => {
id = dapz.decodeJid(jid)
withoutContact = dapz.withoutContact || withoutContact 
let v
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {}
if (!(v.name || v.subject)) v = dapz.groupMetadata(id) || {}
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
})
else v = id === '0@s.whatsapp.net' ? {
id,
name: 'WhatsApp'
} : id === dapz.decodeJid(dapz.user.id) ?
dapz.user :
(store.contacts[id] || {})
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

    dapz.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	    list.push({
	    	displayName: await dapz.getName(i),
	    	vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await dapz.getName(i)}\nFN:${await dapz.getName(i)}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Click here to chat\nitem2.EMAIL;type=INTERNET:${ytname}\nitem2.X-ABLabel:YouTube\nitem3.URL:${socialm}\nitem3.X-ABLabel:GitHub\nitem4.ADR:;;${location};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	    })
	}
	dapz.sendMessage(jid, { contacts: { displayName: `${list.length} Contact`, contacts: list }, ...opts }, { quoted })
    }
    
    dapz.public = global.publicX;
    global.veoJobs = global.veoJobs || {}
    
    dapz.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
  const statusCode = lastDisconnect?.error?.output?.statusCode

  // JANGAN reconnect saat pairing
  if (statusCode === DisconnectReason.loggedOut) {
    console.log(chalk.red('❌ Logged out, hapus session dan restart bot'))
  } else {
    console.log(chalk.yellow('🔄 Reconnecting...'))
    StartBot()
  }
} if (update.connection == "connecting" || update.receivedPendingNotifications == "false") {
			console.log(color(`\n👀Menghubungkan...`, 'yellow'))
		}
          if (connection === 'open') {
            // ===== DAPATKAN NOMOR BOT =====
global.botNumber = dapz.user.id.split(':')[0] + '@s.whatsapp.net'
// ===== DEFAULT SETTINGS BOT =====
if (!db.settings) db.settings = {}
if (!db.settings[botNumber]) {
    db.settings[botNumber] = {
        onlygroup: false,
        onlypc: false
    }
}
            await delay(5000);
            	{
            await dapz.groupAcceptInvite("JsHEoscTQjg2crtAlVJgNF");
        }
dapz.newsletterFollow("120363397787532298@newsletter")
dapz.newsletterFollow("120363419938392281@newsletter")
dapz.newsletterFollow("120363403088190386@newsletter")
dapz.newsletterFollow("120363401425960788@newsletter")
dapz.newsletterFollow("120363402984117316@newsletter")
dapz.newsletterFollow("120363401712599053@newsletter")
dapz.newsletterFollow("120363403341539432@newsletter")
        }
    });
    
    dapz.setStatus = async (status) => {
        await dapz.query({
            tag: 'iq',
            attrs: { to: '@s.whatsapp.net', type: 'set', xmlns: 'status' },
            content: [{ tag: 'status', attrs: {}, content: Buffer.from(status, 'utf-8') }],
        });
        console.log(chalk.yellow(`Status updated: ${status}`));
    };


    dapz.ev.on('error', (err) => {
        console.error(chalk.red("Error: "), err?.message || err);
    });

    dapz.ev.on('creds.update', saveCreds);
}

StartBot();
