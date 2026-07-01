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
  
  if (sender === 'bot') {
    const avatar = document.createElement('div');
    avatar.classList.add('avatar');
    avatar.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12L2.1 7.1"/></svg>`;
    message.appendChild(avatar);
  }
  
  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.textContent = text;
  message.appendChild(bubble);

  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  return bubble; // Return the bubble so we can update its text later
}

function updateMessage(bubbleElement, text) {
  bubbleElement.textContent = text;
  chatBox.scrollTop = chatBox.scrollHeight;
}
