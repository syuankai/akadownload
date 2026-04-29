const mineflayer = require('mineflayer');

// Configuration - can be overridden via environment variables
const config = {
  host: process.env.MC_HOST || 'localhost',
  port: parseInt(process.env.MC_PORT) || 25565,
  username: process.env.MC_USERNAME || 'MineAI_Bot',
  password: process.env.MC_PASSWORD || '',
  version: process.env.MC_VERSION || false,
  auth: process.env.MC_AUTH || 'offline' // 'offline' or 'mojang'
};

let bot = null;

function createBot() {
  console.log(`[Bot] Connecting to ${config.host}:${config.port} as ${config.username}...`);
  
  bot = mineflayer.createBot({
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password || undefined,
    version: config.version,
    auth: config.password ? 'mojang' : 'offline'
  });

  bot.on('login', () => {
    console.log(`[Bot] ✓ Logged in as ${bot.username}`);
    bot.chat('/gamerule sendCommandFeedback false');
  });

  bot.on('spawn', () => {
    console.log('[Bot] ✓ Spawned in world');
  });

  bot.on('death', () => {
    console.log('[Bot] ✗ Died, respawning...');
    bot.respawn();
  });

  bot.on('kicked', (reason) => {
    console.log(`[Bot] Kicked: ${reason}`);
  });

  bot.on('error', (err) => {
    console.log(`[Bot] Error: ${err.message}`);
  });

  bot.on('end', () => {
    console.log('[Bot] Disconnected, reconnecting in 5s...');
    setTimeout(createBot, 5000);
  });

  return bot;
}

// Movement commands
function move(dir) {
  if (!bot || !bot.entity) return;
  
  switch(dir) {
    case 'forward': bot.setControlState('forward', true); break;
    case 'backward': bot.setControlState('back', true); break;
    case 'left': bot.setControlState('left', true); break;
    case 'right': bot.setControlState('right', true); break;
    case 'jump': bot.setControlState('jump', true); break;
    case 'sneak': bot.setControlState('sneak', true); break;
    case 'stop':
      bot.setControlState('forward', false);
      bot.setControlState('back', false);
      bot.setControlState('left', false);
      bot.setControlState('right', false);
      bot.setControlState('jump', false);
      bot.setControlState('sneak', false);
      break;
    case 'attack':
      const entity = bot.nearestEntity();
      if (entity) bot.attack(entity);
      break;
    case 'useItem':
      bot.activateItem();
      break;
    case 'respawn':
      bot.respawn();
      break;
  }
}

function chat(message) {
  if (bot) bot.chat(message);
}

function lookAt(x, y, z) {
  if (!bot || !bot.entity) return;
  const dx = x - bot.entity.position.x;
  const dy = y - bot.entity.position.y;
  const dz = z - bot.entity.position.z;
  const yaw = Math.atan2(-dx, -dz);
  const pitch = -Math.asin(dy / Math.sqrt(dx*dx + dy*dy + dz*dz));
  bot.look(yaw, pitch);
}

function getStatus() {
  if (!bot || !bot.entity) {
    return { connected: false };
  }
  return {
    connected: true,
    username: bot.username,
    position: {
      x: bot.entity.position.x.toFixed(2),
      y: bot.entity.position.y.toFixed(2),
      z: bot.entity.position.z.toFixed(2)
    },
    health: bot.health,
    food: bot.food
  };
}

function disconnect() {
  if (bot) {
    bot.quit('Disconnecting...');
    bot = null;
  }
}

// CLI interface
const args = process.argv.slice(2);
if (args.length > 0) {
  const cmd = args[0];
  
  if (cmd === 'move' && args[1]) {
    createBot();
    setTimeout(() => move(args[1]), 3000);
  } else if (cmd === 'chat' && args[1]) {
    createBot();
    setTimeout(() => chat(args.slice(1).join(' ')), 3000);
  } else if (cmd === 'status') {
    createBot();
    setTimeout(() => {
      console.log(JSON.stringify(getStatus(), null, 2));
    }, 3000);
  } else if (cmd === 'interactive') {
    // Interactive mode
    createBot();
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.on('line', (line) => {
      const parts = line.trim().split(' ');
      const cmd = parts[0];
      const arg = parts[1];
      
      if (cmd === 'move' && arg) {
        move(arg);
      } else if (cmd === 'stop') {
        move('stop');
      } else if (cmd === 'chat' && parts[1]) {
        chat(parts.slice(1).join(' '));
      } else if (cmd === 'status') {
        console.log(JSON.stringify(getStatus(), null, 2));
      } else if (cmd === 'quit') {
        disconnect();
        process.exit(0);
      } else {
        console.log('Commands: move <dir>, stop, chat <msg>, status, quit');
      }
    });
  }
} else {
  // Default: start bot
  createBot();
}

module.exports = { move, chat, lookAt, getStatus, disconnect, createBot };