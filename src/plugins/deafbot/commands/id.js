import axios from 'axios';

export default async (...args) => {
    if (args[0]) axios.get('/worker2/user/' + args[0]).then((u) => {
        if (u.data.error) bb.plugins.deafbot.send(`Error: **${u.data.reason}**`);
        else bb.plugins.deafbot.send(`**${u.data.user.username}**'s ID: ${u.data.user.id}`);
    });

    else bb.plugins.deafbot.send(`Your ID: ${blacket.user.id}`);
};