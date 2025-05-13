const { io } = require('socket.io-client');

const socket = io('http://localhost:3000/ws/messages', {
  query: {
    userId: 'user1'
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('connected', (data) => {
  console.log('Server response:', data);
});

socket.on('newMessage', (message) => {
  console.log('New message received:', message);
});

socket.on('messageSent', (message) => {
  console.log('Message sent confirmation:', message);
});

socket.on('messageRead', (data) => {
  console.log('Message read confirmation:', data);
});

socket.on('error', (error) => {
  console.error('Error:', error);
});

// Function to send a message
function sendMessage() {
  socket.emit('sendMessage', {
    senderId: 'user1',
    receiverId: 'user2',
    content: 'Hello from User 1!',
    type: 'TEXT'
  });
}

// Send a message after 2 seconds
setTimeout(sendMessage, 2000); 