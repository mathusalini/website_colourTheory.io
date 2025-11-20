let selectedShape = null;

document.querySelectorAll(".shape-box").forEach(box => {

    box.addEventListener("click", function () {

        // remove highlight from all
        document.querySelectorAll(".shape-box")
            .forEach(b => b.classList.remove("selected"));

        // highlight this one
        this.classList.add("selected");

        // remember selected shape
        selectedShape = this.getAttribute("data-shape");

        // apply mask (shape) immediately
        applyFrockMask();
    });

});

function applyFrockMask() {
    if (!selectedShape) return;

    let output = document.getElementById("frockOutput");

    output.style.maskImage = `url(frock${selectedShape}.png)`;
    output.style.webkitMaskImage = `url(frock${selectedShape}.png)`;
}
