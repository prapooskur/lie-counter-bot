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
        .setName("Count Lies")
        .setType(ApplicationCommandType.Message),

        async execute(interaction) {
            let liar = interaction.targetMessage.author;
            console.log(liar);
            let liarid = liar?.id.toString();
            let pingliar = "<@"+liar+">";
            console.log("context menu: the liar is "+liarid);
    
            let lieCount;
    
            let reply = "This message should never be seen. If the bot responded with this, congratulations!";
            await interaction.deferReply();
    
            const { data, error } = await supabase
                .from(supabase_table)
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
            await interaction.editReply(reply);
    }
};
