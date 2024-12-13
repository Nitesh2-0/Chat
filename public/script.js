const socket = io();

const totalUsers = document.getElementById('users');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');

socket.on('totalUsers', (count) => {
  if (!count) return;
  if (count === 1) totalUsers.innerText = `You`;
  else totalUsers.innerText = `${count}`;
});

socket.on('chat-data', (data) => {
  addMessageToUI(false, data);
});

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!messageInput.value) return;
  if (messageInput.value.trim() === "" && messageInput.value === " ") return;

  const chatMessage = {
    name: nameInput.value,
    message: messageInput.value,
    time: moment().format('h:mm a'),
    date: moment().format('D-MM-YYYY'),
  };
  messageInput.value = '';
  socket.emit('message', chatMessage);
  addMessageToUI(true, chatMessage);
});

function addMessageToUI(isSender, data) {
  const element = `
    <li class="${isSender ? 'message-right' : 'message-left'}">
      <p class="message">
        ${data.message}
        <span>${data.name} ● ${data.time} - ${data.date}</span>
      </p>
    </li>
  `;

  messageContainer.innerHTML += element;
  scrollBottom();
}

function scrollBottom() {
  messageContainer.scrollTo(0, messageContainer.scrollHeight);
}

// Typing functionality
let isTyping = false;

function emitTypingEvent() {
  if (nameInput.value.trim() && !isTyping) {
    isTyping = true;
    socket.emit('typing', {
      typing: `✍️ ${nameInput.value} is typing a message`,
    });
  }
}

function stopTypingEvent() {
  if (isTyping) {
    isTyping = false;
    socket.emit('typing', { typing: '' });
  }
}

messageInput.addEventListener('focus', emitTypingEvent);
messageInput.addEventListener('keypress', emitTypingEvent);
messageInput.addEventListener('blur', stopTypingEvent);

socket.on('typing', (data) => {
  clearTyping();
  if (data.typing) {
    const element = `
      <li class="message-typing">
        <p class="typing" id="typing">${data.typing}</p>
      </li>
    `;
    messageContainer.innerHTML += element;
    scrollBottom();
  }
});

function clearTyping() {
  document.querySelectorAll('li.message-typing').forEach((element) => {
    element.remove();
  });
}
