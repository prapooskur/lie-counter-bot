const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require('discord.js');
const { createClient } = require("@supabase/supabase-js");
const { lie_counter_uid, trusted_user_uid, supabase_url, supabase_key } = require("../../config.json");

const supabase = createClient(supabase_url, supabase_key, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});


module.exports = {
    data: new SlashCommandBuilder()
        .setName("lie")
        .setDescription("Adds 1 to the lie counter")
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
        ),
        


            
    async execute(interaction) {
        let liar = interaction.options.getUser("liar");
        let liarid = liar?.id.toString();
        let pingliar = "<@"+liar+">";
        console.log("the liar is "+liarid);

        let lieCount;
        let data, error;

        let reply = "This message should never be seen. If the bot responded with this, congratulations!";
        await interaction.deferReply();
        let isTop = false;

        console.log(interaction.options.getSubcommand());
        switch (interaction.options.getSubcommand()) {
        case "add":
            if (liarid == lie_counter_uid) {
                console.log("target is lie counter");
                reply = "I am infallible.";
            } else {
                const { data, error } = await supabase
                    .from("lies")
                    .select()
                    .eq("uid", liarid)
                    .maybeSingle();
                if (error) throw error;
                if (data != null) {
                    console.log("liar exists, updating");
                    let newCount = data.liecount+1;
                    const { error } = await supabase
                        .from("lies")
                        .update({ liecount: newCount })
                        .eq("uid", liarid);
                    if (error) throw error;
                    reply = reply = pingliar+" has lied "+newCount+" times.";
                } else {
                    console.log("liar does not exist, inserting");
                    const { error } = await supabase
                        .from("lies")
                        .insert({ uid: liarid, liecount: 1 });
                    if (error) throw error;
                    lieCount = 1;
                    reply = reply = pingliar+" has lied "+lieCount+" time.";
                }
                

            }
            break;
        case "count":
            const { data, error } = await supabase
                .from("lies")
                .select()
                .eq("uid", liarid)
                .maybeSingle();
            if (error) throw error;
            if (data) {
                lieCount = data.liecount;
            } else {
                lieCount = 0;
            }
            
            if (liarid == lie_counter_uid) {
                console.log("target is lie counter");
                reply = pingliar+" will never be caught in a lie.";
            } else if (lieCount == 0) {
                reply = pingliar+" has never been caught in a lie. Congratulations!";
            } else if (lieCount == 1) {
                reply = pingliar+" has lied "+lieCount+" time.";
            } else {
                reply = pingliar+" has lied "+lieCount+" times.";
            }
            break;
        case "set":
            if (interaction.user.id == trusted_user_uid) {
                let newCount = interaction.options.getInteger("liecount");
                const { error } = await supabase
                    .from("lies")
                    .upsert({ uid: liarid, liecount: newCount });
                if (error) throw error;
                
                reply = `Set the lie count of ${pingliar} to ${newCount}.`;

            } else {
                reply = `I'm afraid I can't do that, <@${interaction.user.id}>.`;
            }
            break;
        case "top":
            const { data: topdata, error: toperror } = await supabase
                .from("lies")
                .select('uid::text, liecount')
                .order('liecount', { ascending: false })
                .limit(10);
            if (toperror) throw toperror;
            if (Array.isArray(topdata) && topdata.length) {
                let liarList = ""
                topdata.forEach(liar => {
                    let pingliar = `<@${liar.uid}>`;
                    liarList += `${pingliar}: ${liar.liecount}\n`;
                })
                const topEmbed = new EmbedBuilder()
                    .setTitle('Best liars')
                    .setDescription(liarList)
                isTop = true;
                await interaction.editReply({ embeds: [topEmbed] });
            } else {
                reply = "Failed to grab top liars. Skill issue?";
            }
            

        }
        if (!isTop) {
            await interaction.editReply(reply);
        }
        
    }
};
