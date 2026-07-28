document
.getElementById("send")
.onclick = function() {

    var message = {
        hello: "PhotoFace works!"
    };


    document.location =
        "pebblejs://close#" +
        encodeURIComponent(
            JSON.stringify(message)
        );

};