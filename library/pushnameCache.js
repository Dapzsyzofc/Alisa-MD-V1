const fs = require('fs')
const path = './Data/pushname.json'

let cache = {}
if (fs.existsSync(path)) {
  cache = JSON.parse(fs.readFileSync(path))
}

function savePushName(jid, name) {
  if (!jid || !name) return
  cache[jid] = name
  fs.writeFileSync(path, JSON.stringify(cache, null, 2))
}

function getPushName(jid) {
  return cache[jid] || null
}

module.exports = { savePushName, getPushName }