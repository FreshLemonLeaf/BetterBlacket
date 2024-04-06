import { devs } from '../../constants.js';
import createPlugin from 'utils/createPlugin.js';

export default () => createPlugin({
    title: 'Chat on Clans',
    description: 'disables the special chat page function when viewing your clan.',
    author: devs.thonk,
    patches: [
        {
            file: '/lib/js/game.js',
            replacement: [
                {
                    match: /location\.pathname\.toLowerCase\(\)\.includes\("\/clans\/my\-clan"\)\) \{/,
                    replace: `false) {`
                },
                {
                    match: / && \!location\.pathname\.toLowerCase\(\)\.includes\("\/clans\/my\-clan"\)/,
                    replace: ''
                },
                {
                    match: /if \(.*?= blacket.user.clan.room;/,
                    replace: ``
                }
            ]
        }
    ]
});