document.addEventListener("DOMContentLoaded", () => {
  const pickBtn = document.getElementById("pickBtn");
  const previewBox = document.getElementById("previewBox");
  const colorBox = document.getElementById("colorBox");
  const hexCode = document.getElementById("hexCode");
  const paletteList = document.getElementById("paletteList");

  // Load saved colors from browser storage
  chrome.storage.local.get(["savedPalette"], (result) => {
    const palette = result.savedPalette || [];
    renderPalette(palette);
  });

  pickBtn.addEventListener("click", async () => {
    if (!window.EyeDropper) {
      alert("Your browser does not support the EyeDropper API.");
      return;
    }

    try {
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      const selectedColor = result.sRGBHex;

      // Update UI
      previewBox.style.display = "flex";
      colorBox.style.backgroundColor = selectedColor;
      hexCode.innerText = selectedColor;

      // Copy color automatically
      navigator.clipboard.writeText(selectedColor);

      // Save to palette
      chrome.storage.local.get(["savedPalette"], (data) => {
        let palette = data.savedPalette || [];
        if (!palette.includes(selectedColor)) {
          palette.unshift(selectedColor);
          if (palette.length > 10) palette.pop(); // Keep last 10
          chrome.storage.local.set({ savedPalette: palette });
          renderPalette(palette);
        }
      });
    } catch (e) {
      // User cancelled color picking
    }
  });

  function renderPalette(colors) {
    paletteList.innerHTML = "";
    colors.forEach((color) => {
      const div = document.createElement("div");
      div.className = "palette-item";
      div.style.backgroundColor = color;
      div.title = `Click to copy: ${color}`;
      div.addEventListener("click", () => {
        navigator.clipboard.writeText(color);
        alert(`Copied ${color} to clipboard!`);
      });
      paletteList.appendChild(div);
    });
  }
});