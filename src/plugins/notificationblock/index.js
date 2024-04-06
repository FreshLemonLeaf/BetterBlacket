import { devs } from '../../constants.js';
import createPlugin from 'utils/createPlugin.js';

export default () => createPlugin({
    title: 'NOtification Block',
    description: 'stops all desktop notifications.',
    author: devs.thonk,
    patches: [
        {
            file: '/lib/js/game.js',
            replacement: [
                {
                    match: /Notification\.permission == "granted"/,
                    replace: 'false'
                },
                {
                    match: /Notification\.permission !== "granted" && Notification\.permission !== "denied"/,
                    replace: 'false'
                }
            ]
        }
    ]
});