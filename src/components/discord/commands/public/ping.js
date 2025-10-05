const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { color } = require("../../base/base.collors.js");
const { reply } = require("../../base/base.reply.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("[Público]: Comando de ping."),
  cooldown: 10,
  
  async execute(interaction) {
    await reply(interaction, {
      embeds: [
        new EmbedBuilder()
        .setColor(color.green)
        .setDescription(`Pong 🏓`)
        ], flags: 64
      });
  }
};