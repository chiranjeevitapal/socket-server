$(() => {
    $("#mesgs").hide();
    let socket = io();
    let userDetails = new User("", "", "", "");
    $("form").submit(function (e) {
        e.preventDefault();
        let userName = $("#user-name").val();
        let userAge = $("#user-age").val();
        let userGender = $("#user-gender").val();
        userDetails = new User(socket.io.engine.id, userName, userAge, userGender);
        $("#userDetailsModal").modal("hide");
        socket.emit("user_details", userDetails);
    });
    socket.on("prompt_user_details", () => {
        $("#userDetailsModal").modal("show");
    });
    socket.on("joined_chat_room", (room) => {
        console.log(socket.io.engine.id + " joined chat room : " + room['id']);
    });
    socket.on("message", (msg) => {
        alert(msg);
    });
    socket.on("chat_session_created", () => {
        alert("you are connected to anonymous user");
    });
    $("#start-chatting").on("click", () => {
        socket.emit("create_or_join_room");
    });
    $("#send-message").on("click", () => {
        socket.emit("send_message", "hellooo.. ");
    });
});


