import axios from 'axios';

export default async (...args) => {
    axios.get('/worker/bazaar?item=' + args.join(' ')).then((b) => {
        if (b.data.error) return bb.plugins.deafbot.send(`Error fetching bazaar: **${b.data.reason}**`);

        let items = b.data.bazaar.filter((i) => i.item.toLowerCase() === args.join(' ').toLowerCase());
        if (!items.length) return bb.plugins.deafbot.send(`No items found for **${args.join(' ')}**.`);

        let cheapest = items.sort((a, b) => a.price - b.price)[0];
        bb.plugins.deafbot.send(`The cheapest listing for **${cheapest.item}** costs **${cheapest.price.toLocaleString()}** tokens & is sold by **${cheapest.seller}**.`);
    });
};