const WIDTH = 144;
const HEIGHT = 168;

let imageBytes = null;


document
    .getElementById("photoPicker")
    .addEventListener(
        "change",
        loadPhoto
    );


document
    .getElementById("send")
    .onclick = function () {

        if (!imageBytes) {
            alert("Select an image first");
            return;
        }


        let encoded =
            JSON.stringify(
                Array.from(imageBytes)
            );


        console.log(
            "Sending bytes:",
            imageBytes.length
        );


        document.location =
            "pebblejs://close#" +
            encodeURIComponent(encoded);
    };



function loadPhoto(event) {

    const file =
        event.target.files[0];


    if (!file)
        return;


    const reader =
        new FileReader();


    reader.onload = function(e) {

        const img =
            new Image();


        img.onload = function() {
            processImage(img);
        };


        img.src =
            e.target.result;
    };


    reader.readAsDataURL(file);
}



function processImage(img) {

    const canvas =
        document.getElementById("preview");


    canvas.width = WIDTH;
    canvas.height = HEIGHT;


    const ctx =
        canvas.getContext("2d");


    ctx.clearRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    const scale =
        Math.max(
            WIDTH / img.width,
            HEIGHT / img.height
        );


    const newWidth =
        img.width * scale;


    const newHeight =
        img.height * scale;


    const x =
        (WIDTH - newWidth) / 2;


    const y =
        (HEIGHT - newHeight) / 2;


    ctx.drawImage(
        img,
        x,
        y,
        newWidth,
        newHeight
    );


    const data =
        ctx.getImageData(
            0,
            0,
            WIDTH,
            HEIGHT
        );


    imageBytes =
        convertToPebble(data);


    console.log(
        "Image bytes:",
        imageBytes.length
    );
}



function convertToPebble(image) {

    const pixels =
        image.data;


    const output =
        new Uint8Array(
            WIDTH * HEIGHT
        );


    let offset = 0;


    for (
        let i = 0;
        i < pixels.length;
        i += 4
    ) {

        output[offset++] =
            packPixel(
                pixels[i],
                pixels[i + 1],
                pixels[i + 2]
            );
    }


    return output;
}



// Pebble 8-bit color test format
function packPixel(r, g, b) {

    let red =
        (r >> 5) & 0x07;


    let green =
        (g >> 5) & 0x07;


    let blue =
        (b >> 6) & 0x03;


    return (
        (red << 5) |
        (green << 2) |
        blue
    );
}