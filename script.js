let selectedShape = null;
let savedPalette = null;
let savedPercentages = null;

document.querySelectorAll(".shape").forEach(shape => {
    shape.addEventListener("click", function() {

        document.querySelectorAll(".shape").forEach(s => s.classList.remove("selected"));
        this.classList.add("selected");

        selectedShape = this.getAttribute("data-shape");

        applyColorsToFrock();
    });
});

document.getElementById("imageInput").addEventListener("change", function(e) {
    let file = e.target.files[0];
    let img = document.getElementById("uploadedImage");
    img.src = URL.createObjectURL(file);

    img.onload = function () {
        const colorThief = new ColorThief();
        let palette = colorThief.getPalette(img, 4);

        savedPalette = palette;
        calculateColorPercentages(img, palette);
    };
});

function calculateColorPercentages(img, palette) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    let counts = Array(palette.length).fill(0);
    let totalPixels = data.length / 4;

    for (let i = 0; i < data.length; i += 4) {
        let r = data[i], g = data[i+1], b = data[i+2];
        let closest = findClosestColor([r, g, b], palette);
        counts[closest]++;
    }

    let percentages = counts.map(c => Math.round((c / totalPixels) * 100));

    savedPercentages = percentages;

    applyColorsToFrock();
}

function findClosestColor(pixel, palette) {
    let closest = 0;
    let minDist = Infinity;

    palette.forEach((color, i) => {
        let dist = Math.sqrt(
            (pixel[0]-color[0])**2 +
            (pixel[1]-color[1])**2 +
            (pixel[2]-color[2])**2
        );
        if (dist < minDist) { minDist = dist; closest = i; }
    });

    return closest;
}

function applyColorsToFrock() {
    if (!selectedShape || !savedPalette || !savedPercentages) return;

    let maskImg = `frock${selectedShape}.png`;

    let gradient = "linear-gradient(to bottom,";
    let current = 0;

    for (let i = 0; i < savedPalette.length; i++) {
        let next = current + savedPercentages[i];
        gradient += `rgb(${savedPalette[i]}) ${current}% ${next}%,`;
        current = next;
    }

    gradient = gradient.slice(0, -1) + ")";

    let output = document.getElementById("frockOutput");

    output.style.background = gradient;

    output.style.maskImage = `url(${maskImg})`;
    output.style.webkitMaskImage = `url(${maskImg})`;
}
