// ---------- GLOBALS ----------
let palette = [];
let currentDesignKey = null;

const previewImg = document.getElementById("previewImg");
const colorBatteries = document.getElementById("colorBatteries");
const designPreview = document.getElementById("designPreview");
const designName = document.getElementById("designName");
const outputCanvas = document.getElementById("outputCanvas");
const ctx = outputCanvas.getContext("2d");

// Map dress designs to image files in your repo
const DESIGNS = {
  empire: {
    label: "Empire",
    base: "assets/Empire.png",           
    mask: "assets/colouredEmpire.png"    
  },
  aline: {
    label: "A-line",
    base: "assets/Aline.png",
    mask: null                           
  },
  ballgown: {
    label: "Ball Gown",
    base: "assets/BallGown.png",
    mask: null
  },
  tealength: {
    label: "Tea length",
    base: "assets/TeaLength.png",
    mask: null
  }
};

// ---------- IMAGE UPLOAD & COLOR EXTRACT ----------
document.getElementById("themeUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  previewImg.src = URL.createObjectURL(file);
  previewImg.classList.remove("d-none");

  previewImg.onload = function () {
    const colorThief = new ColorThief();
    try {
      palette = colorThief.getPalette(previewImg, 5);
      showBatteries(palette);
    } catch (err) {
      console.error(err);
      alert("Unable to read colours. Try a different photo.");
    }
  };
});

function showBatteries(colors) {
  colorBatteries.innerHTML = "";
  colors.forEach((c, idx) => {
    const battery = document.createElement("div");
    battery.className = "battery";

    const fill = document.createElement("div");
    fill.className = "battery-level";
    fill.style.backgroundColor = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;

    battery.appendChild(fill);
    colorBatteries.appendChild(battery);
  });
}

// ---------- DESIGN SELECT ----------
const designButtons = document.querySelectorAll(".design-btn");

designButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    designButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const key = btn.getAttribute("data-design");
    currentDesignKey = key;
    const design = DESIGNS[key];

    designName.textContent = design.label;
    designPreview.src = design.base;
    designPreview.classList.remove("d-none");
  });
});

// ---------- OUTPUT GENERATION ----------
document.getElementById("generateBtn").addEventListener("click", () => {
  if (!palette.length) {
    alert("Please upload a colour theme photo first.");
    return;
  }
  if (!currentDesignKey) {
    alert("Please select a frock design.");
    return;
  }

  const design = DESIGNS[currentDesignKey];

  if (design.mask) {
    generateWithMask(design.mask);
  } else {
    generateSimpleColour(design.base);
  }
});

// ------------------------------------------------------------------
//                 NEW ✨ CREATIVE FASHION OUTPUT
// ------------------------------------------------------------------
function generateWithMask(maskPath) {
  const maskImg = new Image();
  maskImg.src = maskPath;

  maskImg.onload = () => {
    outputCanvas.width = maskImg.width;
    outputCanvas.height = maskImg.height;

    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    // TEMP CANVAS TO SEPARATE FLOWERS & DRESS
    const temp = document.createElement("canvas");
    const tctx = temp.getContext("2d");
    temp.width = maskImg.width;
    temp.height = maskImg.height;
    tctx.drawImage(maskImg, 0, 0);

    const data = tctx.getImageData(0, 0, temp.width, temp.height);
    const dress = tctx.createImageData(data);
    const flowers = tctx.createImageData(data);

    // SEPARATE PIXELS BY COLOR
    for (let i = 0; i < data.data.length; i += 4) {
      const r = data.data[i];
      const g = data.data[i + 1];
      const b = data.data[i + 2];
      const a = data.data[i + 3];

      if (a < 10) continue;

      // White = Flower shape
      if (r > 200 && g > 200 && b > 200) {
        flowers.data[i + 3] = 255; // keep alpha
      }
      // Dark = Dress silhouette
      else {
        dress.data[i + 3] = 255;
      }
    }

    // --------------------------
    // 1️⃣ DRAW DRESS GRADIENT
    // --------------------------
    ctx.putImageData(dress, 0, 0);

    const grad = ctx.createLinearGradient(0, 0, 0, outputCanvas.height);
    palette.forEach((c, i) => {
      grad.addColorStop(i / (palette.length - 1), `rgb(${c[0]},${c[1]},${c[2]})`);
    });

    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    ctx.globalCompositeOperation = "source-over";

    // --------------------------
    // 2️⃣ COLOR FLORAL SHAPES (WITH PALETTE)
    // --------------------------
    let flowerColored = tctx.createImageData(flowers);
    let colorIndex = 0;

    for (let i = 0; i < flowerColored.data.length; i += 4) {
      if (flowers.data[i + 3] > 10) {
        let col = palette[colorIndex % palette.length];
        flowerColored.data[i] = col[0];
        flowerColored.data[i + 1] = col[1];
        flowerColored.data[i + 2] = col[2];
        flowerColored.data[i + 3] = 255;

        colorIndex++;
      }
    }

    ctx.putImageData(flowerColored, 0, 0);

    ctx.globalCompositeOperation = "source-over";
  };
}

// ---------- SIMPLE SOLID COLOUR VERSION ----------
function generateSimpleColour(basePath) {
  const baseImg = new Image();
  baseImg.src = basePath;

  baseImg.onload = () => {
    outputCanvas.width = baseImg.width;
    outputCanvas.height = baseImg.height;

    const main = palette[0];

    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    ctx.fillStyle = `rgb(${main[0]}, ${main[1]}, ${main[2]})`;
    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(baseImg, 0, 0);

    ctx.globalCompositeOperation = "source-over";
  };
}
