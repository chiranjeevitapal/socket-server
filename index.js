let express = require('express');
let path = require('path');
let app = require('express')();
let http = require('http').createServer(app);
let io = require('socket.io')(http);
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index_new.html');
});
app.use(express.static(path.join(__dirname, "public")));
let clients = 0;
let usersList = [];
function User(id, name) {
    this.userid = id;
    this.nickname = name;
    this.pushToTheList = function () {
        usersList.push(this);
    }
    this.pushToTheList();
}

io.on('connection', (socket) => {
    console.log("There is a new connction ");
    console.log("Request to enter a nickname ");
    socket.emit("request nickname");

    socket.on('nickname chosen', (nickname) => {
        console.log("Nickname chosen : " + nickname);
        new User(socket.id, nickname);
        io.sockets.emit('online users', {
            onlineUsers: onlineUserNames()
        });
    })
    clients++;

    socket.on('chat message', (message) => {
        io.emit('chat message', message);
    });
    socket.on('disconnect', () => {
        clients--;
        deleteUser(socket.id);
        setTimeout(() => {
            io.sockets.emit('online users', {
                onlineUsers: onlineUserNames()
            });
        }, 1);
    });
});

let deleteUser = (id) => {
    console.log("To be deleted : " + id);
    usersList.forEach((user) => {
        if (user.userid === id) {
            console.log("id matched.. deleting... ")
            const index = usersList.indexOf(user);
            console.log("index: " + index);
            usersList.splice(index, 1);
            console.log(usersList);
        }
    });
}

let onlineUserNames = () => {
    let names = [];
    usersList.forEach((user) => {
        names.push(user.nickname);
    });
    return names;
}

http.listen(3000, () => {
    console.log('Server is listening on port *:3000');
});