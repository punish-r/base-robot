const { REST, Routes } = require('discord.js');
const { readFile, readdir, stat } = require('node:fs/promises');
const { join, dirname, resolve, relative } = require('node:path');
const { lstat } = require('node:fs/promises');
const { config } = require('dotenv');

async function envLoader() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const r = config({ path: envPath });
    
    if (r.error) {
      console.warn(`[ envJS erro]: .env não foi encontrado no caminho escolhido`);
    }
    
    const vars = {
      DISCORD_TOKEN_APP: process.env.DISCORD_TOKEN_APP,
      DISCORD_APP_ID: process.env.DISCORD_APP_ID,
      DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID
    };
    
    const varsMissing = [];
    if (!vars.DISCORD_TOKEN_APP) varsMissing.push('DISCORD_TOKEN_APP');
    if (!vars.DISCORD_APP_ID) varsMissing.push('DISCORD_APP_ID');
    if (!vars.DISCORD_GUILD_ID) varsMissing.push('DISCORD_GUILD_ID');
    
    if (varsMissing.length > 0) {
      console.error(`[ envJS erro]: Variáveis faltando no arquivo .env: ${varsMissing.join('.')}`);
    }
    
    return vars;
  } catch(err) {
    console.error(`[ envJS erro ]: Erro no carregamento do .env:`, err);
  }
}

async function commandLoader(commandsCollection) {
  try {
    const f = join(__dirname, '../../../components/discord/commands');
    const commandFolder = await readdir(f);
    
    for (const folder of commandFolder) {
      const commandPath = join(f, folder);
      const commandFile = (await readdir(commandPath)).filter(file => file.endsWith('.js'));
      
      for (const file of commandFile) {
        const filePath = join(commandPath, file);
        const command = require(filePath);
        
        if (command?.data?.name && typeof command.execute === 'function') {
          commandsCollection.set(command.data.name, command);
        }
      }
    }
  } catch(err) {
    console.error(`[ commandJS erro ]: Erro ao inserir o comando:`, err);
  }
}

async function commandRegister(DISCORD_TOKEN_APP, DISCORD_APP_ID, DISCORD_GUILD_ID) {
  const commands = [];
  
  const readCommandsFromDir = async (dir) => {
    const files = await readdir(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stat = await lstat(filePath);
      
      if (stat.isDirectory()) {
        await readCommandsFromDir(filePath);
      } else if (file.endsWith('.js')) {
        const command = require(filePath);
        
        if (command?.data) {
          commands.push(command.data.toJSON());
        }
      }
    }
  };
  
  await readCommandsFromDir(join(__dirname, '../../../components/discord/commands'));
  
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN_APP);
  
  try {
    const registeredCommands = await rest.get(
      Routes.applicationGuildCommands(DISCORD_APP_ID, DISCORD_GUILD_ID)
    );
    
    const needsUpdate = registeredCommands.length !== commands.length || commands.some((cmd, i) => !registeredCommands[i] || JSON.stringify(cmd) !== JSON.stringify(registeredCommands[i]));
    
    if (needsUpdate) {
      await rest.put(Routes.applicationGuildCommands(DISCORD_APP_ID, DISCORD_GUILD_ID), { body: commands });
      console.log('[commandJS]: Todos os comandos atualizados com sucesso!');
    } else {
      console.log('[commandJS]: Nenhuma alteração encontrada nos comandos!');
    }
  } catch (error) {
    console.error('[commandJS erro]: Erro ao registrar os comandos:', error);
    throw error;
  }
}

async function eventLoader(client) {
  try {
    const b = join(__dirname, '../../../components/discord');
    const eventPath = join(b, 'events');
    const respondersPath = join(b, 'responders');
    
    async function readFileRecursively(dirPath, type) {
      const f = [];
      
      async function scanDirectory(currentPath) {
        const items = await readdir(currentPath);
        
        for (const i of items) {
          const fullPath = join(currentPath, i);
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            await scanDirectory(fullPath);
          } else if (stats.isFile() && i.endsWith('.js')) {
            f.push({ 
              path: fullPath, 
              type: type, 
              relativePath: relative(type === 'events' ? eventPath : respondersPath, fullPath) 
            });
          }
        }
      }
      
      await scanDirectory(dirPath);
      return f;
    }
    
    const eventFiles = await readFileRecursively(eventPath, 'events');
    const responderFiles = await readFileRecursively(respondersPath, 'responders');
    const allFile = [...eventFiles, ...responderFiles];
    
    for (const { path: filePath, type, relativePath } of allFile) {
      try {
        const event = require(filePath);
        const e = Array.isArray(event) ? event : [event];
        
        for (const evt of e) {
          if (evt?.name && typeof evt.execute === 'function') {
            client[evt.once ? 'once' : 'on'](evt.name, (...args) => evt.execute(...args, client));
          }
        }
      } catch(err) {
        console.error(`[ eventJS erro ]: Erro ao tentar registrar o ${type}: ${relativePath || filePath}:`, err);
      }
    }
    
  } catch(err) {
    console.error(`[ eventJS erro ]: Erro na função de carregar eventos:`, err);
    throw err;
  }
}

module.exports = { envLoader, commandLoader, commandRegister, eventLoader };