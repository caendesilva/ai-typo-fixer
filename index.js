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
          <h2>Result:</h2>
          <div id="result"></div>

          <script>
              async function fixTypos() {
                  const inputText = document.getElementById('inputText').value;
                  const resultDiv = document.getElementById('result');
                  resultDiv.textContent = 'Processing...';

                  const formData = new FormData();
                  formData.append('text', inputText);

                  try {
                      const response = await fetch('/', {
                          method: 'POST',
                          body: formData
                      });

                      if (response.ok) {
                          const correctedText = await response.text();
                          resultDiv.textContent = correctedText;
                      } else {
                          resultDiv.textContent = 'Error: ' + response.statusText;
                      }
                  } catch (error) {
                      resultDiv.textContent = 'Error: ' + error.message;
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
