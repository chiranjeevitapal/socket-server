$(() => {
    $("#mesgs").hide();
    let socket = io();
    let nickname = "";
    var receiverId = "";
    $('form').submit((e) => {
        console.log("form submitted...");
        e.preventDefault();
        let text = $('#message-box').val();
        if (text.length > 0)
            socket.emit('chat message', { message: $('#message-box').val(), nickname: nickname, receiverId: this.receiverId });
        $('#message-box').val('');
        setChatHistory(text, "To:");
        outgoingMessage(text);
        updateScroll();
        return false;
    });
    socket.on('request nickname', () => {
        while (!nickname) {
            nickname = prompt('Nickname');
        };
        $('#user_name').text(nickname);
        socket.emit('nickname chosen', nickname);
    })
    socket.on('socket message', (data) => {
        console.log("Message is from socket : " + data.socketid);
        console.log("Current user socket id : " + socket.io.engine.id);
        let msg_template = "";
        if (socket.io.engine.id != data.socketid) {
            setChatHistory(data.msg, "From:");
            incomingMessage(data.msg, data.nickname);
            setInterval(updateScroll, 1000);
        }
    });
    socket.on('online users', function (response) {
        $('#online-users').empty();
        response.onlineUsers.forEach(user => {
            if (user.userid !== socket.io.engine.id) {
                let template = '<div class="online_list" onclick=privateChat("' + user.userid + '")><div class="online_people"><div class="chat_img"> <img src="/images/user-profile.png" alt="user_image"> </div> <div class="chat_ib"><h5>' + user.nickname + ' </h5></div></div></div>';
                $('#online-users').append(template);
            }
        });
    });

    $('#msg_history').animate({
        scrollTop: $('#msg_history').get(0).scrollHeight
    }, 1000);
});

updateScroll = () => {
    $('#msg_history').animate({
        scrollTop: $('#msg_history')[0].scrollHeight
    }, "fast");
}

privateChat = (userId) => {
    receiverId = userId;
    var chats = localStorage.getItem(userId);
    let temp = [];
    if (chats && chats.length > 0) {
        if (typeof (chats) == String) {
            temp.push(chats);
            chats = temp;
        }
        console.log("Chat history is available ... loading ...")
        console.log(chats);
        chats.forEach((chat) => {
            if (chat.indexOf("To:") != -1) {
                outgoingMessage(chat.substring(2));
            } else {
                incomingMessage(chat.substring(2));
            }
        })
    }
    $("#mesgs").show();
}

outgoingMessage = (text) => {
    console.log("Appending outgoing message");
    msg_template =
        ' <div class="outgoing_msg">' +
        '<div class="sent_msg">' +
        '<p>' + text + '</p>' +
        '</div>' +
        '</div>'
    $("#msg_history").append(msg_template);
}

incomingMessage = (text, nickname) => {
    console.log("Appending incoming message");
    msg_template =
        '<div class="incoming_msg">' +
        '<div class="incoming_msg_img"><img src="https://ptetutorials.com/images/user-profile.png" alt="user_image">' + nickname + ' </div>' +
        '<div class="received_msg">' +
        '<div class="received_withd_msg">' +
        '<p>' + text + '</p>' +
        '</div>' +
        '</div>' +
        '</div>';
    $("#msg_history").append(msg_template);
}

setChatHistory = (message, fromOrTo) => {
    let msg = [];
    let history = localStorage.getItem(receiverId);
    if (history && history.length > 0) {
        msg = history;
    } else {
        msg = [];
        msg.push("fromOrTo:" + message);
    }
    localStorage.setItem(receiverId, msg);

}
