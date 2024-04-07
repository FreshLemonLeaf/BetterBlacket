import createPlugin from '#utils/createPlugin';

export default () => createPlugin({
    title: 'NOtification Block',
    description: 'stops all desktop notifications.',
    authors: [{ name: 'Death', avatar: 'https://i.imgur.com/PrvNWub.png', url: 'https://villainsrule.xyz' }],
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