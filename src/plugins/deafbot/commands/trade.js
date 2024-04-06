import axios from 'axios';

export default async (...args) => {
    if (!args[0]) return bb.plugins.deafbot.send(`Who are you trying to trade, yourself?`);

    axios.get('/worker2/user/' + args[0]).then((u) => {
        if (u.data.error) return bb.plugins.deafbot.send(`Error fetching user ${args[0]}: **${u.data.reason}**`);

        axios.post('/worker/trades/requests/send', { user: u.data.user.id.toString() }).then((r) => {
            if (r.data.error) bb.plugins.deafbot.send(`Error sending trade request to ${u.data.user.username}: **${r.data.reason}**`);
            else bb.plugins.deafbot.send(`Sent a trade request to **${u.data.user.username}**.`);
        });
    });
};