const WIDTH = 144;
const HEIGHT = 168;

let imageBytes = null;


document
.getElementById("send")
.onclick = function()
{
    if(!imageBytes)
    {
        alert("No image");
        return;
    }


    let encoded =
        JSON.stringify(
            Array.from(imageBytes)
        );


    document.location =
        "pebblejs://close#" +
        encodeURIComponent(encoded);
};



function processImage(img)
{
    imageBytes =
        createTestImage();


    console.log(
        "Test image bytes:",
        imageBytes.length
    );
}



function createTestImage()
{
    let output =
        new Uint8Array(
            WIDTH * HEIGHT);


    for(let y = 0; y < HEIGHT; y++)
    {
        for(let x = 0; x < WIDTH; x++)
        {
            let index =
                (y * WIDTH) + x;


            // White background
            output[index] = 0xFF;


            // Red square top left
            if(x < 30 && y < 30)
            {
                output[index] = 0xE0;
            }
        }
    }


    return output;
}