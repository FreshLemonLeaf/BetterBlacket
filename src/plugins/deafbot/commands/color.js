import axios from 'axios';

export default async (...args) => {
    if (!args[0]) return bb.plugins.deafbot.send(`Choose a subcommand: **name** or **text**.`);

    if (args[0].toLowerCase() === 'name') axios.post('https://blacket.org/worker/settings/color', {
        color: `#${args[1].replace('#', '')}`
    }).then((r) => {
        if (r.data.error) return bb.plugins.deafbot.send(`Error changing name color: **${r.data.reason}**`);
        bb.plugins.deafbot.send(`Name color was set to **#${args[1].replace('#', '')}**!`);
    });

    if (args[0].toLowerCase() === 'text') {
        if (args[1] === 'gradient') {
            let formed = `${args[1]}=[${args[2]}: ${args.slice(3).join(', ')}]`;
            localStorage.setItem('chatColor', formed);
            bb.plugins.deafbot.send(`Gradient was updated!`);
        } else {
            localStorage.setItem('chatColor', args[1]);
            bb.plugins.deafbot.send(`Text color was set to **${args[1]}**!`);
        };
    };
};