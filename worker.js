export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // API endpoints for bot control
    if (path === '/api/connect' && request.method === 'POST') {
      return handleConnect(request, env);
    }
    if (path === '/api/disconnect' && request.method === 'POST') {
      return handleDisconnect(env);
    }
    if (path === '/api/status') {
      return new Response(JSON.stringify(env.BOT_STATUS || { connected: false }), {
        headers: { 'content-type': 'application/json' }
      });
    }
    if (path === '/api/move' && request.method === 'POST') {
      return handleMove(request, env);
    }
    if (path === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }
    if (path === '/api/test-model' && request.method === 'POST') {
      return handleTestModel(request);
    }

    // Static assets from webui folder
    if (path === '/' || path === '/index.html') {
      return new Response(await env.ASSETS.fetch(request).then(r => r.text()), {
        headers: { 'content-type': 'text/html; charset=utf-8' }
      });
    }

    // Other static assets
    const asset = await env.ASSETS.fetch(request);
    if (asset.ok) {
      return asset;
    }

    return new Response('Not found', { status: 404 });
  }
};

// Bot connection handler
async function handleConnect(request, env) {
  try {
    const { host, port, username } = await request.json();
    
    // Store config in KV (in production, use Durable Objects)
    env.BOT_CONFIG = JSON.stringify({ host, port, username });
    env.BOT_STATUS = { connected: true, username, host, port };
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}

// Bot disconnect handler
function handleDisconnect(env) {
  env.BOT_STATUS = { connected: false };
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'content-type': 'application/json' }
  });
}

// Movement handler
async function handleMove(request, env) {
  const { direction } = await request.json();
  // In production, forward to bot via WebSocket or queue
  console.log(`[Bot] Move: ${direction}`);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'content-type': 'application/json' }
  });
}

// Chat handler
async function handleChat(request, env) {
  const { message } = await request.json();
  console.log(`[Bot] Chat: ${message}`);
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'content-type': 'application/json' }
  });
}

// Model test handler
async function handleTestModel(request) {
  const { provider, apiKey, modelName, endpoint } = await request.json();
  
  try {
    let response;
    const baseUrl = endpoint || '';
    
    switch (provider) {
      case 'ollama':
        response = await fetch(`${baseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: modelName, prompt: 'Hi', stream: false })
        });
        break;
      case 'openrouter':
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://mineaibot.workers.dev',
            'X-Title': 'MineAI Bot'
          },
          body: JSON.stringify({
            model: modelName,
            messages: [{ role: 'user', content: 'Hi' }]
          })
        });
        break;
      case 'google':
        response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hi' }] }]
          })
        });
        break;
      default:
        throw new Error('Unknown provider');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || data.error || 'Request failed');
    }
    
    let resultText = '';
    switch (provider) {
      case 'ollama':
        resultText = data.response || 'OK';
        break;
      case 'openrouter':
        resultText = data.choices?.[0]?.message?.content || 'OK';
        break;
      case 'google':
        resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'OK';
        break;
    }
    
    return new Response(JSON.stringify({ success: true, response: resultText }), {
      headers: { 'content-type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}