export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const formData = await request.formData();
      const text = formData.get('text');

      if (!text) {
        return new Response('No text provided', { status: 400 });
      }

      const aiInput = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant that fixes typos in text without making any other changes. Return only the corrected text, nothing else.' },
          { role: 'user', content: text }
        ]
      };

      try {
        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', aiInput);
        return new Response(response, {
          headers: { 'Content-Type': 'text/plain' }
        });
      } catch (error) {
        return new Response('Error processing text', { status: 500 });
      }
    } else {
      return new Response('Method not allowed', { status: 405 });
    }
  }
};
