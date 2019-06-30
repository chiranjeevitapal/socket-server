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
            setChatHistory(data.msg, "Fr:");
            incomingMessage(data.msg, data.nickname);
        }
    });
    socket.on('online users', function (response) {
        $('#online-users').empty();
        response.onlineUsers.forEach(user => {
            if (user.userid !== socket.io.engine.id) {
                let template = '<div class="online_list" onclick=privateChat("' + user.userid + '","' + user.nickname + '")><div class="online_people"><div class="chat_img"> <img src="/images/user-profile.png" alt="user_image"> </div> <div class="chat_ib"><h5>' + user.nickname + ' </h5></div></div></div>';
                $('#online-users').append(template);
            }
        });
    });
});

updateScroll = () => {
    $('#msg_history').animate({
        scrollTop: $('#msg_history')[0].scrollHeight
    }, "fast");
}

privateChat = (userId, nickname) => {
    console.log("coming into privateChat...");
    $("#msg_history").empty();
    receiverId = userId;
    var chats = localStorage.getItem(userId);
    if (chats && chats.length > 0) {
        console.log("Chat history is available ... loading ...")
        console.log(chats);
        console.log("type of chats " + typeof chats);
        console.log("type of chats " + typeof chats == 'string');
        console.log("type of chats " + typeof chats === 'string');
        console.log("type of chats " + typeof chats === 'object');
        if (typeof chats == 'string') {
            console.log("coming into string section ");
            let chatArr = chats.split(",");
            chats = chatArr;
        }
        console.log(chats);
        console.log("type of chats " + typeof chats);
        console.log("type of chats " + typeof chats == 'string');
        console.log("type of chats " + typeof chats === 'string');
        console.log("type of chats " + typeof chats === 'object');
        console.log("coming into array section ");
        chats.forEach((chat) => {
            if (chat.startsWith("To:")) {
                outgoingMessage(chat.substring(3));
            } else {
                incomingMessage(chat.substring(3), nickname);
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
    console.log("Chat history " + history);
    if (history) {
        console.log("history exists ... pushing");
        if (typeof history === 'string') {
            msg.push(history);
        } else {
            history.forEach((str) => {
                msg.push(str);
            });
        }
        msg.push(fromOrTo + message);
    } else {
        console.log("history does not exists ... pushing");
        msg.push(fromOrTo + message);
    }
    console.log("type of msg is " + typeof msg);
    console.log(msg);

    localStorage.setItem(receiverId, msg);
}
