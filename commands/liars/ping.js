const { SlashCommandBuilder } = require('discord.js');
const { CookieDB } = require("cookie-driver");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		await interaction.reply('Pong!');
	},
};
