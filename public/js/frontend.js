$(() => {
    let socket = io();
    $('form').submit((e) => {
        e.preventDefault();
        socket.emit('chat message', $('#message-box').val());
        $('#message-box').val('');
        return false;
    });
    socket.on('request nickname', () => {
        while (!nickname) {
            var nickname = prompt('Nickname');
        };
        $('#userName h3').text("Welcome " + nickname);
        socket.emit('nickname chosen', nickname);
    })
    socket.on('chat message', (message) => {
        $('#messages').append($('<li>').text(message));
    });
    socket.on('online users', function (response) {
        $('#online-users').empty();
        response.onlineUsers.forEach(user => {
            let template = '<div class="online_list"><div class="online_people"><div class="chat_img"> <img src="/images/user-profile.png" alt="user_image"> </div> <div class="chat_ib"><h5>'+user+' </h5></div></div></div>';
            $('#online-users').append(template);
        });
    });
});
