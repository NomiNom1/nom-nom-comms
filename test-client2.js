const { io } = require('socket.io-client');

const socket = io('http://localhost:3000/ws/messages', {
  query: {
    userId: 'user2'
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
  // Automatically mark the message as read
  socket.emit('markAsRead', {
    messageId: message.id,
    userId: 'user2'
  });
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