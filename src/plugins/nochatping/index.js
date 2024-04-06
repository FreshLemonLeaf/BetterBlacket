import { devs } from '../../constants.js';
import createPlugin from 'utils/createPlugin.js';

export default () => createPlugin({
    title: 'No Chat Ping',
    description: 'prevents you from being pinged in chat.',
    author: devs.thonk,
    patches: [
        {
            file: '/lib/js/game.js',
            replacement: [
                {
                    match: /message\.message\.mentions\.includes\(\w+\.user\.id\.toString\(\)\)/,
                    replace: 'false'
                },
                {
                    match: /data\.data\.message\.mentions\.includes\(blacket\.user\.id\.toString\(\)\)/,
                    replace: 'false'
                },
                {
                    match: /\$\{mentioned/,
                    replace: `\${bb.plugins.settings['No Chat Ping']?.['Keep Highlight'] && rawMessage.includes(blacket.user.id.toString()) || mentioned`
                }
            ]
        }
    ],
    settings: [
        {
            name: 'Keep Highlight',
            default: false
        }
    ]
});