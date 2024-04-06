import axios from 'axios';

export default async (...args) => {
    if (!args[0]) return bb.plugins.deafbot.send(`You have **${Object.keys(blacket.user.blooks).length}** unique blooks (**${Object.values(blacket.user.blooks).reduce((partialSum, a) => partialSum + a, 0)}** total), consisting of **${Object.keys(blacket.user.blooks).filter(b => blacket.blooks[b].rarity === 'Uncommon').length}** Uncommons, **${Object.keys(blacket.user.blooks).filter(b => blacket.blooks[b].rarity === 'Rare').length}** Rares, **${Object.keys(blacket.user.blooks).filter(b => blacket.blooks[b].rarity === 'Epic').length}** Epics, **${Object.keys(blacket.user.blooks).filter(b => blacket.blooks[b].rarity === 'Legendary').length}** Legendaries, **${Object.keys(blacket.user.blooks).filter(b => blacket.blooks[b].rarity === 'Chroma').length}** Chromas, and **${Object.keys(blacket.user.blooks).filter(b => blacket.blooks[b].rarity === 'Mystical').length}** Mysticals.`);

    axios.get('/worker2/user/' + args[0]).then((u) => {
        if (u.data.error) bb.plugins.deafbot.send(`Error fetching user ${args[0]}: **${u.data.reason}**`);

        if (args[1]) {
            let blook = blacket.blooks[args.slice(1).join(' ')];
            if (!blook) return bb.plugins.deafbot.send(`No blook found for **${args.slice(1).join(' ')}**. This is case-sensitive.`);

            if (u.data.user.blooks[args.slice(1).join(' ')]) return bb.plugins.deafbot.send(`**${u.data.user.username}** has **${u.data.user.blooks[args.slice(1).join(' ')]}x** ${args.slice(1).join(' ')}.`);
            else return bb.plugins.deafbot.send(`**${u.data.user.username}** doesn't have **${args.slice(1).join(' ')}**.`);
        };
        
        bb.plugins.deafbot.send(`**${u.data.user.username}** has **${Object.keys(u.data.user.blooks).length}** unique blooks (**${Object.values(u.data.user.blooks).reduce((partialSum, a) => partialSum + a, 0)}** total), consisting of **${Object.keys(u.data.user.blooks).filter(b => blacket.blooks[b].rarity === 'Uncommon').length}** Uncommons, **${Object.keys(u.data.user.blooks).filter(b => blacket.blooks[b].rarity === 'Rare').length}** Rares, **${Object.keys(u.data.user.blooks).filter(b => blacket.blooks[b].rarity === 'Epic').length}** Epics, **${Object.keys(u.data.user.blooks).filter(b => blacket.blooks[b].rarity === 'Legendary').length}** Legendaries, **${Object.keys(u.data.user.blooks).filter(b => blacket.blooks[b].rarity === 'Chroma').length}** Chromas, and **${Object.keys(u.data.user.blooks).filter(b => blacket.blooks[b].rarity === 'Mystical').length}** Mysticals.`);
    })
};