const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const { lie_counter_uid, trusted_user_uid } = require("../../config.json");
const { add, count, set, top, pure } = require("../../backend/lies");

const faq_string = `I just lie added your message.

# FAQ
## What does this mean?

The amount of lies on your account has increased by one.

## Why did you do this?

There are several reasons I may deem a message to be worthy of a lie. These include, but are not limited to:

- Rudeness towards other Discorders,

- Spreading incorrect information,

- Sarcasm not correctly flagged with a /s.

## Am I banned from the Discord?

No - not yet. But you should refrain from making posts like this in the future. Otherwise I will be forced to issue an additional lie, which may put your message posting privileges in jeopardy.

## I don't believe my post deserved a lie add. Can you un-lie it?

Sure, mistakes happen. But only in exceedingly rare circumstances will I undo a lie add. If you would like to issue an appeal, shoot me a private message explaining what I got wrong. I tend to respond to Discord DMs within several minutes. Do note, however, that over 99.9% of lie add appeals are rejected, and yours is likely no exception.

## How can I prevent this from happening in the future?

Accept the lie add and move on. But learn from this mistake: your behavior will not be tolerated on discordapp.com. I will continue to issue lie adds until you improve your conduct. Remember: Discord is privilege, not a right.
`;

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
                .setDescription("Get a list of the worst liars")
        )
	.addSubcommand(subcommand =>
	   subcommand
		.setName("pure")
		.setDescription("Get a list of the purest liars")
	)
	.addSubcommand(subcommand =>
           subcommand
                .setName("faq")
                .setDescription("What is a lie?")
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
                        .setTitle('Worst liars')
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
		break;
	    case "faq":
	        reply = faq_string;

        }
        if (!isEmbed) {
            await interaction.editReply(reply);
        }
        
    }
};
