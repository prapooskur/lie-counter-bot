const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const { lie_counter_uid, trusted_user_uid } = require("../../config.json");
const { add, count, set, top, pure } = require("../../backend/supabase");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lie")
        .setDescription("Lie management command")
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("Add a lie to a user.")
                .addUserOption  (option =>
                    option.setName("liar")  // Add better name later
                        .setDescription("The liar in question")
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("count")
                .setDescription("Count how many times a user has lied.")
                .addUserOption  (option =>
                    option.setName("liar")  // Add better name later
                        .setDescription("The liar in question")
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("set")
                .setDescription("Manually edit a user's lie count (uid-locked, don't use this if you don't have access)")
                .addUserOption  (option =>
                    option.setName("liar")  // Add better name later
                        .setDescription("The liar in question")
                        .setRequired(true))
                .addIntegerOption  (option =>   
                    option.setName("liecount")  // Add better name later
                        .setDescription("The number of lies the liar is guilty of")
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("top")
                .setDescription("Get a list of the best liars")
        )
	.addSubcommand(subcommand =>
	   subcommand
		.setName("pure")
		.setDescription("Get a list of the purest liars")
	),
        


            
    async execute(interaction) {
        let liar = interaction.options.getUser("liar");
        let liarId = liar?.id.toString();
        let pingLiar = `${liar}`;
        console.log(`the liar is ${liarId}`);

        let lieCount;
        let data, error;

        let reply = "This message should never be seen. If the bot responded with this, congratulations!";
        await interaction.deferReply();
        let isEmbed = false;

        console.log(interaction.options.getSubcommand());
        switch (interaction.options.getSubcommand()) {
            case "add":
                if (liarId === lie_counter_uid) {
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
                break;
            case "count":

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
                break;
            case "set":
                if (interaction.user.id == trusted_user_uid) {
                    const newCount = interaction.options.getInteger("liecount");
                    const setCount = await set(liarId, newCount);

                    reply = `Set the lie count of ${pingLiar} to ${setCount}.`;

                } else {
                    reply = `I'm afraid I can't do that, <@${interaction.user.id}>.`;
                }
                break;
            case "top":
                const topData = await top();
                if (Array.isArray(topData) && topData.length) {
                    let liarList = ""
                    topData.forEach(liar => {
                        let pingliar = `<@${liar.uid}>`;
                        liarList += `${pingliar}: ${liar.liecount}\n`;
                    })
                    const topEmbed = new EmbedBuilder()
                        .setTitle('Best liars')
                        .setDescription(liarList)
                    isEmbed = true;
                    await interaction.editReply({ embeds: [topEmbed] });
                } else {
                    reply = "Failed to grab top liars. Skill issue?";
                }
                break;
            case "pure":
                const pureData = await pure();
                if (Array.isArray(pureData) && pureData.length) {
                    let liarList = ""
                    pureData.forEach(liar => {
                        let pingliar = `<@${liar.uid}>`;
                        liarList += `${pingliar}: ${liar.liecount}\n`;
                    })
                    const pureEmbed = new EmbedBuilder()
                        .setTitle('Purest liars')
                        .setDescription(liarList)
                    isEmbed = true;
                    await interaction.editReply({ embeds: [pureEmbed] });
                } else {
                    reply = "Failed to grab purest liars. Skill issue?";
                }
        }
        if (!isEmbed) {
            await interaction.editReply(reply);
        }
        
    }
};
