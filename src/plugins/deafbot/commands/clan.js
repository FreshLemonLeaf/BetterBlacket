import axios from 'axios';

export default async (...args) => {
    if (!args[0]) axios.get('/worker/clans').then((clan) => {
        if (clan.data.error) return bb.plugins.deafbot.send(`Error fetching your clan: **${clan.data.reason}**`);

        let clanData = clan.data.clan;
        bb.plugins.deafbot.send(`You are in the ${clanData.members.map(a => a.username).includes('Death') ? 'esteemed ' : ''}**${clanData.name}** clan, owned by **${clanData.owner.username}**. You have **${clanData.members.length}** (**${clanData.online}** online) members, and **[REDACTED]** investments. The clan **${clanData.safe ? 'is' : 'is not'}** in safe mode.`)
    });

    else axios.get('/worker/clans/discover/name/' + args.join(' ')).then((clan) => {
        if (clan.data.error) return bb.plugins.deafbot.send(`Error fetching clan: **${clan.data.reason}**`);

        clan = clan.data.clans[0];
        bb.plugins.deafbot.send(`The ${clan.members.map(a => a.username).includes('Death') ? 'esteemed ' : ''}**${clan.name}** clan is owned by **${clan.owner.username}**. They have **${clan.members.length}** (**${clan.online}** online) members, and **[REDACTED]** investments. The clan **${clan.safe ? 'is' : 'is not'}** in safe mode.`)
    });
};