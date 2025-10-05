const { Collection, EmbedBuilder } = require("discord.js");
const { reply } = require("../../base/base.reply.js");
const { color } = require("../../base/base.collors.js");

const { FormatTimeEx } = require("../../base/base.exports.js");

const cooldowns = new Collection();

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        
        if (!command) {
          return reply(interaction, {
            embeds: [
              new EmbedBuilder()
              .setColor(color.red)
              .setTitle('Erro Encontrado')
              .setDescription(`> Não possuí nenhum comando correspondente a **${interaction.commandName}**!`)
              ], flags: 64
            });
        }
        
        if (!cooldowns.has(command.data.name)) {
          cooldowns.set(command.data.name, new Collection());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(interaction.user.id)) {
          const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

          if (now < expirationTime) {
            const timeLeft = expirationTime - now;
            const formattedTime = FormatTimeEx(timeLeft);
            return reply(interaction, {
              embeds: [
                new EmbedBuilder()
                .setColor(color.yellow)
                .setTitle('Usuário em Cooldown')
                .setDescription(`> Você foi adicionado ao modo **cooldown** por **spammar** a interação aos comandos simultaneamentes.
-# Aguarde **${formattedTime}** para utilizar a interação novamente!`)
                ], flags: 64
            })
          } }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        await command.execute(interaction);
      } else if (interaction.isButton()) {
        const command = interaction.client.commands.find(cmd => typeof cmd.handleButton === 'function');
        
        if (!command) {
          return reply(interaction, {
            embeds: [
              new EmbedBuilder()
              .setColor(color.red)
              .setTitle('Erro Encontrado')
              .setDescription(`> Não possuí nenhum manipulador de botões!`)
              ], flags: 64
            });
        }
      } else if (interaction.isStringSelectMenu()) {
        const command = interaction.client.commands.find(cmd => typeof cmd.handleSelectMenu === 'function');
        
        if (!command) {
          return reply(interaction, {
            embeds: [
              new EmbedBuilder()
              .setColor(color.red)
              .setTitle('Erro Encontrado')
              .setDescription(`> Não possuí nenhum manipulador de botões!`)
              ], flags: 64
            });
        }
      } else if (interaction.isModalSubmit()) {
        const command = interaction.client.commands.find(cmd => typeof cmd.handleModalSubmit === 'function');
        
        if (!command) {
          return reply(interaction, {
            embeds: [
              new EmbedBuilder()
              .setColor(color.red)
              .setTitle('Erro Encontrado')
              .setDescription(`> <:iconBall:1417317286762516480> Não possuí nenhum manipulador de botões!`)
              ], flags: 64
            });
        }
      }
    } catch (err) {
      return reply(interaction, {
        embeds: [
          new EmbedBuilder()
          .setColor(color.red)
          .setTitle('Erro Encontrado')
          .setDescription(`> Ocorreu um erro ao executar está interação!
-# ${err}`)
          ], flags: 64
      });
    }
  }
};