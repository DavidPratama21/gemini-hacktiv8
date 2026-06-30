const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitButton = form.querySelector('button[type="submit"]');

const conversation = [];

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  input.value = '';
  input.disabled = true;
  submitButton.disabled = true;

  conversation.push({ role: 'user', text: userMessage });
  appendMessage('user', userMessage);

  const thinkingMessage = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok || !data || typeof data.result !== 'string' || !data.result.trim()) {
      updateMessage(thinkingMessage, 'Sorry, no response received.');
      return;
    }

    const aiReply = data.result.trim();
    conversation.push({ role: 'model', text: aiReply });
    updateMessage(thinkingMessage, aiReply);
  } catch (error) {
    console.error('Failed to get response from server:', error);
    updateMessage(thinkingMessage, 'Failed to get response from server.');
  } finally {
    input.disabled = false;
    submitButton.disabled = false;
    input.focus();
  }
});

function appendMessage(sender, text) {
  const message = document.createElement('div');
  message.classList.add('message', sender);
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  return message;
}

function updateMessage(element, text) {
  element.textContent = text;
  chatBox.scrollTop = chatBox.scrollHeight;
}
