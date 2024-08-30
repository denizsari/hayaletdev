require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField, VoiceChannel } = require('discord.js');
const ytdl = require('ytdl-core');
const { PassThrough } = require('stream');
const config = require('./config.json');
const command = require('./command');
const checkStreamStatus = require('./twitchStatus'); // Twitch durum kontrol fonksiyonu

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers, // Yeni üye olayları için gerekli
        GatewayIntentBits.GuildVoiceStates // Ses kanalı durumları için gerekli
    ]
});

let isDeleting = false; // Silme işlemi durumu

client.on('ready', () => {
    console.log('Bot online');


    // 'sunucu' komutu ile sunucu üye bilgisi getirilir
    command(client, 'sunucu', (message) => {
        const { guild } = message;
        if (guild) {
            message.channel.send(
                `${guild.name} sunucusunda toplam ${guild.memberCount} üye bulunmaktadır.`
            );
        } else {
            message.channel.send('Bu komutu sunucuda kullanmalısınız.');
        }
    });

    // 'sil' komutu ile mesajları topluca siler
    command(client, 'sil', async (message) => {
        if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            isDeleting = true; // Silme işlemine başla
            try {
                let messages = await message.channel.messages.fetch({ limit: 100 });
                while (messages.size > 0 && isDeleting) {
                    const now = Date.now();
                    const cutoff = now - 14 * 24 * 60 * 60 * 1000;
                    const messagesToDelete = messages.filter(msg => msg.createdTimestamp > cutoff);

                    if (messagesToDelete.size > 0) {
                        const deletedMessages = await message.channel.bulkDelete(messagesToDelete, true);
                        messages = messages.filter(val => !deletedMessages.has(val.id));
                        if (messages.size > 0) {
                            for (const msg of messages.values()) {
                                try {
                                    await msg.delete();
                                } catch (error) {
                                    console.error(`Mesaj silinirken bir hata oluştu: ${error}`);
                                }
                            }
                        }
                    }
                    messages = await message.channel.messages.fetch({ limit: 100 });
                }
                message.channel.send('Mesajlar başarıyla silindi.');
            } catch (error) {
                console.error('Mesajlar silinirken bir hata oluştu:', error);
                message.channel.send('Mesajlar silinirken bir hata oluştu.');
            } finally {
                isDeleting = false; // Silme işlemi tamamlandı
            }
        } else {
            message.channel.send('Bu komutu kullanma izniniz yok.');
        }
    });

    // 'durdur' komutu ile silme işlemini durdurur
    command(client, 'dur', (message) => {
        if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            isDeleting = false; // Silme işlemini durdur
            message.channel.send('Silme işlemi durduruldu.');
        } else {
            message.channel.send('Bu komutu kullanma izniniz yok.');
        }
    });

    // 'yayın' komutu ile belirli bir kanalda @everyone ile link paylaşır
    command(client, 'duyuru', async (message) => {
        if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const channelID = config['duyuru-id']; // Buraya paylaşmak istediğin kanalın ID'sini yaz
            const link = 'https://www.twitch.tv/hayaletdev'; // Buraya paylaşmak istediğin linki yaz

            const channel = client.channels.cache.get(channelID);
            if (channel) {
                try {
                    await channel.send(`@everyone Harbi2 Serüvenimiz kaldığı yerden devam ediyor!: ${link}`);
                    message.channel.send('Link başarıyla paylaşıldı.');
                } catch (error) {
                    console.error('Mesaj gönderilirken bir hata oluştu:', error);
                    message.channel.send('Mesaj gönderilirken bir hata oluştu.');
                }
            } else {
                message.channel.send('Belirtilen kanal bulunamadı.');
            }
        } else {
            message.channel.send('Bu komutu kullanma izniniz yok.');
        }
    });

    // Twitch yayın durumu kontrolü
    command(client, 'yayın?', async (message) => {
        if (message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const userId = '63915144'; // Twitch kullanıcı ID'si

            try {
                const data = await checkStreamStatus(userId);

                if (data.data.length > 0) {
                    const stream = data.data[0];
                    message.channel.send(`Yayın şu anda aktif: ${stream.title} (${stream.viewer_count} izleyici)`);
                } else {
                    message.channel.send('Şu anda aktif bir yayın yok.');
                }
            } catch (error) {
                console.error('Yayın durumu kontrol edilirken bir hata oluştu:', error);
                message.channel.send('Yayın durumu kontrol edilirken bir hata oluştu.');
            }
        } else {
            message.channel.send('Bu komutu kullanma izniniz yok.');
        }
    });


    // Yeni bir üye sunucuya katıldığında otomatik rol verir
    client.on('guildMemberAdd', async (member) => {
        const roleID = '1056803784854081558'; // Otomatik verilecek rolün ID'si

        const role = member.guild.roles.cache.get(roleID);
        if (role) {
            try {
                await member.roles.add(role);
                console.log(`Yeni üye ${member.user.tag} rol verildi: ${role.name}`);
            } catch (error) {
                console.error(`Rol verilirken bir hata oluştu: ${error}`);
            }
        } else {
            console.log(`Rol bulunamadı: ${roleID}`);
        }
    });
    
});

// Botu başlat
client.login(process.env.TOKEN);

