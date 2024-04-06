import { devs } from '../../constants.js';
import createPlugin from 'utils/createPlugin.js';

export default () => createPlugin({
    title: 'Message Logger',
    description: 'see deleted messages like a staff would :)',
    author: devs.thonk,
    disabled: true,
    patches: [
        {
            file: '/lib/js/game.js',
            replacement: [
                {
                    match: /blacket\.user\.perms\.includes\("delete_messages"\) \|\| blacket\.user\.perms\.includes\("\*"\)/,
                    replace: 'true'
                }
            ]
        }
    ]
});