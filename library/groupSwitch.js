// groupSwitch.js
const fs = require('fs');
const path = require('path');

// Direktori untuk menyimpan settings
const DATA_DIR = path.join(__dirname, 'Data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Simpan JSON ke folder ./Data/
const DATA_FILE = path.join(DATA_DIR, 'groupSettings.json');

function _read() {
    try {
        if (!fs.existsSync(DATA_FILE)) return {};
        const txt = fs.readFileSync(DATA_FILE, 'utf8') || '{}';
        return JSON.parse(txt);
    } catch (e) {
        console.error('read settings error', e);
        return {};
    }
}

function _write(obj) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf8');
    } catch (e) {
        console.error('write settings error', e);
    }
}

async function ensureGroup(groupId) {
    const s = _read();
    if (!s[groupId]) {
        s[groupId] = { welcome: true, leave: true };
        _write(s);
    }
    return s[groupId];
}

async function setGroupSwitch(groupId, which, value) {
    const s = _read();
    if (!s[groupId]) s[groupId] = { welcome: true, leave: true };

    switch (which) {
        case 'welcome': s[groupId].welcome = !!value; break;
        case 'leave': s[groupId].leave = !!value; break;
        default: throw new Error('Invalid switch key');
    }

    _write(s);
    return s[groupId];
}

async function getGroupSetting(groupId, which) {
    const s = _read();
    if (!s[groupId]) return true;
    return s[groupId][which];
}

module.exports = {
    ensureGroup,
    setGroupSwitch,
    getGroupSetting,
    DATA_FILE
};