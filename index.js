let express = require('express');
let path = require('path');
let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
var findRandomBreaker = null;
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.use(express.static(path.join(__dirname, "public")));
let onlineUsers = [];
let rooms = [];

io.on('connection', (socket) => {
    //Prompt UI to render user details
    socket.emit("prompt_user_details");

    //After getting user details, add the session id and status to the user object and
    //populate the user into online users list
    socket.on('user_details', (userDetails) => {
        onlineUsers.push(userDetails);
        printOnlineUsers();
    });

    socket.on('create_or_join_room', () => {
        console.log(socket.id + " is trying to create or join a room.");
        let socket_room = Object.keys(socket.rooms).filter(item => item != socket.id);
        if (socket_room != null) {
            socket.leave(socket_room);
        }
        let room_name = null;
        if (rooms.length != 0) {
            for (let i = 0; i < rooms.length; i++) {
                let clients = io.of('/').adapter.rooms[rooms[i]];
                if (clients != undefined && clients.length < 2) {
                    room_name = rooms[i];
                }
            }
        }
        if (room_name == null || rooms.length == 0) {
            console.log("creating a new room");
            room_name = 'room-' + (Math.floor(Math.random() * 100000000) + 1);
            rooms.push(room_name);
        }
        socket.join(room_name);

        let clients = io.of('/').adapter.rooms[room_name];
        console.log(clients);
        if (clients != undefined && clients.length == 2) {
            io.in(room_name).emit('chat_session_created');
        }
    })

    socket.on('send_message', (message) => {
        let socket_room = Object.keys(socket.rooms).filter(item => item != socket.id);
        socket.broadcast.in(socket_room).emit('message', message);
    });

    //Delete the user details from the online users array when user leaves the session
    socket.on('disconnect', () => {
        deleteUser(socket.id);
        let socket_room = Object.keys(socket.rooms).filter(item => item != socket.id);
        console.log(socket_room);
        socket.broadcast.in(socket_room).emit('message', "your mate left the chat.");
    });
});


//Delete use form the available users array
let deleteUser = (id) => {
    console.log("deleting user : " + id);
    const index = onlineUsers.findIndex(x => x.id === id);
    onlineUsers.splice(index, 1);
    printOnlineUsers();
}

http.listen(3000, () => {
    console.log('Server is listening on port *:3000');
});

let printOnlineUsers = () => {
    console.log("## Online Users ##");
    console.log(onlineUsers);
    console.log("##################");
};