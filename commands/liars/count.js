const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js')
const fs = require('fs');
const { CookieDB } = require("cookie-driver");
const { db_token } = require("../../config.json");


const cookieDB = new CookieDB(
    "https://cookiedb.com/api/db",
    db_token
)



module.exports = {
    data: new SlashCommandBuilder()
        .setName('lie')
        .setDescription('Adds 1 to the lie counter')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a lie to a user.')
                .addUserOption  (option =>
                    option.setName('liar')  // Add better name later
                        .setDescription('The liar in question')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('count')
                .setDescription('Count how many times a user has lied.')
                .addUserOption  (option =>
                    option.setName('liar')  // Add better name later
                        .setDescription('The liar in question')
                        .setRequired(true))
        )
	.addSubcommand(subcommand =>
	    subcommand
		.setName('set')
		.setDescription('Manually edit a user\'s lie count (uid-locked, don\'t use this if you don\'t have access)')
		.addUserOption  (option =>
		    option.setName('liar')  // Add better name later
                        .setDescription('The liar in question')
                        .setRequired(true))
		.addIntegerOption  (option =>   
		    option.setName('liecount')  // Add better name later
                        .setDescription('The number of lies the liar is guilty of')
                        .setRequired(true))
	),
        


            
    async execute(interaction) {
        liar = interaction.options.getUser('liar')
        liarid = liar?.id.toString()
        pingliar = "<@"+liar+">"
        console.log("the liar is "+liarid);
        
        output = await cookieDB.select("lies", `eq($uid,'${liarid}')`, {
            maxResults: 1,
        });
          

        reply = "This message should never be seen. If the bot responded with this, congratulations!"
	ephem = false
        // see if this stops the random crashing
	await interaction.deferReply();

	console.log(interaction.options.getSubcommand())
        switch (interaction.options.getSubcommand()) {
            case 'add':
		if (liarid == "put-liecounter-uid-here") {
		    console.log("target is lie counter");
		    liecount = -1
		}
                if (output.length == 0) {
                    console.log("adding "+liarid+" to db")
                    await cookieDB.insert("lies", {
                        uid: liarid,
                        lieCount: 1,
                    });
                    lieCount = 1
		    console.log("added liar to db")
                } else {
                    outputKey = output[0].key 
                    lieCount = output[0].lieCount+1
                    await cookieDB.update("lies", outputKey, {
                        lieCount: lieCount,
                    });
                }

		if (liarid == "put-liecounter-uid-here") {
		    reply = "I am infallible.";
		} else if (lieCount > 1) {
                    reply = pingliar+" has lied "+lieCount+" times.";
                } else {
                    reply = pingliar+" has lied "+lieCount+" time.";
                }
                break;
            case 'count':
                if (output.length == 0) {
                    lieCount = 0
                } else {
                    lieCount = output[0].lieCount
                }

		if (liarid == "put-liecounter-uid-here") {
		    console.log("target is lie counter");
		    reply = pingliar+" will never be caught in a lie."
		} else if (lieCount == 0) {
                    reply = pingliar+" has never been caught in a lie. Congratulations!"
                } else if (lieCount != 1) {
                    reply = pingliar+" has lied "+lieCount+" times."
                } else {
                    reply = pingliar+" has lied "+lieCount+" time."
                }
                break;
	    case 'set':

		if (interaction.user.id == "put-approved-user-here") {
		    liecount = interaction.options.getInteger("liecount")
		    if (output.length == 0) {
                    	console.log("adding "+liarid+" to db")
                    	await cookieDB.insert("lies", {
                    	    uid: liarid,
                    	    lieCount: liecount,
                    	});
                    	console.log("added liar to db")
                    } else {
                        outputKey = output[0].key
                        await cookieDB.update("lies", outputKey, {
                            lieCount: liecount
                        });
                    }
		    reply = `Set the lie count of ${pingliar} to ${liecount}.`
		} else {
		    reply = `I'm afraid I can't do that, <@${interaction.user.id}>.`
		}
        }
	
        await interaction.editReply(reply);
        
        /*
        lieCount = await cookieDB.get("lies", lieCount)  

        await interaction.reply(pingliar+" has lied "+lieCount+" times.");
        */
       

    }
};
