require('dotenv').config(); 

const express = require('express');
const ytSearch = require('yt-search');
const app = express();
const port = process.env.PORT || 2070; 

async function searchYouTube(query) {
    try {
        if (!query) {
            throw new Error('Search query is mandatory');
        }

        const searchResults = await ytSearch(query);

        const formattedResults = searchResults.videos.slice(0, 1).map(item => ({
            title: item.title,
            author: item.author.name,
            duration: item.timestamp,
            views: item.views,
            uploaded: item.ago,
            link: item.url
        }));

        return formattedResults;
    } catch (error) {
        console.error('Error fetching data from YouTube:', error);
        throw error;
    }
}

app.get('/', (req, res) => {
    res.send('API creada por https://www.github.com/matias-crypto');
});

app.get('/youtube/videos', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        res.send('API creada por https://www.github.com/matias-crypto');
        return;
    }

    try {
        const videos = await searchYouTube(query);
        res.json(videos);
    } catch (error) {
        console.error('Error handling YouTube search:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`API activa, La API a sido creada por https://github.com/matias-crypto`);
});
