import createPlugin from '#utils/createPlugin';
import commands from './commands/index.js';

let settings = []

export default () => createPlugin({
    title: 'DeafBot',
    description: 'the chatbot you know and love.',
    authors: [
        { name: 'Death', avatar: 'https://i.imgur.com/PrvNWub.png', url: 'https://villainsrule.xyz' },
        { name: 'Syfe', avatar: 'https://i.imgur.com/OKpOipQ.gif', url: 'https://github.com/ItsSyfe' }
    ],
    patches: [
        {
            file: '/lib/js/game.js',
            replacement: [
                {
                    match: /blacket\.sendMessage =\ async \((.*?)\) => \{/,
                    replace: `blacket.sendMessage = async (room, content, instantSend) => {
                        let rawContent = content.replace(/<(gradient=\\[(?:up|down|left|right|\\d{1,3}deg)(?: |):(?: |)(?:(?:(?:black|lime|white|brown|magenta|cyan|turquoise|red|orange|yellow|green|blue|purple|\\#[0-9a-fA-F]{6})(?:, |,| ,| , |)){2,7})\\]|black|lime|white|brown|magenta|cyan|turquoise|red|orange|yellow|green|blue|purple|(\\#[0-9a-fA-F]{6}))>(.+?)<\\/([^&]+?)>/g, (...args) => {
                            return args[3];
                        });
                        if (rawContent.startsWith(' ')) rawContent = rawContent.slice(1);

                        if (rawContent.startsWith(atob('JA==')) && !instantSend) {
                            let data = rawContent.split(' ');
                            let command = data[0].slice(1);
                            let args = data.slice(1);
                            console.log(\`Executed BB command "\${command}" with args\`, args);
                            if (!bb.plugins.deafbot.commands[command]) return bb.plugins.deafbot.send('Command not found.');
                            bb.plugins.deafbot.commands[command](...args);
                            return;
                        };
                    `
                }
            ]
        }
    ],
    onLoad: () => {
        bb.plugins.deafbot = {
            send: (msg, ephemeral = false) => {
                let prefix = '**$ sudo node deafbot.js** > > > ';
                if (ephemeral) return bb.plugins.deafbot.ephemeralSend(prefix + msg);
                blacket.sendMessage(blacket.chat.room, prefix + msg, true);
            },
            ephemeralSend: (msg) => {
                const data = {
                    room: {
                        id: blacket.chat.room
                    },
                    author: {
                        id: "2817136",
                        username: "DeafBot",
                        permissions: [ "use_chat_colors", "use_embeds", "use_blook_emojis" ],
                        avatar: "https://blacket.org/content/logo.png",
                        clan: {
                            id: "-0",
                            name: "Better Blacket"
                        }
                    },
                    message: {
                        id: Math.floor(Math.random() * 99999999),
                        content: msg,
                        edited: {
                            edited: false
                        },
                        deleted: false
                    }
                };

                blacket.appendChat(data, true);
            },
            commands
        };
    }
});