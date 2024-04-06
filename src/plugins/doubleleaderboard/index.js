import { devs } from '../../constants.js';
import createPlugin from '../../utils/createPlugin.js';

export default () => createPlugin({
    title: 'Double Leaderboard',
    description: 'see both leaderboards together.',
    author: devs.thonk,
    patches: [
        {
            file: '/lib/js/leaderboard.js',
            replacement: [
                {
                    match: /div:nth-child\(4\) > div:nth-child\(1\)/,
                    replace: 'div:nth-child(3) > div:nth-child(2)'
                },
                {
                    match: /\$\(".styles__containerHeaderRight___3xghM-camelCase"/,
                    replace: `
                        document.querySelector('.styles__topStats___3qffP-camelCase').insertAdjacentHTML('afterend', \`<div class="styles__topStats___3qffP-camelCase" style="text-align: center;font-size: 2.604vw;margin-top: 0.521vw;display:block;"></div>\`);
                        document.querySelector('.styles__statsContainer___QnrRB-camelCase > div:nth-child(4)').remove();

                        $(".styles__containerHeaderRight___3xghM-camelCase"
                    `
                },
                {
                    match: / \(\$\{data.me.exp.ex(.*?)">\)/,
                    replace: ''
                },
                {
                    match: / \(\$\{data.ex(.*?)">\)/,
                    replace: ''
                }
            ]
        }
    ],
    onStart: () => {
        document.body.insertAdjacentHTML('beforeend', `<style>
            .styles__statsContainer___QnrRB-camelCase > div:nth-child(3) {
                display: flex;
                gap: 2vw;
                padding: 2vw 1.5vw;
            }
                
            .styles__topStats___3qffP-camelCase {
                font-size: 1.8vw !important;
            }

            .styles__containerHeaderRight___3xghM-camelCase {
                display: none;
            }
        </style>`);
    }
});