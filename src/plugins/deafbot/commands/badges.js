import axios from 'axios';

export default async (...args) => {
    if (args[0]) axios.get('/worker2/user/' + args[0]).then((u) => {
        if (u.data.error) bb.plugins.deafbot.send(`Error fetching user ${args[0]}: **${u.data.reason}**`);
        else bb.plugins.deafbot.send(`**${u.data.user.username}**'s Badges: ${u.data.user.badges.join(' ')}`);
    });
    else bb.plugins.deafbot.send(`Your Badges: ${blacket.user.badges.join(' ')}`);
};