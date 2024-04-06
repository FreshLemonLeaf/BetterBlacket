import axios from 'axios';

export default async () => {
    axios.get('/worker/clans').then((clan) => {
        if (clan.data.error) return bb.plugins.deafbot.send(`Error fetching your clan: **${clan.data.reason}**`);

        let clanData = clan.data.clan;
        bb.plugins.deafbot.send(`You are in the ${clanData.members.map(a => a.username).includes('Death') ? 'esteemed ' : ''}**${clanData.name}** clan, owned by **${clanData.owner.username}**. You have **${clanData.members.length}** (**${clanData.online}** online) members, and **[REDACTED]** investments. The clan **${clanData.safe ? 'is' : 'is not'}** in safe mode.`)
    })
};