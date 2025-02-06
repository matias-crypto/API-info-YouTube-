require('dotenv').config();
const express = require('express');
const ytSearch = require('yt-search');
const rateLimit = require('express-rate-limit');
const { createCanvas } = require('canvas');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 12001;

app.set('json spaces', 2);

const blockedIps = new Map();
const requestCounts = new Map();
const captchaStore = new Map();

const RATE_LIMIT_WINDOW = 10 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 100;
const BAN_DURATION = 60 * 1000;

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (blockedIps.has(ip)) {
        const banTime = blockedIps.get(ip);
        if (Date.now() - banTime < BAN_DURATION) {
            return res.status(403).json({ message: 'Tu IP está bloqueada por hacer demasiadas solicitudes. Intenta nuevamente en 1 minuto.' });
        } else {
            blockedIps.delete(ip);
        }
    }
    next();
});

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, { count: 1, timestamp: Date.now() });
        return next();
    }
    const ipData = requestCounts.get(ip);
    const currentTime = Date.now();
    if (currentTime - ipData.timestamp < RATE_LIMIT_WINDOW) {
        ipData.count++;
        if (ipData.count > RATE_LIMIT_MAX_REQUESTS) {
            blockedIps.set(ip, currentTime);
            return res.status(429).json({ message: 'Demasiadas solicitudes. Tu IP ha sido bloqueada temporalmente.' });
        }
    } else {
        ipData.count = 1;
        ipData.timestamp = currentTime;
    }
    requestCounts.set(ip, ipData);
    next();
});

function generateCaptcha() {
    const captchaCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    return captchaCode;
}

function createCaptchaImage(captchaCode) {
    const canvas = createCanvas(200, 50);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 200, 50);
    ctx.font = '30px Arial';
    ctx.fillStyle = '#000';
    ctx.fillText(captchaCode, 50, 35);
    for (let i = 0; i < 5; i++) {
        ctx.moveTo(Math.random() * 200, Math.random() * 50);
        ctx.lineTo(Math.random() * 200, Math.random() * 50);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.stroke();
    }
    return canvas.toBuffer('image/png');
}

app.get('/captcha', (req, res) => {
    const captchaCode = generateCaptcha();
    const captchaImage = createCaptchaImage(captchaCode);
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    captchaStore.set(ip, captchaCode);
    res.set('Content-Type', 'image/png');
    res.send(captchaImage);
});

app.get('/captcha-form', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const captchaCode = generateCaptcha();
    captchaStore.set(ip, captchaCode);
    const captchaImageUrl = `/captcha`;
    res.send(`
        <html>
            <body>
                <h2>Por favor, resuelve el CAPTCHA</h2>
                <img src="${captchaImageUrl}" alt="CAPTCHA" />
                <form action="/verify-captcha" method="POST">
                    <input type="text" name="captcha" placeholder="Ingresa el CAPTCHA" required />
                    <button type="submit">Verificar</button>
                </form>
            </body>
        </html>
    `);
});

app.post('/verify-captcha', express.urlencoded({ extended: true }), (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userCaptcha = req.body.captcha;
    if (!userCaptcha || userCaptcha !== captchaStore.get(ip)) {
        return res.status(400).json({ message: 'Captcha incorrecto' });
    }
    captchaStore.delete(ip);
    res.status(200).json({ message: 'Captcha verificado correctamente' });
});

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!captchaStore.has(ip)) {
        return res.status(403).json({ message: 'Debes completar el CAPTCHA antes de acceder a la API. Accede a /captcha-form' });
    }
    next();
});

async function searchYouTube(query) {
    if (!query) throw new Error('Search query is mandatory');
    const searchResults = await ytSearch(query);
    return searchResults.videos.slice(0, 5).map(item => ({
        title: item.title,
        author: item.author.name,
        duration: item.timestamp,
        views: item.views,
        uploaded: item.ago || null,
        link: item.url
    }));
}

app.get('/', (req, res) => {
    res.json({ message: 'API creada por https://www.github.com/matias-crypto' });
});

app.get('/youtube/videos', async (req, res) => {
    const query = req.query.q?.trim();
    if (!query) {
        return res.json({ message: 'API creada por https://www.github.com/matias-crypto' });
    }
    try {
        const videos = await searchYouTube(query);
        res.status(200).json({
            creator: 'matias',
            videos: videos.length ? videos : [],
            message: videos.length ? 'Resultados encontrados' : 'No se encontraron resultados'
        });
    } catch (error) {
        console.error('Error handling YouTube search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.clear();
    console.log(`
    ╔════════════════════════════════════════╗
    ║ 🚀 API de YouTube Search Activa               
    ║ 🌍 Creado por: Matías                         
    ║ 🔗 GitHub: github.com/matias-crypto           
    ║ 📡 Servidor corriendo en:                     
    ║ ➤ http://localhost:${port}                   
    ╚════════════════════════════════════════╝
    `);
});