const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { lie_counter_uid } = require("../../config.json");
const { count } = require('../../backend/lies');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Count Lies")
        .setType(ApplicationCommandType.Message),

        async execute(interaction) {
            let liar = interaction.targetMessage.author;
            console.log(liar);
            let liarId = liar?.id.toString();
            let pingLiar = "<@"+liar+">";
            console.log("context menu: the liar is "+liarId);
        
            let reply = "This message should never be seen. If the bot responded with this, congratulations!";
            await interaction.deferReply();
    
            if (liarId === lie_counter_uid) {
                console.log("target is lie counter");
                reply = pingLiar+" will never be caught in a lie.";
            } else {
                const lieCount = await count(liarId)
                if (lieCount == 0) {
                    reply = `${pingLiar} has never been caught in a lie. Congratulations!`
                } else if (lieCount == 1) {
                    reply = `${pingLiar} has lied ${lieCount} time.`;
                } else {
                    reply = `${pingLiar} has lied ${lieCount} times.`;
                }
            }

            await interaction.editReply(reply);
    }
};
