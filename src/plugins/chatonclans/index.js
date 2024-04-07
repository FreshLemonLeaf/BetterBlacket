import createPlugin from '#utils/createPlugin';

export default () => createPlugin({
    title: 'Chat on Clans',
    description: 'disables the special chat page function when viewing your clan.',
    authors: [{ name: 'Death', avatar: 'https://i.imgur.com/PrvNWub.png', url: 'https://villainsrule.xyz' }],
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