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
        return new Response(response, {
          headers: { 'Content-Type': 'text/plain' }
        });
      } catch (error) {
        return new Response('Error processing text', { status: 500 });
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
          </style>
      </head>
      <body>
          <h1>AI Typo Fixer</h1>
          <textarea id="inputText" placeholder="Paste your text here..."></textarea>
          <button onclick="fixTypos()">Fix Typos</button>
          <div id="banner" style="display: none; margin-top: 10px; padding: 10px; background-color: #e0f0e0; border-radius: 5px;"></div>
          <h2>Result:</h2>
          <textarea id="resultText" readonly style="width: 100%; height: 200px;"></textarea>

          <script>
              async function fixTypos() {
                  const inputText = document.getElementById('inputText').value;
                  const resultText = document.getElementById('resultText');
                  const banner = document.getElementById('banner');
                  resultText.value = 'Processing...';
                  banner.style.display = 'none';

                  const formData = new FormData();
                  formData.append('text', inputText);

                  try {
                      const response = await fetch('/', {
                          method: 'POST',
                          body: formData
                      });

                      if (response.ok) {
                          const correctedText = await response.text();
                          if (correctedText.startsWith('NO_TYPOS:')) {
                              resultText.value = inputText;
                              banner.textContent = 'No typos found in the text.';
                              banner.style.display = 'block';
                          } else {
                              resultText.value = correctedText;
                          }
                      } else {
                          resultText.value = 'Error: ' + response.statusText;
                      }
                  } catch (error) {
                      resultText.value = 'Error: ' + error.message;
                  }
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
