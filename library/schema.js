async function LoadDataBase(conn, m) {
	try {
		const botNumber = await conn.decodeJid(conn.user.id);
		const isNumber = x => typeof x === 'number' && !isNaN(x)
		const isBoolean = x => typeof x === 'boolean' && Boolean(x)

		let setBot = global.db.settings
		if (typeof setBot !== 'object') global.db.settings = {}

		if (setBot) {
			if (!('anticall' in setBot)) setBot.anticall = false
			if (!('autobio' in setBot)) setBot.autobio = false
			if (!('autoread' in setBot)) setBot.autoread = false
			if (!('autopromosi' in setBot)) setBot.autopromosi = false
			if (!('autotyping' in setBot)) setBot.autotyping = false
			if (!('readsw' in setBot)) setBot.readsw = false
			if (!('owneroffmode' in setBot)) setBot.owneroffmode = false
			if (!('pconly' in setBot)) setBot.pconly = false
			if (!('gconly' in setBot)) setBot.gconly = false
		} else {
			global.db.settings = {
				anticall: false,
				autobio: false,
				autoread: false,
				autopromosi: false, 
				autotyping: false,
				readsw: false, 
				owneroffmode: false,
				antispam: false,
				pconly: false,
				gconly: false
			}
		}
		
		let user = global.db.users[m.sender]
		if (typeof user !== 'object') global.db.users[m.sender] = {}

		if (user) {
			if (!('status_deposit' in user)) user.status_deposit = false
			if (!('saldo' in user)) user.saldo = 0
		} else {
			global.db.users[m.sender] = {
				status_deposit: false, 
				saldo: 0
			}
		}
		
		if (m.isGroup) {
			let group = global.db.groups[m.chat]
			if (typeof group !== 'object') global.db.groups[m.chat] = {}

			if (group) {
				if (!('antilink' in group)) group.antilink = false
				if (!('antilink2' in group)) group.antilink2 = false
				if (!('antilink3' in group)) group.antilink3 = false
				if (!('welcome' in group)) group.welcome = false
				if (!('mute' in group)) group.mute = false
				if (!('antihidetag' in group)) group.antihidetag = false
				if (!('blacklistjpm' in group)) group.blacklistjpm = false
				if (!('antitagsw' in group)) group.antitagsw = false
			} else {
				global.db.groups[m.chat] = {
					antilink: false,
					antilink2: false,
					antilink3: false,
					welcome: false, 
					mute: false, 
					antihidetag: false, 
					blacklistjpm: false,
					antitagsw: false
				}
			}
		}
	} catch (e) {
		throw e;
	}
}

module.exports = LoadDataBase