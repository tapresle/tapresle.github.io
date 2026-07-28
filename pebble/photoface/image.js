const WIDTH = 144;
const HEIGHT = 168;

let imageBytes = null;


// 64-color Pebble palette
const PEBBLE_PALETTE = [
    {r:0,g:0,b:0},
    {r:0,g:0,b:85},
    {r:0,g:0,b:170},
    {r:85,g:0,b:0},
    {r:0,g:0,b:255},
    {r:85,g:0,b:85},
    {r:85,g:0,b:170},
    {r:0,g:85,b:0},
    {r:170,g:0,b:85},
    {r:0,g:85,b:170},
    {r:170,g:0,b:170},
    {r:85,g:85,b:0},
    {r:255,g:0,b:0},
    {r:0,g:85,b:255},
    {r:170,g:0,b:255},
    {r:85,g:85,b:85},
    {r:0,g:170,b:0},
    {r:170,g:85,b:0},
    {r:85,g:85,b:255},
    {r:255,g:0,b:255},
    {r:0,g:170,b:85},
    {r:170,g:85,b:85},
    {r:0,g:170,b:170},
    {r:170,g:85,b:170},
    {r:170,g:85,b:255},
    {r:85,g:170,b:85},
    {r:255,g:85,b:85},
    {r:85,g:170,b:170},
    {r:255,g:85,b:170},
    {r:0,g:255,b:0},
    {r:170,g:170,b:0},
    {r:85,g:170,b:255},
    {r:0,g:255,b:170},
    {r:170,g:170,b:170},
    {r:85,g:255,b:0},
    {r:255,g:170,b:0},
    {r:0,g:255,b:255},
    {r:170,g:170,b:255},
    {r:85,g:255,b:85},
    {r:255,g:170,b:85},
    {r:85,g:255,b:255},
    {r:255,g:170,b:255},
    {r:170,g:255,b:85},
    {r:170,g:255,b:170},
    {r:255,g:255,b:0},
    {r:170,g:255,b:255},
    {r:255,g:255,b:85},
    {r:255,g:255,b:170},
    {r:170,g:255,b:0},
    {r:170,g:170,b:85},
    {r:255,g:255,b:255},
    {r:85,g:255,b:170},
    {r:255,g:85,b:255},
    {r:85,g:170,b:0},
    {r:255,g:0,b:85},
    {r:170,g:0,b:0},
    {r:0,g:170,b:255},
    {r:255,g:0,b:170},
    {r:0,g:85,b:85},
    {r:255,g:170,b:170},
    {r:0,g:255,b:85},
    {r:255,g:85,b:0},
    {r:85,g:85,b:170},
    {r:85,g:0,b:255}
];


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


        console.log(
            "Sending bytes:",
            imageBytes.length
        );


        console.log(
            "First bytes:",
            Array.from(imageBytes.slice(0,20))
        );


        let encoded =
            JSON.stringify(
                Array.from(imageBytes)
            );


        document.location =
            "pebblejs://close#" +
            encodeURIComponent(encoded);
    };



function loadPhoto(event) {

    let file =
        event.target.files[0];


    if (!file)
        return;


    let reader =
        new FileReader();


    reader.onload = function(e) {

        let img =
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


    // Crop-to-fill
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


    let data =
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



function colorDistance(a, b) {

    let dr =
        a.r - b.r;

    let dg =
        a.g - b.g;

    let db =
        a.b - b.b;


    return (
        dr * dr +
        dg * dg +
        db * db
    );
}



function findClosestColorIndex(r, g, b) {

    let minDiv =
        Infinity;


    let matchIndex =
        0;


    const target =
        {
            r:r,
            g:g,
            b:b
        };


    for(
        let i = 0;
        i < PEBBLE_PALETTE.length;
        i++
    )
    {
        let div =
            colorDistance(
                target,
                PEBBLE_PALETTE[i]
            );


        if(div < minDiv)
        {
            minDiv = div;
            matchIndex = i;
        }
    }


    return matchIndex;
}



function convertToPebble(image) {

    let pixels =
        image.data;


    let output =
        new Uint8Array(
            WIDTH * HEIGHT
        );


    let offset = 0;


    for(
        let i = 0;
        i < pixels.length;
        i += 4
    )
    {
        output[offset++] =
            findClosestColorIndex(
                pixels[i],
                pixels[i + 1],
                pixels[i + 2]
            );
    }


    return output;
}