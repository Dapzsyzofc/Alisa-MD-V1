let axios = require('axios')
let BodyForm = require('form-data')
let { fromBuffer } = require('file-type')
let fetch = require('node-fetch')
let fs = require('fs')
let cheerio = require('cheerio')

/**
 * Upload file ke Catbox dan kembalikan URL (string)
 * @param {string} filePath - path lokal file
 * @returns {Promise<string>} url atau throws
 */
async function CatBox(filePath) {
  if (!filePath) throw new Error('No file path provided to CatBox');
  if (!fs.existsSync(filePath)) throw new Error('File not found: ' + filePath);

  const form = new BodyForm();
  form.append('fileToUpload', fs.createReadStream(filePath));
  form.append('reqtype', 'fileupload');
  // form.append('userhash', '') // optional

  const headers = form.getHeaders();

  const resp = await axios.post('https://catbox.moe/user/api.php', form, { headers, timeout: 60000 });
  // Catbox biasanya mengembalikan plain text URL (atau teks error)
  if (!resp || !resp.data) throw new Error('Empty response from Catbox');
  // resp.data bisa berupa string URL atau array/obj tergantung implementasi; ambil string
  const data = resp.data;
  if (typeof data === 'string' && /^https?:\/\//i.test(data.trim())) return data.trim();
  // jika bukan string, coba cari string url di object
  const findUrl = (obj) => {
    if (!obj) return null;
    if (typeof obj === 'string' && /^https?:\/\//i.test(obj)) return obj;
    if (Array.isArray(obj)) {
      for (const it of obj) {
        const r = findUrl(it);
        if (r) return r;
      }
    } else if (typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        const r = findUrl(obj[k]);
        if (r) return r;
      }
    }
    return null;
  };
  const found = findUrl(data);
  if (found) return found.trim();

  throw new Error('Unexpected response from Catbox: ' + JSON.stringify(data).slice(0, 300));
}

module.exports = { CatBox };

function TelegraPh (Path) {
	return new Promise (async (resolve, reject) => {
		if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
		try {
			const form = new BodyForm();
			form.append("file", fs.createReadStream(Path))
			const data = await  axios({
				url: "https://telegra.ph/upload",
				method: "POST",
				headers: {
					...form.getHeaders()
				},
				data: form
			})
			return resolve("https://telegra.ph" + data.data[0].src)
		} catch (err) {
			return reject(new Error(String(err)))
		}
	})
}

async function UploadFileUgu (input) {
	return new Promise (async (resolve, reject) => {
			const form = new BodyForm();
			form.append("files[]", fs.createReadStream(input))
			await axios({
				url: "https://uguu.se/upload.php",
				method: "POST",
				headers: {
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
					...form.getHeaders()
				},
				data: form
			}).then((data) => {
				resolve(data.data.files[0])
			}).catch((err) => reject(err))
	})
}

function webp2mp4File(path) {
	return new Promise((resolve, reject) => {
		 const form = new BodyForm()
		 form.append('new-image-url', '')
		 form.append('new-image', fs.createReadStream(path))
		 axios({
			  method: 'post',
			  url: 'https://s6.ezgif.com/webp-to-mp4',
			  data: form,
			  headers: {
				   'Content-Type': `multipart/form-data; boundary=${form._boundary}`
			  }
		 }).then(({ data }) => {
			  const bodyFormThen = new BodyForm()
			  const $ = cheerio.load(data)
			  const file = $('input[name="file"]').attr('value')
			  bodyFormThen.append('file', file)
			  bodyFormThen.append('convert', "Convert WebP to MP4!")
			  axios({
				   method: 'post',
				   url: 'https://ezgif.com/webp-to-mp4/' + file,
				   data: bodyFormThen,
				   headers: {
						'Content-Type': `multipart/form-data; boundary=${bodyFormThen._boundary}`
				   }
			  }).then(({ data }) => {
				   const $ = cheerio.load(data)
				   const result = 'https:' + $('div#output > p.outfile > video > source').attr('src')
				   resolve({
						status: true,
						message: "Created By MRHRTZ",
						result: result
				   })
			  }).catch(reject)
		 }).catch(reject)
	})
}

async function floNime(medianya, options = {}) {
const { ext } = await fromBuffer(medianya) || options.ext
        var form = new BodyForm()
        form.append('file', medianya, 'tmp.'+ext)
        let jsonnya = await fetch('https://flonime.my.id/upload', {
                method: 'POST',
                body: form
        })
        .then((response) => response.json())
        return jsonnya
}

async function uptotelegra (Path) {
	return new Promise (async (resolve, reject) => {
		if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
		try {
			const form = new FormData();
			form.append("file", fs.createReadStream(Path))
			const data = await  axios({
				url: "https://telegra.ph/upload",
				method: "POST",
				headers: {
					...form.getHeaders()
				},
				data: form
			})
			return resolve("https://telegra.ph" + data.data[0].src)
		} catch (err) {
			return reject(new Error(String(err)))
		}
	})
}

module.exports = { CatBox, TelegraPh, UploadFileUgu, webp2mp4File, floNime, uptotelegra}
