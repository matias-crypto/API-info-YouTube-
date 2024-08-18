require('dotenv').config();

const express = require('express');
const ytSearch = require('yt-search');
const app = express();
const port = process.env.PORT || 6666;

async function searchYouTube(query) {
    if (!query) throw new Error('Search query is mandatory');

    const searchResults = await ytSearch(query);
    return searchResults.videos.slice(0, 1).map(item => ({
        title: item.title,
        author: item.author.name,
        duration: item.timestamp,
        views: item.views,
        uploaded: item.ago,
        link: item.url
    }));
}

app.get('/', (req, res) => {
    res.send('API creada por https://www.github.com/matias-crypto');
});

app.get('/youtube/videos', async (req, res) => {
    const query = req.query.q;
    
    if (!query || query.trim() === '') {
        res.send('API creada por https://www.github.com/matias-crypto');
        return;
    }

    try {
        const videos = await searchYouTube(query);
        if (videos.length > 0) {
            res.json({ creator: 'matias', videos });
        } else {
            res.json({ message: 'No se encontraron resultados' });
        }
    } catch (error) {
        console.error('Error handling YouTube search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`API activa, La API a sido creada por https://github.com/matias-crypto y está activa en http://localhost:${port}`);
});