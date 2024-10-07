const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const { createClient } = require("@supabase/supabase-js");
const { lie_counter_uid, trusted_user_uid, supabase_url, supabase_key, supabase_table } = require("../../config.json");

const supabase = createClient(supabase_url, supabase_key, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});


module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName("Add Lie")
        .setType(ApplicationCommandType.Message),

        async execute(interaction) {
            let liar = interaction.targetMessage.author;
            console.log(liar);
            let liarid = liar?.id.toString();
            let pingliar = "<@"+liar+">";
            console.log("context menu: the liar is "+liarid);
    
            let lieCount;
            let data, error;
    
            let reply = "This message should never be seen. If the bot responded with this, congratulations!";
            await interaction.deferReply();
            let isEmbed = false;
    
            if (liarid == lie_counter_uid) {
                console.log("target is lie counter");
                reply = "I am infallible.";
            } else {
                const { data, error } = await supabase
                    .from(supabase_table)
                    .select()
                    .eq("uid", liarid)
                    .maybeSingle();
                if (error) throw error;
                if (data != null) {
                    console.log("liar exists, updating");
                    let newCount = data.liecount+1;
                    const { error } = await supabase
                        .from(supabase_table)
                        .update({ liecount: newCount })
                        .eq("uid", liarid);
                    if (error) throw error;
                    reply = reply = pingliar+" has lied "+newCount+" times.";
                } else {
                    console.log("liar does not exist, inserting");
                    const { error } = await supabase
                        .from(supabase_table)
                        .insert({ uid: liarid, liecount: 1 });
                    if (error) throw error;
                    lieCount = 1;
                    reply = reply = pingliar+" has lied "+lieCount+" time.";
                }
            }                
            await interaction.editReply(reply);
        }
};
