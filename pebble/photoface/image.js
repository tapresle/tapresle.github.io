const WIDTH = 144;
const HEIGHT = 168;

const CHUNK_SIZE = 80;

let imageBytes = null;


/*
  This is the same 64 color palette
  you already had.
  Keep your existing PEBBLE_PALETTE array here.
*/

const PEBBLE_PALETTE = [
    { r: 0, g: 0, b: 0 },
    { r: 0, g: 0, b: 85 },
    { r: 0, g: 0, b: 170 },
    { r: 85, g: 0, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 85, g: 0, b: 85 },
    { r: 85, g: 0, b: 170 },
    { r: 0, g: 85, b: 0 },
    { r: 170, g: 0, b: 85 },
    { r: 0, g: 85, b: 170 },
    { r: 170, g: 0, b: 170 },
    { r: 85, g: 85, b: 0 },
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 85, b: 255 },
    { r: 170, g: 0, b: 255 },
    { r: 85, g: 85, b: 85 },
    { r: 0, g: 170, b: 0 },
    { r: 170, g: 85, b: 0 },
    { r: 85, g: 85, b: 255 },
    { r: 255, g: 0, b: 255 },
    { r: 0, g: 170, b: 85 },
    { r: 170, g: 85, b: 85 },
    { r: 0, g: 170, b: 170 },
    { r: 170, g: 85, b: 170 },
    { r: 170, g: 85, b: 255 },
    { r: 85, g: 170, b: 85 },
    { r: 255, g: 85, b: 85 },
    { r: 85, g: 170, b: 170 },
    { r: 255, g: 85, b: 170 },
    { r: 0, g: 255, b: 0 },
    { r: 170, g: 170, b: 0 },
    { r: 85, g: 170, b: 255 },
    { r: 0, g: 255, b: 170 },
    { r: 170, g: 170, b: 170 },
    { r: 85, g: 255, b: 0 },
    { r: 255, g: 170, b: 0 },
    { r: 0, g: 255, b: 255 },
    { r: 170, g: 170, b: 255 },
    { r: 85, g: 255, b: 85 },
    { r: 255, g: 170, b: 85 },
    { r: 85, g: 255, b: 255 },
    { r: 255, g: 170, b: 255 },
    { r: 170, g: 255, b: 85 },
    { r: 170, g: 255, b: 170 },
    { r: 255, g: 255, b: 0 },
    { r: 170, g: 255, b: 255 },
    { r: 255, g: 255, b: 85 },
    { r: 255, g: 255, b: 170 },
    { r: 170, g: 255, b: 0 },
    { r: 170, g: 170, b: 85 },
    { r: 255, g: 255, b: 255 },
    { r: 85, g: 255, b: 170 },
    { r: 255, g: 85, b: 255 },
    { r: 85, g: 170, b: 0 },
    { r: 255, g: 0, b: 85 },
    { r: 170, g: 0, b: 0 },
    { r: 0, g: 170, b: 255 },
    { r: 255, g: 0, b: 170 },
    { r: 0, g: 85, b: 85 },
    { r: 255, g: 170, b: 170 },
    { r: 0, g: 255, b: 85 },
    { r: 255, g: 85, b: 0 },
    { r: 85, g: 85, b: 170 },
    { r: 85, g: 0, b: 255 }
];



document
    .getElementById("photoPicker")
    .addEventListener("change", loadPhoto);



document
    .getElementById("send")
    .onclick = function () {

        if (!imageBytes) {
            alert("Select image first");
            return;
        }


        sendImage();

    };



function sendImage() {
    let base64 =
        arrayBufferToBase64(
            imageBytes.buffer
        );


    let total =
        Math.ceil(
            base64.length / CHUNK_SIZE
        );


    for (let i = 0; i < total; i++) {
        let chunk =
            base64.substring(
                i * CHUNK_SIZE,
                (i + 1) * CHUNK_SIZE
            );


        Pebble.sendAppMessage(
            {
                image_chunk: chunk,
                chunk_number: i,
                total_chunks: total
            });


        console.log(
            "Sending chunk",
            i,
            chunk.length
        );
    }
}



function arrayBufferToBase64(buffer) {
    let binary = "";

    let bytes =
        new Uint8Array(buffer);


    for (let i = 0; i < bytes.length; i++) {
        binary +=
            String.fromCharCode(bytes[i]);
    }


    return btoa(binary);
}



function loadPhoto(event) {
    let file =
        event.target.files[0];

    if (!file)
        return;


    let reader =
        new FileReader();


    reader.onload = function (e) {
        let img = new Image();

        img.onload = function () {
            processImage(img);
        };

        img.src = e.target.result;
    };


    reader.readAsDataURL(file);
}



function processImage(img) {
    let canvas =
        document.getElementById("preview");


    canvas.width = WIDTH;
    canvas.height = HEIGHT;


    let ctx =
        canvas.getContext("2d");


    ctx.fillStyle = "black";
    ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
    );


    let scale =
        Math.max(
            WIDTH / img.width,
            HEIGHT / img.height
        );


    let w =
        img.width * scale;

    let h =
        img.height * scale;


    ctx.drawImage(
        img,
        (WIDTH - w) / 2,
        (HEIGHT - h) / 2,
        w,
        h
    );


    let data =
        ctx.getImageData(
            0,
            0,
            WIDTH,
            HEIGHT
        );


    imageBytes =
        convertToPebble(data);
}



function convertToPebble(image) {
    let out =
        new Uint8Array(
            WIDTH * HEIGHT
        );


    let p = image.data;


    for (let i = 0; i < out.length; i++) {
        out[i] =
            findClosestColorIndex(
                p[i * 4],
                p[i * 4 + 1],
                p[i * 4 + 2]
            );
    }


    return out;
}



function findClosestColorIndex(r, g, b) {
    let best = 0;
    let min = Infinity;


    for (let i = 0; i < PEBBLE_PALETTE.length; i++) {
        let c = PEBBLE_PALETTE[i];


        let d =
            (r - c.r) * (r - c.r) +
            (g - c.g) * (g - c.g) +
            (b - c.b) * (b - c.b);


        if (d < min) {
            min = d;
            best = i;
        }
    }


    return best;
}