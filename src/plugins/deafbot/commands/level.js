import axios from 'axios';

export default async (...args) => {
    let calculate = (exp) => {
        let level = 0;
        let needed = 0;
        for (let i = 0; i <= 27915; i++) {
            needed = 5 * Math.pow(level, blacket.config.exp.difficulty) * level;
            if (exp >= needed) {
                exp -= needed;
                level++;
            };
        };
        return level;
    };

    if (args[0]) axios.get('/worker2/user/' + args[0]).then((u) => {
        if (u.data.error) bb.plugins.deafbot.send(`Error fetching user ${args[0]}: **${u.data.reason}**`);
        else bb.plugins.deafbot.send(`**${u.data.user.username}**'s level: ${calculate(u.data.user.exp)}`);
    });

    else bb.plugins.deafbot.send(`Your level: ${blacket.user.level || calculate(blacket.user.exp)}`);
};