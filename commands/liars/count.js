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
        .addUserOption  (option =>
            option.setName('liar')  // Add better name later
                .setDescription('The liar in question')
                .setRequired(true)),


            
    async execute(interaction) {
        liar = interaction.options.getUser('liar')
        liarid = liar?.id.toString()
        pingliar = "<@"+liar+">"
        console.log("the liar is "+liarid);


//        await cookieDB.dropTable("lies")

        await cookieDB.createTable("lies", {
            uid: "string",
            lieCount: "number",
          });


        
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

        await interaction.reply(pingliar+" has lied "+lieCount+" time(s).");

        /*
        lieCount = await cookieDB.get("lies", lieCount)  

        await interaction.reply(pingliar+" has lied "+lieCount+" times.");
        */
       

    }
};