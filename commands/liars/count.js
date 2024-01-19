const { SlashCommandBuilder } = require("discord.js");
//const fs = require("fs");
//const { CookieDB } = require("cookie-driver");
//const { db_token } = require("../../config.json");
const { sqlite3 } = require("sqlite3");
const { lie_counter_uid } = require("../../config.json");
const { trusted_user_uid } = require("../../config.json");

/*
const cookieDB = new CookieDB(
    "https://cookiedb.com/api/db",
    db_token
)
*/

const db = new sqlite3.Database("./lies.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
        var newdb = new sqlite3.Database("lies.db", (err) => {
            if (err) {
                console.log("Getting error " + err);
                process.exit(1);
            }
            newdb.exec(`
            CREATE TABLE lies (
                uid INTEGER PRIMARY KEY NOT NULL,
                lieCount INTEGER NOT NULL
            )
            `);
        });
        
        return newdb;
    } else if (err) {
        console.log("Getting error " + err);
        process.exit(1);
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
        ),
        


            
    async execute(interaction) {
        let liar = interaction.options.getUser("liar");
        let liarid = liar?.id.toString();
        let pingliar = "<@"+liar+">";
        console.log("the liar is "+liarid);
        
        /*
        output = await cookieDB.select("lies", `eq($uid,'${liarid}')`, {
            maxResults: 1,
        });
        */


        let liarRow;

        db.get("SELECT * FROM lies WHERE uid = ?", [liarid], (err, row) => {
            if (err) {
                console.error(err.message);
                return;
            }
            liarRow = row;
            console.log(row);
        });
        let lieCount;

          

        let reply = "This message should never be seen. If the bot responded with this, congratulations!";
        //let ephemeral = false;
        // see if this stops the random crashing
        await interaction.deferReply();

        console.log(interaction.options.getSubcommand());
        switch (interaction.options.getSubcommand()) {
        case "add":
            if (liarid == lie_counter_uid) {
                console.log("target is lie counter");
                reply = "I am infallible.";
            } else if (liarRow) {
                console.log("Liar exists, incrementing");
                db.run("UPDATE lies SET lieCount = lieCount + 1 WHERE uid = ?", [liarid], (err) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("Counter incremented for liar");
                    }
                });
                lieCount = liarRow.lieCount+1;
                reply = pingliar+" has lied "+lieCount+" times.";
            } else {
                console.log("Liar does not exist, creating");
                db.run("INSERT INTO lies (uid, lieCount) VALUES (?, 1)", [liarid], (err) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log("New liar entry created");
                    }
                });
                lieCount = 1;
                reply = pingliar+" has lied "+lieCount+" time.";
            }
            break;
        case "count":
            if (liarRow) {
                lieCount = liarRow.liecount;
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
                let liecount = interaction.options.getInteger("liecount");
                // Example: Update the lieCount in the database
                db.run("UPDATE lies SET lieCount = ? WHERE uid = ?", [liecount, liarid], (err) => {
                    if (err) {
                        console.error(err.message);
                    } else {
                        console.log(`Set the lie count of ${pingliar} to ${liecount}.`);

                        const reply = `Set the lie count of ${pingliar} to ${liecount}.`;
                        // Send the reply or handle it as needed
                        console.log(reply);
                    }
                });
                reply = `Set the lie count of ${pingliar} to ${liecount}.`;
            } else {
                reply = `I'm afraid I can't do that, <@${interaction.user.id}>.`;
            }
        }
	
        await interaction.editReply(reply);
    }
};
