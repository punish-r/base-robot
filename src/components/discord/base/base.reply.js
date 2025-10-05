async function reply(interaction, options = {}, type = 'reply') {
  try {
    if (type === 'modal') {
      return await interaction.showModal(options);
    }
    
    if (interaction.deferred) {
      return await interaction.editReply(options);
    } else if (interaction.replied) {
      return await interaction.followUp(options);
    } else if (type === 'reply') {
      return await interaction.reply(options);
    } else if (type === 'defer') {
      return await interaction.deferReply(options);
    }
  } catch(err) {
    console.error(`[ replyJS erro ]: `, err.message);
  }
}

module.exports = { reply };