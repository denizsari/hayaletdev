const { prefix } = require('./config.json');

module.exports = (client, aliases, callback) => {
    if (typeof aliases === 'string') {
        aliases = [aliases];
    }

    client.on('messageCreate', (message) => {
        // Botun kendi mesajlarına cevap vermemesi için
        if (message.author.bot) return;

        const { content } = message;
        aliases.forEach((alias) => {
            const command = `${prefix}${alias}`;

            if (content.startsWith(command) || content === command) {
                console.log(`Komut ${command}`);
                callback(message);
            }
        });
    });
};
