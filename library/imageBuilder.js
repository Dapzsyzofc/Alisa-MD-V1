// imageBuilder.js
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fetch = require('node-fetch');

// fetch URL → Buffer
async function fetchBuffer(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('fetch failed');
        return await res.buffer();
    } catch {
        return null;
    }
}

// avatar handler
async function prepareAvatar(pp) {
    if (!pp) return null;
    if (Buffer.isBuffer(pp)) return pp;
    if (typeof pp === 'string') return await fetchBuffer(pp);
    return null;
}

// main builder
async function buildBase({ avatarBuffer, username='', subtitle='', backgroundUrl }) {
    const width = 1280, height = 720;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // background dari URL
    try {
        const bgBuf = await fetchBuffer(backgroundUrl);
        const bg = await loadImage(bgBuf);
        ctx.drawImage(bg, 0, 0, width, height);
    } catch {
        ctx.fillStyle = '#111827';
        ctx.fillRect(0,0,width,height);
    }

    // overlay teks
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.fillRect(0, height - 170, width, 170);

    // avatar
    const avatarSize = 260;
    const avatarX = width / 2 - avatarSize / 2;
    const avatarY = height / 2 - avatarSize / 2 - 30;

    if (avatarBuffer) {
        try {
            const img = await loadImage(avatarBuffer);

            // lingkaran putih
            ctx.beginPath();
            ctx.arc(width/2, avatarY + avatarSize/2, avatarSize/2 + 6, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();

            // avatar
            ctx.save();
            ctx.beginPath();
            ctx.arc(width/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();

            // border
            ctx.beginPath();
            ctx.arc(width/2, avatarY + avatarSize/2, avatarSize/2 + 2, 0, Math.PI * 2);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#fff";
            ctx.stroke();
        } catch {}
    }

    // username
    ctx.font = '700 42px Sans';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    ctx.fillText(username, width / 2, height - 100);

    // subtitle
    ctx.font = '500 28px Sans';
    ctx.fillStyle = '#fff';
    ctx.fillText(subtitle, width / 2, height - 60);

    return canvas.toBuffer('image/png');
}

// public maker
async function createWelcomeImage(user, groupName, pp, bgUrl) {
    const buffer = await prepareAvatar(pp);
    return buildBase({
        avatarBuffer: buffer,
        username: user.split('@')[0],
        subtitle: `Selamat datang di ${groupName}`,
        backgroundUrl: bgUrl
    });
}

async function createLeaveImage(user, groupName, pp, bgUrl) {
    const buffer = await prepareAvatar(pp);
    return buildBase({
        avatarBuffer: buffer,
        username: user.split('@')[0],
        subtitle: `Keluar dari ${groupName}`,
        backgroundUrl: bgUrl
    });
}

async function createPromoteImage(user, groupName, pp, bgUrl) {
    const buffer = await prepareAvatar(pp);
    return buildBase({
        avatarBuffer: buffer,
        username: user.split('@')[0],
        subtitle: `Menjadi admin di ${groupName}`,
        backgroundUrl: bgUrl
    });
}

async function createDemoteImage(user, groupName, pp, bgUrl) {
    const buffer = await prepareAvatar(pp);
    return buildBase({
        avatarBuffer: buffer,
        username: user.split('@')[0],
        subtitle: `Tidak lagi admin`,
        backgroundUrl: bgUrl
    });
}

module.exports = {
    createWelcomeImage,
    createLeaveImage,
    createPromoteImage,
    createDemoteImage
};