let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
var clients = 0;
io.on('connection', (socket) => {
    clients++;
    io.sockets.emit('broadcast', { description: 'Online ' + clients });
    socket.on('chat message', (message) => {
        io.emit('chat message', message);
    });
    socket.on('disconnect', () => {
        clients--;
        io.sockets.emit('broadcast', { description: 'Online ' + clients });
    });
});

http.listen(3000, () => {
    console.log('Server is listening on port *:3000');
});