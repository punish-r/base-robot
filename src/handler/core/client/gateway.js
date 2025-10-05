const { Client, Collection, GatewayIntentBits } = require("discord.js");

function gatewayCreate() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
      ]
  });
  
  client.commands = new Collection();
  client.cooldowns = new Collection();
  
  return client;
};

module.exports = { gatewayCreate };