document.getElementById("imageInput").addEventListener("change", function(event) {
    let file = event.target.files[0];
    let img = document.getElementById("uploadedImage");

    img.src = URL.createObjectURL(file);
    img.classList.remove("d-none");

    img.onload = function() {
        const colorThief = new ColorThief();
        let colors = colorThief.getPalette(img, 4); // extract 4 colors

        generateDesigns(colors);
    };
});


function generateDesigns(colors) {
    const row = document.getElementById("designsRow");
    row.innerHTML = "";

    // Plain design
    row.innerHTML += createPlain(colors[0]);

    // Floral pattern
    row.innerHTML += createFloral(colors[1]);

    // Gradient
    row.innerHTML += createGradient(colors[0], colors[2]);

    // Dots
    row.innerHTML += createDots(colors[3]);
}

function createPlain(color) {
    return `
        <div class="col-md-3 text-center">
            <div class="frock-box" style="background: rgb(${color});"></div>
            <p>Plain Design</p>
        </div>
    `;
}

function createFloral(color) {
    return `
        <div class="col-md-3 text-center">
            <div class="frock-box"
             style="background: repeating-radial-gradient(circle,
             rgb(${color}) 0, rgb(${color}) 10px,
             white 10px, white 20px);"></div>
            <p>Floral Pattern</p>
        </div>
    `;
}

function createGradient(c1, c2) {
    return `
        <div class="col-md-3 text-center">
            <div class="frock-box"
             style="background: linear-gradient(45deg, rgb(${c1}), rgb(${c2}));"></div>
            <p>Gradient Design</p>
        </div>
    `;
}

function createDots(color) {
    return `
        <div class="col-md-3 text-center">
            <div class="frock-box"
             style="
                background:
                radial-gradient(rgb(${color}) 10%, transparent 11%),
                radial-gradient(rgb(${color}) 10%, transparent 11%);
                background-size: 30px 30px;
                background-position: 0 0, 15px 15px;
             "></div>
            <p>Dotted Pattern</p>
        </div>
    `;
}
