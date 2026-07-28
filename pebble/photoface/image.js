const WIDTH = 144;
const HEIGHT = 168;

let imageBytes = null;


// Pebble 64-color palette
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



// Load image
document
.getElementById("photoPicker")
.addEventListener(
    "change",
    loadPhoto
);



// Send image back to PebbleKit JS
document
.getElementById("send")
.onclick = function()
{

    if(!imageBytes)
    {
        alert("Select an image first");
        return;
    }


    console.log(
        "Sending bytes:",
        imageBytes.length
    );


    let settings =
    {
        image:
            Array.from(imageBytes)
    };


    document.location =
        "pebblejs://close#" +
        encodeURIComponent(
            JSON.stringify(settings)
        );
};




// Load selected photo
function loadPhoto(event)
{

    let file =
        event.target.files[0];


    if(!file)
        return;


    let reader =
        new FileReader();


    reader.onload =
    function(e)
    {

        let img =
            new Image();


        img.onload =
        function()
        {
            processImage(img);
        };


        img.src =
            e.target.result;
    };


    reader.readAsDataURL(file);
}




function processImage(img)
{

    const canvas =
        document.getElementById("preview");


    canvas.width = WIDTH;
    canvas.height = HEIGHT;


    const ctx =
        canvas.getContext("2d");


    ctx.fillStyle =
        "black";


    ctx.fillRect(
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


    const drawWidth =
        img.width * scale;


    const drawHeight =
        img.height * scale;


    const x =
        (WIDTH - drawWidth) / 2;


    const y =
        (HEIGHT - drawHeight) / 2;



    ctx.drawImage(
        img,
        x,
        y,
        drawWidth,
        drawHeight
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
        "Converted bytes:",
        imageBytes.length
    );
}




function colorDistance(a,b)
{

    let dr =
        a.r-b.r;

    let dg =
        a.g-b.g;

    let db =
        a.b-b.b;


    return (
        dr*dr +
        dg*dg +
        db*db
    );
}




function findClosestColorIndex(r,g,b)
{

    let best =
        0;


    let distance =
        Infinity;



    for(
        let i=0;
        i<PEBBLE_PALETTE.length;
        i++
    )
    {

        let d =
            colorDistance(
                {
                    r:r,
                    g:g,
                    b:b
                },
                PEBBLE_PALETTE[i]
            );


        if(d < distance)
        {
            distance = d;
            best = i;
        }
    }


    return best;
}





function convertToPebble(image)
{

    let pixels =
        image.data;


    let output =
        new Uint8Array(
            WIDTH * HEIGHT
        );


    let index =
        0;



    for(
        let i=0;
        i<pixels.length;
        i+=4
    )
    {

        output[index++] =
            findClosestColorIndex(
                pixels[i],
                pixels[i+1],
                pixels[i+2]
            );
    }



    return output;
}