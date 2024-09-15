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
          { role: 'system', content: 'You are a helpful assistant that fixes typos in text without making any other changes. If no typos are found, start your response with "NO_TYPOS:". Otherwise, return only the corrected text.' },
          { role: 'user', content: text }
        ]
      };

      try {
        const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', aiInput);
        
        // Check if response is an object with a 'response' property
        const responseText = typeof response === 'object' && response.response ? response.response : response;

        if (typeof responseText !== 'string') {
          throw new Error('Unexpected response format from AI');
        }

        if (responseText.trim().startsWith('NO_TYPOS:')) {
          return new Response(null, { status: 204 });
        }

        return new Response(responseText.trim(), {
          headers: { 'Content-Type': 'text/plain' }
        });
      } catch (error) {
        return new Response(`Error processing text: ${error}`, { status: 500 });
      }
    } else if (request.method === 'GET') {
      const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>AI Typo Fixer</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
              }
              textarea {
                  width: 100%;
                  height: 200px;
                  margin-bottom: 10px;
              }
              button {
                  padding: 10px 20px;
                  font-size: 16px;
              }
              #banner {
                  margin-top: 10px;
                  padding: 10px;
                  border-radius: 5px;
              }
              .success {
                  background-color: #e0f0e0;
              }
              .error {
                  background-color: #f0e0e0;
              }
          </style>
      </head>
      <body>
          <h1>AI Typo Fixer</h1>
          <textarea id="inputText" placeholder="Paste your text here..."></textarea>
          <button onclick="fixTypos()">Fix Typos</button>
          <div id="banner" style="display: none;"></div>

          <script>
              async function fixTypos() {
                  const inputText = document.getElementById('inputText');
                  const banner = document.getElementById('banner');
                  banner.style.display = 'none';
                  banner.className = '';

                  const formData = new FormData();
                  formData.append('text', inputText.value);

                  try {
                      const response = await fetch('/', {
                          method: 'POST',
                          body: formData
                      });

                      if (response.ok) {
                          if (response.status === 204) {
                              banner.textContent = 'No typos found in the text.';
                              banner.className = 'success';
                          } else {
                              const correctedText = await response.text();
                              inputText.value = correctedText;
                              banner.textContent = 'Typos fixed successfully.';
                              banner.className = 'success';
                          }
                      } else {
                          banner.textContent = 'Error: ' + response;
                          banner.className = 'error';
                      }
                  } catch (error) {
                      banner.textContent = 'Error: ' + error;
                      banner.className = 'error';
                  }
                  banner.style.display = 'block';
              }
          </script>
      </body>
      </html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    } else {
      return new Response('Method not allowed', { status: 405 });
    }
  }
};
