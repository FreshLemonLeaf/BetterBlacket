import { devs } from '../../constants.js';
import createPlugin from 'utils/createPlugin.js';

export default () => createPlugin({
    title: 'Highlight Rarity',
    description: 'displays the rarity of Bazaar blooks.',
    author: devs.thonk,
    patches: [
        {
            file: '/lib/js/bazaar.js',
            replacement: [
                {
                    match: /"\/content\/blooks\/Error\.png"\}" /,
                    replace: `"/content/blooks/Error.png"}" style="filter: drop-shadow(0 0 7px \${blacket.rarities[blacket.blooks[blook].rarity].color});" `
                },
                {
                    match: /class="styles__bazaarItemImage___KriA4-camelCase" /,
                    replace: `class="styles__bazaarItemImage___KriA4-camelCase" \${blacket.blooks[listing.item] ? \`style="filter: drop-shadow(0 0 7px \${blacket.rarities[blacket.blooks[listing.item].rarity].color});"\` : ''} `
                }
            ]
        }
    ]
});