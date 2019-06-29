$(() => {
    let socket = io();
    let nickname = "";
    $('form').submit((e) => {
        console.log("form submitted...");
        e.preventDefault();
        let text = $('#message-box').val();
        if (text.length > 0)
            socket.emit('chat message', { message: $('#message-box').val(), nickname: nickname });
        $('#message-box').val('');
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
            msg_template =
                '<div class="incoming_msg">' +
                '<div class="incoming_msg_img"><img src="https://ptetutorials.com/images/user-profile.png" alt="user_image">' + data.nickname + ' </div>' +
                '<div class="received_msg">' +
                '<div class="received_withd_msg">' +
                '<p>' + data.msg + '</p>' +
                '</div>' +
                '</div>' +
                '</div>';
            $("#msg_history").append(msg_template);
            setInterval(updateScroll, 1000);
        } else {
            msg_template =
                ' <div class="outgoing_msg">' +
                '<div class="sent_msg">' +
                '<p>' + data.msg + '</p>' +
                '</div>' +
                '</div>'
            $("#msg_history").append(msg_template);
            setInterval(updateScroll, 1000);
        }
    });
    socket.on('online users', function (response) {
        $('#online-users').empty();
        response.onlineUsers.forEach(user => {
            let template = '<div class="online_list"><div class="online_people"><div class="chat_img"> <img src="/images/user-profile.png" alt="user_image"> </div> <div class="chat_ib"><h5>' + user + ' </h5></div></div></div>';
            $('#online-users').append(template);
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
