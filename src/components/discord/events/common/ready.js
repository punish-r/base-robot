const { Events, ActivityType } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  
  async execute(client) {
    const status = [
      {
        name: 'Developed by: Punish',
        type: ActivityType.Listening,
        status: 'online'
      }
    ];
    
    client.user.setActivity(status[0]);
    
    setInterval(() => {
      const random = Math.floor(Math.random() * status.length);
      client.user.setActivity(status[random]);
    }, 60 * 1000);
    
    console.log(`[ AppJS ]: Aplicação online com sucesso.`);
  }
};