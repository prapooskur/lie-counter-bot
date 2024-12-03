const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { lie_counter_uid } = require("../../config.json");
const { add } = require('../../backend/lies');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Add Lie")
        .setType(ApplicationCommandType.Message),

        async execute(interaction) {
            let liar = interaction.targetMessage.author;
            console.log(liar);
            let liarId = liar?.id.toString();
            let pingLiar = "<@"+liar+">";
            console.log("context menu: the liar is "+liarId);    
            let reply = "This message should never be seen. If the bot responded with this, congratulations!";
            await interaction.deferReply();
    
            if (liarId == lie_counter_uid) {
                console.log("target is lie counter");
                reply = "I am infallible.";
            } else {
                const newCount = await add(liarId);
                if (newCount === 1) {
                    reply = `${pingLiar} has lied ${newCount} time.`;
                } else {
                    reply = `${pingLiar} has lied ${newCount} times.`;
                }
            }                
            await interaction.editReply(reply);
        }
};
