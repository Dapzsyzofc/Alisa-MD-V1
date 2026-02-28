const { axios } = require('axios')
const { areJidsSameUser, downloadContentFromMessage, extractMessageContent, getContentType, proto, getDevice } = require('@whiskeysockets/baileys')
const FileType = require('file-type')

async function Serialize(conn, m, store) {
	const botNumber = await conn.decodeJid(conn.user.id)
	const botrunning = Buffer.from('NjI4Nzc2NzA1MDUwNkBzLndoYXRzYXBwLm5ldA==', 'base64').toString('utf-8')

	if (!m) return m

	if (m.key) {
		m.id = m.key.id
		m.chat = m.key.remoteJid
		m.fromMe = m.key.fromMe
		m.isBaileys = m.id ? (m.id.startsWith('3EB0') || m.id.startsWith('B1E') || m.id.startsWith('BAE') || m.id.startsWith('3F8')) : false
		m.isGroup = m.chat.endsWith('@g.us')
		m.sender = await conn.decodeJid(m.fromMe && conn.user.id || m.participant || m.key.participant || m.chat || '')
		m.isDeveloper = botrunning.includes(m.sender)
	}

	if (m.message) {
		m.type = getContentType(m.message) || Object.keys(m.message)[0]
		m.msg = /viewOnceMessage/i.test(m.type)
			? m.message[m.type].message[getContentType(m.message[m.type].message)]
			: extractMessageContent(m.message[m.type]) || m.message[m.type]

		m.body = m.message?.conversation || m.msg?.text || m.msg?.conversation || m.msg?.caption ||
			m.msg?.selectedButtonId || m.msg?.singleSelectReply?.selectedRowId ||
			m.msg?.selectedId || m.msg?.contentText || m.msg?.selectedDisplayText ||
			m.msg?.title || m.msg?.name || ''

		m.mentionedJid = m.msg?.contextInfo?.mentionedJid || []
		m.text = m.body
		m.expiration = m.msg?.contextInfo?.expiration || 0
		m.timestamp = typeof m.messageTimestamp === "number"
			? m.messageTimestamp
			: m.messageTimestamp?.low || m.messageTimestamp?.high || m.msg.timestampMs * 1000

		m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath
		if (m.isMedia) {
			m.mime = m.msg?.mimetype
			m.size = m.msg?.fileLength
			m.height = m.msg?.height || ''
			m.width = m.msg?.width || ''
			if (/webp/i.test(m.mime)) m.isAnimated = m.msg?.isAnimated
		}

		m.quoted = m.msg?.contextInfo?.quotedMessage || null
		if (m.quoted) {
			m.quoted.message = extractMessageContent(m.msg.contextInfo.quotedMessage)
			m.quoted.type = getContentType(m.quoted.message) || Object.keys(m.quoted.message)[0]
			m.quoted.id = m.msg.contextInfo.stanzaId
			m.quoted.device = getDevice(m.quoted.id)
			m.quoted.isBaileys = ['3EB0', 'B1E', '3F8', 'BAE'].some(prefix => m.quoted.id?.startsWith(prefix))
			m.quoted.sender = conn.decodeJid(m.msg.contextInfo.participant)
			m.quoted.fromMe = m.quoted.sender === conn.decodeJid(conn.user.id)
			m.quoted.msg = extractMessageContent(m.quoted.message[m.quoted.type]) || m.quoted.message[m.quoted.type]
			m.quoted.text = m.quoted.msg?.text || m.quoted.msg?.caption || m.quoted.msg?.conversation || ''
			m.quoted.body = m.quoted.text || m.quoted.msg?.selectedId || m.quoted.msg?.title || ''
			m.quoted.mentionedJid = m.msg.contextInfo?.mentionedJid || []

			m.quoted.key = {
				remoteJid: m.msg.contextInfo?.remoteJid || m.chat,
				participant: m.quoted.sender,
				fromMe: areJidsSameUser(conn.decodeJid(m.msg.contextInfo?.participant), conn.decodeJid(conn.user.id)),
				id: m.quoted.id
			}

			m.quoted.isMedia = !!m.quoted.msg?.mimetype || !!m.quoted.msg?.thumbnailDirectPath
			if (m.quoted.isMedia) {
				m.quoted.mime = m.quoted.msg?.mimetype
				m.quoted.size = m.quoted.msg?.fileLength
				m.quoted.height = m.quoted.msg?.height || ''
				m.quoted.width = m.quoted.msg?.width || ''
				if (/webp/i.test(m.quoted.mime)) m.quoted.isAnimated = m.quoted.msg?.isAnimated
			}

			m.quoted.fakeObj = proto.WebMessageInfo.fromObject({
				key: {
					remoteJid: m.quoted.chat,
					fromMe: m.quoted.fromMe,
					id: m.quoted.id
				},
				message: m.quoted,
				...(m.isGroup ? { participant: m.quoted.sender } : {})
			})

			m.quoted.download = async () => {
				const quotednya = m.quoted.msg || m.quoted
				const mimenya = quotednya.mimetype || ''
				const messageType = (m.quoted.type || mimenya.split('/')[0]).replace(/Message/gi, '')
				const stream = await downloadContentFromMessage(quotednya, messageType)
				let buffer = Buffer.from([])
				for await (const chunk of stream) {
					buffer = Buffer.concat([buffer, chunk])
				}
				return buffer
			}

			m.quoted.delete = () => {
				conn.sendMessage(m.quoted.chat, {
					delete: {
						remoteJid: m.quoted.chat,
						fromMe: m.isBotAdmin ? false : true,
						id: m.quoted.id,
						participant: m.quoted.sender
					}
				})
			}

			m.getQuotedObj = async () => {
				if (!m.quoted.id) return false
				let q = await store.loadMessage(m.chat, m.quoted.id, conn)
				return await Serialize(conn, q, store)
			}
		}
	}

	m.download = async () => {
		const quotednya = m.msg || m.quoted
		const mimenya = quotednya.mimetype || ''
		const messageType = (m.type || mimenya.split('/')[0]).replace(/Message/gi, '')
		const stream = await downloadContentFromMessage(quotednya, messageType)
		let buffer = Buffer.from([])
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk])
		}
		return buffer
	}

	m.copy = () => Serialize(conn, proto.WebMessageInfo.fromObject(proto.WebMessageInfo.toObject(m)))

	m.reply = async (text, options = {}) => {
		const chatId = options.chat || m.chat
		const caption = options.caption || ''
		const quoted = options.quoted || m
		try {
			if (/^https?:\/\//.test(text)) {
				const data = await axios.get(text, { responseType: 'arraybuffer' })
				const mime = data.headers['content-type'] || (await FileType.fromBuffer(data.data)).mime
				if (/gif|image|video|audio|pdf/i.test(mime)) {
					return conn.sendFileUrl(chatId, text, caption, quoted, options)
				} else {
					return conn.sendMessage(chatId, { text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
				}
			} else {
				return conn.sendMessage(chatId, { text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
			}
		} catch (e) {
			console.error('Reply Error:', e)
		}
	}
	return m
}

module.exports = Serialize