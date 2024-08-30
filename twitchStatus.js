// twitchStatus.js
const axios = require('axios');

const clientId = 'h61e14s838l952l91az1ip425hn5wb'; // Twitch Client ID
const accessToken = 'x1oitnqssjyte3fus54n96zkq3k2vk'; // Twitch Access Token

const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Client-Id': clientId
};

async function checkStreamStatus(userId) {
    try {
        const response = await axios.get(`https://api.twitch.tv/helix/streams?user_id=${userId}`, { headers });
        return response.data;
    } catch (error) {
        console.error('Twitch API hatası:', error);
        throw error;
    }
}

module.exports = checkStreamStatus;
