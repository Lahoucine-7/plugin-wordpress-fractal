document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('mandelbrot-canvas');
    const ctx = canvas.getContext('2d');
    const colorStartInput = document.getElementById('colorStart');
    const colorEndInput = document.getElementById('colorEnd');
    const multicolorCheckbox = document.getElementById('multicolor');
    const fractalTypeSelect = document.getElementById('fractalType');
    const resetButton = document.getElementById('reset-button');
    const loadingMessage = document.getElementById('loading-message');
    const autoZoomButton = document.getElementById('auto-zoom-button');
    const customControls = document.getElementById('custom-controls');
    const zValueInput = document.getElementById('zValue');
    const cValueInput = document.getElementById('cValue');
    let zooming = false;
    let zoomLevel = 1;
    let offsetX = 0;
    let offsetY = 0;
    let targetX = 0;
    let targetY = 0;
    const baseIterations = 250;
    let maxIterations = baseIterations;
    let zoomCount = 0;
    const zoomFactor = 1.05;
    let imgData = ctx.createImageData(canvas.width, canvas.height);
    let palette = [];
    let touchTimeout;

    colorStartInput.addEventListener('input', updatePalette);
    colorEndInput.addEventListener('input', updatePalette);
    multicolorCheckbox.addEventListener('change', updatePalette);
    fractalTypeSelect.addEventListener('change', handleFractalTypeChange);
    resetButton.addEventListener('click', resetFractal);
    autoZoomButton.addEventListener('click', () => {
        zooming = true;
        autoZoom();
    });

    function handleFractalTypeChange() {
        if (fractalTypeSelect.value === 'custom') {
            customControls.style.display = 'block';
        } else {
            customControls.style.display = 'none';
        }
        updatePalette();
    }

    function updatePalette() {
        if (!multicolorCheckbox.checked) {
            palette = createColorPalette(maxIterations, colorStartInput.value, colorEndInput.value);
        } else {
            palette = createMulticolorPalette(maxIterations);
        }
        drawFractal();
    }

    function createColorPalette(size, startColor, endColor) {
        const start = hexToRgb(startColor);
        const end = hexToRgb(endColor);
        const colors = [];
        for (let i = 0; i < size; i++) {
            const r = lerp(start.r, end.r, i / size);
            const g = lerp(start.g, end.g, i / size);
            const b = lerp(start.b, end.b, i / size);
            colors.push({ r: r, g: g, b: b });
        }
        return colors;
    }

    function createMulticolorPalette(size) {
        const numColors = Math.min(7, Math.floor(Math.random() * 4) + 4); // 4 to 7 colors
        const randomColors = [];
        for (let i = 0; i < numColors; i++) {
            randomColors.push({
                r: Math.floor(Math.random() * 256),
                g: Math.floor(Math.random() * 256),
                b: Math.floor(Math.random() * 256)
            });
        }

        const colors = [];
        const segmentSize = Math.floor(size / numColors);
        for (let i = 0; i < numColors; i++) {
            const startColor = randomColors[i];
            const endColor = randomColors[(i + 1) % numColors];
            for (let j = 0; j < segmentSize; j++) {
                const t = j / segmentSize;
                const r = lerp(startColor.r, endColor.r, t);
                const g = lerp(startColor.g, endColor.g, t);
                const b = lerp(startColor.b, endColor.b, t);
                colors.push({ r: Math.floor(r), g: Math.floor(g), b: Math.floor(b) });
            }
        }
        return colors;
    }

    function hsvToRgb(h, s, v) {
        let r, g, b;
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return { r, g, b };
    }

    function mandelbrot(c, maxIterations) {
        let z = { x: 0, y: 0 };
        let n = 0;
        const escapeRadius = 4;
        while (n < maxIterations && z.x * z.x + z.y * z.y <= escapeRadius) {
            const xTemp = z.x * z.x - z.y * z.y + c.x;
            z.y = 2 * z.x * z.y + c.y;
            z.x = xTemp;
            n++;
        }
        if (n === maxIterations) {
            return maxIterations;
        }
        const zn = Math.sqrt(z.x * z.x + z.y * z.y);
        const nu = Math.log(Math.log(zn) / Math.log(2)) / Math.log(2);
        return n + 1 - nu;
    }

    function julia(c, maxIterations) {
        let z = { x: c.x, y: c.y };
        const k = { x: -0.7, y: 0.27015 };
        let n = 0;
        const escapeRadius = 4;
        while (n < maxIterations && z.x * z.x + z.y * z.y <= escapeRadius) {
            const xTemp = z.x * z.x - z.y * z.y + k.x;
            z.y = 2 * z.x * z.y + k.y;
            z.x = xTemp;
            n++;
        }
        if (n === maxIterations) {
            return maxIterations;
        }
        const zn = Math.sqrt(z.x * z.x + z.y * z.y);
        const nu = Math.log(Math.log(zn) / Math.log(2)) / Math.log(2);
        return n + 1 - nu;
    }

    function customFractal(c, maxIterations, zValue, cValue) {
        let z = { x: zValue.x, y: zValue.y };
        const k = { x: cValue.x, y: cValue.y };
        let n = 0;
        const escapeRadius = 4;
        while (n < maxIterations && z.x * z.x + z.y * z.y <= escapeRadius) {
            const xTemp = z.x * z.x - z.y * z.y + k.x;
            z.y = 2 * z.x * z.y + k.y;
            z.x = xTemp;
            n++;
        }
        if (n === maxIterations) {
            return maxIterations;
        }
        const zn = Math.sqrt(z.x * z.x + z.y * z.y);
        const nu = Math.log(Math.log(zn) / Math.log(2)) / Math.log(2);
        return n + 1 - nu;
    }

    function drawFractal() {
        const data = imgData.data;
        const fractalType = fractalTypeSelect.value;
        const zValue = { x: parseFloat(zValueInput.value.split(',')[0]) || 0, y: parseFloat(zValueInput.value.split(',')[1]) || 0 };
        const cValue = { x: parseFloat(cValueInput.value.split(',')[0]) || -0.7, y: parseFloat(cValueInput.value.split(',')[1]) || 0.27015 };

        for (let x = 0; x < canvas.width; x++) {
            for (let y = 0; y < canvas.height; y++) {
                const c = {
                    x: (x - canvas.width / 2) / (200 * zoomLevel) + offsetX,
                    y: (y - canvas.height / 2) / (200 * zoomLevel) + offsetY
                };
                let n;
                if (fractalType === 'mandelbrot') {
                    n = mandelbrot(c, maxIterations);
                } else if (fractalType === 'julia') {
                    n = julia(c, maxIterations);
                } else if (fractalType === 'custom') {
                    n = customFractal(c, maxIterations, zValue, cValue);
                } else {
                    n = mandelbrot(c, maxIterations); // Default to Mandelbrot for custom option
                }
                const i = (x + y * canvas.width) * 4;
                if (n === maxIterations) {
                    data[i] = 0;
                    data[i + 1] = 0;
                    data[i + 2] = 0;
                } else {
                    const colorIndex = Math.floor(n) % palette.length;
                    const color = palette[colorIndex];
                    data[i] = color.r;
                    data[i + 1] = color.g;
                    data[i + 2] = color.b;
                }
                data[i + 3] = 255;
            }
        }

        ctx.putImageData(imgData, 0, 0);
        loadingMessage.style.display = 'none';
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.substring(1), 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function autoZoom() {
        if (zooming) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(zoomFactor, zoomFactor);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);
            ctx.translate((canvas.width / 2 - targetX) / zoomLevel, (canvas.height / 2 - targetY) / zoomLevel);
            ctx.drawImage(canvas, 0, 0);
            ctx.restore();
            zoomLevel *= zoomFactor;

            // Increment the zoom count
            zoomCount++;

            // Dynamically increase max iterations based on zoom level
            maxIterations = baseIterations + Math.floor(Math.log(zoomLevel) / Math.log(2)) * 10;

            drawFractal();
            requestAnimationFrame(autoZoom);
        }
    }

    function resetFractal() {
        zooming = false;
        zoomLevel = 1;
        offsetX = 0;
        offsetY = 0;
        maxIterations = baseIterations;
        zoomCount = 0;
        if (multicolorCheckbox.checked) {
            palette = createMulticolorPalette(maxIterations);
        } else {
            palette = createColorPalette(maxIterations, colorStartInput.value, colorEndInput.value);
        }
        drawFractal();
    }

    function getCursorPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        targetX = x;
        targetY = y;
        offsetX = (x - canvas.width / 2) / (200 * zoomLevel) + offsetX;
        offsetY = (y - canvas.height / 2) / (200 * zoomLevel) + offsetY;
    }

    function handleTouch(event) {
        event.preventDefault(); // Prevent scrolling
        const touch = event.touches[0];
        getCursorPosition(canvas, touch);
        touchTimeout = setTimeout(() => {
            zooming = true;
            autoZoom();
        }, 500); // Start zooming after 500ms for a long press
    }

    function handleTouchEnd(event) {
        event.preventDefault(); // Prevent scrolling
        clearTimeout(touchTimeout);
        zooming = false;
        drawFractal();
    }

    function handleTouchCancel(event) {
        event.preventDefault(); // Prevent scrolling
        clearTimeout(touchTimeout);
        zooming = false;
    }

    canvas.addEventListener('mousedown', (event) => {
        getCursorPosition(canvas, event);
        zooming = true;
        autoZoom();
    });

    canvas.addEventListener('mouseup', () => {
        zooming = false;
        drawFractal();
    });

    canvas.addEventListener('touchstart', handleTouch, false);
    canvas.addEventListener('touchend', handleTouchEnd, false);
    canvas.addEventListener('touchcancel', handleTouchCancel, false);

    resetFractal();
});
