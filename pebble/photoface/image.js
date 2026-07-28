const WIDTH = 144;
const HEIGHT = 168;

let imageBytes = null;


document
.getElementById("photoPicker")
.addEventListener(
    "change",
    loadPhoto
);


function loadPhoto(event)
{
    const file =
        event.target.files[0];


    if(!file)
        return;


    const reader =
        new FileReader();


    reader.onload = function(e)
    {
        const img =
            new Image();


        img.onload = function()
        {
            processImage(img);
        };


        img.src =
            e.target.result;
    };


    reader.readAsDataURL(file);
}

document
.getElementById("send")
.onclick=function()
{
    if(!imageBytes)
    {
        alert(
            "Select an image first"
        );

        return;
    }


    let encoded =
        JSON.stringify(
            Array.from(imageBytes)
        );


    document.location =
        "pebblejs://close#" +
        encodeURIComponent(
            encoded
        );
};

function processImage(img)
{
    const canvas =
        document.getElementById(
            "preview"
        );


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

function reduceColor(value)
{
    if(value < 43)
        return 0;

    if(value < 128)
        return 85;

    if(value < 213)
        return 170;

    return 255;
}

function convertToPebble(image)
{
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
        let r =
            reduceColor(
                pixels[i]
            );

        let g =
            reduceColor(
                pixels[i+1]
            );

        let b =
            reduceColor(
                pixels[i+2]
            );


        output[offset++] =
            packPixel(
                r,
                g,
                b
            );
    }


    return output;
}

function channel(value)
{
    if(value === 0)
        return 0;

    if(value === 85)
        return 1;

    if(value === 170)
        return 2;

    return 3;
}


function packPixel(r,g,b)
{
    return (
        (channel(r) << 4) |
        (channel(g) << 2) |
        channel(b)
    );
}