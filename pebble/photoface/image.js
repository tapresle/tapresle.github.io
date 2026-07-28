document
.getElementById("send")
.onclick = function() {

    let message = {
        command: "test",
        value: "PhotoFace Connected!"
    };


    document.location =
        "pebblejs://close#" +
        encodeURIComponent(
            JSON.stringify(message)
        );
};