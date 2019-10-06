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
/* function User(id, name) {
    this.userid = id;
    this.nickname = name;
    this.pushToTheList = function () {
        usersList.push(this);
    }
    this.pushToTheList();
} */

io.on('connection', (socket) => {
    //Prompt UI to render user details
    socket.emit("prompt_user_details");

    //After getting user details, add the session id and status to the user object and
    //populate the user into online users list
    socket.on('user_details', (userDetails) => {
        onlineUsers.push(userDetails);
        console.log("--------- Online Users ------------");
        console.log(onlineUsers);
        console.log("-----------------------------------")
    });

    //Find a random idle user for chat
    socket.on('find_random_user', (userDetails) => {
        for (let i = 0; i < onlineUsers.length; i++) {
            if (onlineUsers[i].id == userDetails.id) {
                onlineUsers[i].status = userDetails.status;
            }
        }
        var randomUser = null;
        findRandomBreaker = setInterval(function () {
            randomUser = findRandomUser(userDetails['id']);
            if (randomUser != null) {
                console.log("========================");
                console.log(randomUser);
                console.log("========================");
                for (let i = 0; i < onlineUsers.length; i++) {
                    if (onlineUsers[i].id == userDetails.id) {
                        onlineUsers[i].status = "Chatting";
                    }
                }
                socket.emit('chat_mate', randomUser);
            }
        }, 3000);
    });

    /* socket.on('chat message', (data) => {
        console.log("chat message received from client... " + data.message);
        console.log("Receiver's socket id ... " + data.receiverId);
        console.log("user.nickname... " + data.nickname);
        socket.to(data.receiverId).emit('socket message', { msg: data.message, socketid: socket.id, nickname: data.nickname });
        //io.emit('socket message', { msg: data.message, socketid: socket.id, nickname: data.nickname });
    }); */

    //Delete the user details from the online users array when user leaves the session
    socket.on('disconnect', () => {
        deleteUser(socket.id);
        /*  setTimeout(() => {
             io.sockets.emit('online users', {
                 onlineUsers: usersList
             });
         }, 1); */
    });
});

let findRandomUser = (currentUserId) => {
    let randomIndex = parseInt(Math.floor(Math.random() * onlineUsers.length));
    console.log(currentUserId + " is looking for a chat mate at index " + randomIndex)
    let onlineUser = onlineUsers[randomIndex];
    console.log("potential match : " + onlineUser['name'] + "-" + onlineUser['status']);
    if (onlineUser['status'] === 'Searching' && currentUserId != onlineUser['id']) {
        console.log(findRandomBreaker);
        clearInterval(findRandomBreaker);
        console.log(currentUserId + " found " + onlineUser['name']);
        return onlineUser;
    }
}
//Delete use form the available users array
let deleteUser = (id) => {
    console.log("To be deleted : " + id);
    onlineUsers.forEach((user) => {
        if (user.userid === id) {
            console.log("id matched.. deleting... ")
            const index = onlineUsers.indexOf(user);
            console.log("index: " + index);
            onlineUsers.splice(index, 1);
            console.log(usersList);
        }
    });
}

http.listen(3000, () => {
    console.log('Server is listening on port *:3000');
});