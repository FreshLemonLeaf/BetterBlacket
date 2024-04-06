import axios from 'axios';

export default async (...args) => {
    axios.get('/worker/clans/discover/name/' + args.join(' ')).then((clan) => {
        if (clan.data.error) return bb.plugins.deafbot.send(`Error fetching clan: **${clan.data.reason}**`);

        clan = clan.data.clans[0];
        bb.plugins.deafbot.send(`The ${clan.members.map(a => a.username).includes('Death') ? 'esteemed ' : ''}**${clan.name}** clan is owned by **${clan.owner.username}**. They have **${clan.members.length}** (**${clan.online}** online) members, and **[REDACTED]** investments. The clan **${clan.safe ? 'is' : 'is not'}** in safe mode.`)
    });
};