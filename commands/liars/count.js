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
        ),
        


            
    async execute(interaction) {
        liar = interaction.options.getUser('liar')
        liarid = liar?.id.toString()
        pingliar = "<@"+liar+">"
        console.log("the liar is "+liarid);


//        await cookieDB.dropTable("lies")

	/*
        await cookieDB.createTable("lies", {
            uid: "string",
            lieCount: "number",
          });
	*/

        
        output = await cookieDB.select("lies", `eq($uid,'${liarid}')`, {
            maxResults: 1,
//            return: { uid: "$uid2" },
        });
//        console.log(output)
          

        /*
        output = await cookieDB.select("lies", "eq($uid, '1100943524708495370')", {
            maxResults: 1,
            return: { uid: "$uid2" },
        });
        */

        

//        console.log(output.length)
        reply = "This message should never be seen. If the bot responded with this, congratulations!"

        console.log(interaction.options.getSubcommand())
        switch (interaction.options.getSubcommand()) {
            case 'add':
                if (output.length == 0) {
                    console.log("adding "+liarid+" to db")
                    await cookieDB.insert("lies", {
                        uid: liarid,
                        lieCount: 1,
                    });
                    lieCount = 1
                } else {
                    outputKey = output[0].key 
                    lieCount = output[0].lieCount+1
                    await cookieDB.update("lies", outputKey, {
                        lieCount: lieCount,
                    });
                }

		console.log("added loar to db")
        
                if (lieCount != 1) {
                    reply = pingliar+" has lied "+lieCount+" times."
                } else {
                    reply = pingliar+" has lied "+lieCount+" time."
                }
                break;
            case 'count':
                if (output.length == 0) {
                    lieCount = 0
                } else {
                    lieCount = output[0].lieCount
                }
        
                if (lieCount == 0) {
                    reply = pingliar+" has never been caught in a lie. Congratulations!"
                } else if (lieCount != 1) {
                    reply = pingliar+" has lied "+lieCount+" times."
                } else {
                    reply = pingliar+" has lied "+lieCount+" time."
                }
                break;
        }
    
        await interaction.reply(reply);

        /*
        lieCount = await cookieDB.get("lies", lieCount)  

        await interaction.reply(pingliar+" has lied "+lieCount+" times.");
        */
       

    }
};
