/*
const { SlashCommandBuilder } = require('discord.js');
const { CookieDB } = require("cookie-driver");
const { db_token } = require("../../config.json");


const cookieDB = new CookieDB(
    "https://cookiedb.com/api/db",
    db_token
)

module.exports = {
	data: new SlashCommandBuilder()
		.setName('droptable')
		.setDescription('drops table'),
	async execute(interaction) {
        try {
            cookieDB.dropTable("lies")
        } catch (e) {
            console.log(e)
            await interaction.reply(e);
        }
		await interaction.reply('It has been done.');
	},
};
*/
