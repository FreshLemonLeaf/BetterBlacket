export default async () => {
    bb.plugins.deafbot.send(`Your friend requests are set to **${blacket.user.settings.friends}**. Your trade requests are set to **${blacket.user.settings.requests}**.`)
};