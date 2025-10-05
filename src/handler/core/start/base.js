const { gatewayCreate } = require("../client/gateway.js");
const { envLoader, commandLoader, commandRegister, eventLoader } = require("../client/functions.js");

const { config } = require('dotenv');
config();

async function bootstrap() {
  try {
    const env = await envLoader();
    const client = gatewayCreate();
    
    const {
      DISCORD_TOKEN_APP,
      DISCORD_APP_ID,
      DISCORD_GUILD_ID
    } = env;
    
    await commandRegister(DISCORD_TOKEN_APP, DISCORD_APP_ID, DISCORD_GUILD_ID);
    
    await Promise.all([ commandLoader(client.commands), eventLoader(client)]);
    
    client.login(env.DISCORD_TOKEN_APP);
  } catch(err) {
    console.error(`[ ErroJS ]: erro de inicialização:`, err);
    process.exit(1);
  }
};

module.exports = { bootstrap };