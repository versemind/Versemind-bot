const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const paidUsers = JSON.parse(fs.readFileSync('./paid_users.json', 'utf8'));

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('VerseMind AI bot is ready!');
});

client.on('message', async msg => {
    const sender = msg.from;

    if (!paidUsers.includes(sender)) {
        return msg.reply("🚫 This bot is for paid users only. Please subscribe to VerseMind AI (₦1,000/month). Reply 'Pay' to get the link.");
    }

    const prompt = msg.body;

    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "mistral/mistral-7b-instruct",
            messages: [{ role: "user", content: prompt }]
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        const aiReply = response.data.choices[0].message.content;
        msg.reply(aiReply);
    } catch (error) {
        console.error("Error:", error.message);
        msg.reply("⚠️ Sorry, something went wrong while contacting VerseMind AI.");
    }
});

client.initialize();