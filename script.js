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
    base: "assets/Empire.png",           // plain outline
    mask: "assets/colouredEmpire.png"    // transparent pattern image
  },
  aline: {
    label: "A-line",
    base: "assets/Aline.png",
    mask: null                           // set later if you have
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
      // Get 5 main colours
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

  // If we have a special coloured mask for this design (like Empire)
  if (design.mask) {
    generateWithMask(design.mask);
  } else {
    // Simple solid-fill version using base silhouette
    generateSimpleColour(design.base);
  }
});

function generateWithMask(maskPath) {
  const maskImg = new Image();
  maskImg.src = maskPath;

  maskImg.onload = () => {
    outputCanvas.width = maskImg.width;
    outputCanvas.height = maskImg.height;

    // Draw the mask image first (transparent PNG)
    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    ctx.drawImage(maskImg, 0, 0);

    // Use a gradient made from the palette
    const grad = ctx.createLinearGradient(0, 0, outputCanvas.width, 0);
    palette.forEach((c, i) => {
      const stop = i / (palette.length - 1 || 1);
      grad.addColorStop(stop, `rgb(${c[0]}, ${c[1]}, ${c[2]})`);
    });

    // Keep only the parts where the mask has pixels
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Reset blend mode
    ctx.globalCompositeOperation = "source-over";
  };
}

function generateSimpleColour(basePath) {
  const baseImg = new Image();
  baseImg.src = basePath;

  baseImg.onload = () => {
    outputCanvas.width = baseImg.width;
    outputCanvas.height = baseImg.height;

    const main = palette[0];

    ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Fill canvas with main colour
    ctx.fillStyle = `rgb(${main[0]}, ${main[1]}, ${main[2]})`;
    ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

    // Use the silhouette as a mask
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(baseImg, 0, 0);

    ctx.globalCompositeOperation = "source-over";
  };
}
