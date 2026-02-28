const fs = require('fs')
const axios = require('axios')

// =====================
// PATH FILE
// =====================
const WELCOME_PATH = './Data/welcome.json'
const SETWELCOME_PATH = './Data/setwelcome.json'

// =====================
// FALLBACK AVATAR
// =====================
const DEFAULT_AVATAR =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png?q=60'

// =====================
// LOAD JSON AMAN
// =====================
function loadJSON(path, fallback) {
  try {
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify(fallback, null, 2))
      return fallback
    }
    return JSON.parse(fs.readFileSync(path))
  } catch {
    return fallback
  }
}

let welcomeDB = loadJSON(WELCOME_PATH, [])
let setWelcomeDB = loadJSON(SETWELCOME_PATH, {})

// =====================
// DEFAULT TEXT
// =====================
const DEFAULT_WELCOME =
  '👋 Selamat datang #user di *#group*\n👥 Member ke-#total'

const DEFAULT_LEAVE =
  '👋 #user telah keluar dari *#group*'

// =====================
// BUILD TEXT
// =====================
function buildText(template, userJid, groupName, total) {
  return template
    .replace(/#user/gi, `@${userJid.split('@')[0]}`)
    .replace(/#group/gi, groupName)
    .replace(/#total/gi, total)
}

// =====================
// MAIN HANDLER
// =====================
async function welcome(dapz, anu) {
  try {
    if (!anu?.id || !anu.action) return

    // reload db setiap event (ANTI DESYNC)
    welcomeDB = loadJSON(WELCOME_PATH, [])
    setWelcomeDB = loadJSON(SETWELCOME_PATH, {})

    const groupId = anu.id
    if (!welcomeDB.includes(groupId)) return

    const users =
      anu.participants?.length
        ? anu.participants
        : anu.participant
          ? [anu.participant]
          : []

    if (!users.length) return
    const user = users[0]

    const metadata = await dapz.groupMetadata(groupId)
    const groupName = metadata.subject
    const memberCount = metadata.participants.length

    let text = ''
    let title = ''
    let desc = ''
    let bg = global.welcomeBg || ''
    const avatar = DEFAULT_AVATAR

    // =====================
    // ACTION LOGIC
    // =====================
    if (anu.action === 'add') {
      const template =
        setWelcomeDB[groupId]?.welcome || DEFAULT_WELCOME

      text = buildText(template, user, groupName, memberCount)

      title = 'WELCOME'
      desc = `Member Baru\nTotal ${memberCount}`
    }

    else if (anu.action === 'remove') {
      const template =
        setWelcomeDB[groupId]?.leave || DEFAULT_LEAVE

      text = buildText(template, user, groupName, memberCount)

      title = 'GOOD BYE'
      desc = 'Sampai Jumpa'
    }

    else if (anu.action === 'promote') {
      text = `🎉 @${user.split('@')[0]} sekarang menjadi *Admin*`
      title = 'PROMOTED'
      desc = 'Admin Baru'
    }

    else if (anu.action === 'demote') {
      text = `⚠️ @${user.split('@')[0]} bukan admin lagi`
      title = 'DEMOTED'
      desc = 'Admin Dicabut'
    }

    else return

    // =====================
    // CANVAS API (ELRAYYXML)
    // =====================
    const api =
      `https://api.elrayyxml.web.id/api/canvas/welcomeleave?` +
      `title=${encodeURIComponent(title)}` +
      `&description=${encodeURIComponent(desc)}` +
      `&avatar=${encodeURIComponent(avatar)}` +
      `&background=${encodeURIComponent(bg)}` +
      `&border=%23ffffff` +
      `&avatarborder=%23000000`

    const res = await axios.get(api, {
      responseType: 'arraybuffer',
      timeout: 30000
    })

    await dapz.sendMessage(
      groupId,
      {
        image: Buffer.from(res.data),
        caption: text,
        mentions: [user]
      }
    )

  } catch (e) {
    console.error('[WELCOME ERROR]', e)
  }
}

module.exports = { welcome }