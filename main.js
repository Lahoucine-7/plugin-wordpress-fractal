// Main JavaScript file for fractal generation
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed');

    // DOM Elements
    const canvas = document.getElementById('fractalCanvas');
    const resetButton = document.getElementById('resetButton');
    const fractalTypeSelector = document.getElementById('fractalType');
    const zSlider = document.getElementById('zSlider');
    const cSlider = document.getElementById('cSlider');
    const zValueDisplay = document.getElementById('zValue');
    const cValueDisplay = document.getElementById('cValue');
    const colorButtons = document.querySelectorAll('.color-btn');
    const customColorBtn = document.getElementById('customColorBtn');
    const color1Slider = document.getElementById('color1Slider');
    const color2Slider = document.getElementById('color2Slider');
    const color1ValueDisplay = document.getElementById('color1Value');
    const color2ValueDisplay = document.getElementById('color2Value');
    
    // Variables
    let currentColorScheme = 0;
    let autoZooming = false;
    let zoomInterval;
    let zoomLevel = 1;
    let offsetX = 0;
    let offsetY = 0;
    const zoomFactor = 1.1;
    let isDragging = false;
    let dragStartX, dragStartY;
    let initialPinchDistance;
    let lastZoomLevel;
    let maxIterations = 77;

    // Color palettes
    const palettes = {
        cherryRed: { start: [60 / 255, 0, 0], mid: [1, 1, 1], end: [153 / 255, 0, 17 / 255] },
        babyBlue: { start: [138 / 255, 170 / 255, 229 / 255], mid: [255 / 255, 255 / 255, 255 / 255], end: [138 / 255, 170 / 255, 229 / 255] },
        darkBlue: { start: [0, 0, 36 / 255], mid: [1, 1, 1], end: [0, 36 / 255, 107 / 255] },
        skyBlue: { start: [234 / 255, 115 / 255, 141 / 255], mid: [1, 1, 1], end: [137 / 255, 171 / 255, 227 / 255] }, // Sky Blue to Bubblegum Pink
        forestGreen: { start: [0, 36 / 255, 0], mid: [1, 1, 1], end: [44 / 255, 95 / 255, 45 / 255] },
        midnightBlue: { start: [30 / 255, 39 / 255, 97 / 255], mid: [64 / 255, 142 / 255, 198 / 255], end: [122 / 255, 32 / 255, 72 / 255] },
        pastelOliveGreen: { start: [161 / 255, 190 / 255, 149 / 255], mid: [1, 1, 1], end: [249 / 255, 136 / 255, 102 / 255] }
    };

    // WebGL Context Initialization
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    const gl = canvas.getContext('webgl', { antialias: true });
    if (!gl) {
        console.error('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }
    if (!gl) {
        alert('Your browser does not support WebGL');
        return;
    }
    console.log('WebGL context:', gl);

    // Shader sources
    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;
    const fragmentShaderSource = `
    #extension GL_OES_standard_derivatives : enable
    #extension GL_EXT_frag_depth : enable

    precision highp float;
    precision highp int;

    uniform vec2 u_resolution;
    uniform int u_fractalType;
    uniform vec2 u_customParams;
    uniform int u_colorScheme;
    uniform vec3 u_colorStart;
    uniform vec3 u_colorMid;
    uniform vec3 u_colorEnd;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    uniform float u_zoom;
    uniform vec2 u_offset;
    uniform int u_maxIter;

    void main() {
        vec2 c = (gl_FragCoord.xy / u_resolution - 0.5) * 3.0 / u_zoom + u_offset;
        vec2 z = c;
        int iter = 0;
        float hue = 0.0;
        vec3 color;

        int maxIter = u_maxIter;
        if (u_fractalType == 0) {
            for (int i = 0; i < 100000; i++) {  // Limite maximale d'itérations
                if (i >= maxIter || dot(z, z) > 4.0) break;
                z = vec2(z.x * z.x - z.y * z.y + c.x, 2.0 * z.x * z.y + c.y);
                iter++;
            }
        } else if (u_fractalType == 1) {
            vec2 k = vec2(0.355, 0.355);
            for (int i = 0; i < 20000; i++) {  // Limite maximale d'itérations
                if (i >= maxIter * 2 || dot(z, z) > 4.0) break;
                z = vec2(z.x * z.x - z.y * z.y + k.x, 2.0 * z.x * z.y + k.y);
                iter++;
            }
        } else if (u_fractalType == 2) {
            for (int i = 0; i < 10000; i++) {  // Limite maximale d'itérations
                if (i >= maxIter || dot(z, z) > 4.0) break;
                z = vec2(z.x * z.x - z.y * z.y + c.x, 2.0 * abs(z.x * z.y) + c.y);
                iter++;
            }
        } else if (u_fractalType == 3) {
            for (int i = 0; i < 30000; i++) {  // Limite maximale d'itérations
                if (i >= maxIter * 3 || dot(z, z) > 4.0) break;
                z = vec2(z.x * z.x - z.y * z.y + 0.5 * cos(3.0 * z.x), 2.0 * z.x * z.y + 0.5 * sin(3.0 * z.y));
                iter++;
            }
        } else if (u_fractalType == 4) {
            vec2 k = u_customParams;
            for (int i = 0; i < 10000; i++) {  // Limite maximale d'itérations
                if (i >= maxIter || dot(z, z) > 4.0) break;
                z = vec2(z.x * z.x - z.y * z.y + k.x, 2.0 * z.x * z.y + k.y);
                iter++;
            }
        }

        hue = float(iter) / float(maxIter);
        if (iter == maxIter) {
            color = vec3(0.0, 0.0, 0.0);
        } else {
            if (u_colorScheme < 7) {
                if (hue < 0.5) {
                    color = mix(u_colorStart, u_colorMid, hue * 2.0);
                } else {
                    color = mix(u_colorMid, u_colorEnd, (hue - 0.5) * 2.0);
                }
            } else {
                if (hue < 0.5) {
                    color = mix(u_color1, u_color3, hue * 2.0); // Utiliser u_color3 comme mid pour les couleurs personnalisées
                } else {
                    color = mix(u_color3, u_color2, (hue - 0.5) * 2.0);
                }
            }
        }
        gl_FragColor = vec4(color, 1.0);
    }
    `;

    // Create and compile shaders
    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader;
        }
        console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    function createProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        console.error('Program linking failed:', gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    // Create and compile shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
        console.error('Failed to create shaders');
        return;
    }

    // Create and link program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
        console.error('Failed to create program');
        return;
    }

    gl.useProgram(program);

    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const fractalTypeLocation = gl.getUniformLocation(program, 'u_fractalType');
    const customParamsLocation = gl.getUniformLocation(program, 'u_customParams');
    const colorSchemeLocation = gl.getUniformLocation(program, 'u_colorScheme');
    const color1Location = gl.getUniformLocation(program, 'u_color1');
    const color2Location = gl.getUniformLocation(program, 'u_color2');
    const colorStartLocation = gl.getUniformLocation(program, 'u_colorStart');
    const colorMidLocation = gl.getUniformLocation(program, 'u_colorMid');
    const colorEndLocation = gl.getUniformLocation(program, 'u_colorEnd');
    const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
    const offsetLocation = gl.getUniformLocation(program, 'u_offset');
    const color3Location = gl.getUniformLocation(program, 'u_color3');

    // Buffer setup
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1, -1,
         1, -1,
        -1,  1,
         1,  1,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Setup smoothing canvas
    const smoothingCanvas = document.createElement('canvas');
    const smoothingCtx = smoothingCanvas.getContext('2d');

    // Modal initialization
    const modal = document.getElementById('modal');
    const modalOkButton = document.getElementById('modal-ok-button');

    modal.style.display = 'block';

    modalOkButton.addEventListener('click', () => {
        modal.style.display = 'none';
        drawFractal();
    });

    /**
     * Interpolates the colors in the given palette.
     * @param {Object} palette - The color palette.
     * @param {number} t - The interpolation factor (0 to 1).
     * @returns {Array} - The interpolated color.
     */
    function interpolateColor(palette, t) {
        const { start, end, mid } = palette;
        if (mid) {
            if (t < 0.5) {
                t *= 2;
                return [
                    start[0] * (1 - t) + mid[0] * t,
                    start[1] * (1 - t) + mid[1] * t,
                    start[2] * (1 - t) + mid[2] * t,
                ];
            } else {
                t = (t - 0.5) * 2;
                return [
                    mid[0] * (1 - t) + end[0] * t,
                    mid[1] * (1 - t) + end[1] * t,
                    mid[2] * (1 - t) + end[2] * t,
                ];
            }
        }
        return [
            start[0] * (1 - t) + end[0] * t,
            start[1] * (1 - t) + end[1] * t,
            start[2] * (1 - t) + end[2] * t,
        ];
    }

    /**
     * Calculates the number of iterations based on the zoom level.
     * @param {number} zoomLevel - The current zoom level.
     * @returns {number} - The number of iterations.
     */
    function calculateIterations(zoomLevel) {
        return maxIterations;
    }

    /**
     * Applies the selected color scheme to the WebGL context.
     * @param {WebGLRenderingContext} gl - The WebGL rendering context.
     * @param {Object} palette - The color palette to apply.
     */
    function applyColorScheme(gl, palette) {
        if (palette) {
            const { start, mid, end } = palette;
            gl.uniform3fv(colorStartLocation, start);
            gl.uniform3fv(colorMidLocation, mid);
            gl.uniform3fv(colorEndLocation, end);
        } else {
            console.error('Palette not found');
        }
    }

    /**
     * Calculates the fractal coordinates based on the zoom level and offset.
     * @param {number} zoomLevel - The current zoom level.
     * @param {number} offsetX - The horizontal offset.
     * @param {number} offsetY - The vertical offset.
     * @param {number} canvasWidth - The width of the canvas.
     * @param {number} canvasHeight - The height of the canvas.
     * @returns {Object} - An object containing the calculated xScale, yScale, xOffset, and yOffset.
     */
    function calculateFractalCoordinates(zoomLevel, offsetX, offsetY, canvasWidth, canvasHeight) {
        const xScale = 3.0 / zoomLevel;
        const yScale = 3.0 / zoomLevel;
        const xOffset = offsetX - 0.5 * xScale * canvasWidth;
        const yOffset = offsetY - 0.5 * yScale * canvasHeight;

        return { xScale, yScale, xOffset, yOffset };
    }

    /**
     * Draws the fractal on the canvas.
     */
    async function drawFractal() {
        const { xScale, yScale, xOffset, yOffset } = calculateFractalCoordinates(zoomLevel, offsetX, offsetY, gl.canvas.width, gl.canvas.height);

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(1.0, 1.0, 1.0, 1.0); // Set clear color to white
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);
        gl.uniform1i(fractalTypeLocation, parseInt(fractalTypeSelector.value));
        gl.uniform1i(colorSchemeLocation, currentColorScheme);
        gl.uniform1f(zoomLocation, zoomLevel);
        gl.uniform2f(offsetLocation, offsetX, offsetY);

        const maxIter = calculateIterations(zoomLevel);
        gl.uniform1i(gl.getUniformLocation(program, 'u_maxIter'), maxIter);

        if (parseInt(fractalTypeSelector.value) === 4) {
            const zValue = parseFloat(zSlider.value);
            const cValue = parseFloat(cSlider.value);
            gl.uniform2f(customParamsLocation, zValue, cValue);
        }

        const color1 = hexToRgb(color1Slider.value);
        const color2 = hexToRgb(color2Slider.value);
        gl.uniform3fv(color1Location, color1);
        gl.uniform3fv(color2Location, color2);
        gl.uniform3fv(color3Location, [1.0, 1.0, 1.0]);

        // Apply the selected color palette
        if (currentColorScheme < 7) {
            const paletteNames = ['cherryRed', 'babyBlue', 'darkBlue', 'skyBlue', 'forestGreen', 'midnightBlue', 'pastelOliveGreen'];
            const palette = palettes[paletteNames[currentColorScheme]];
            applyColorScheme(gl, palette);
        }

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Copy the WebGL rendering to the 2D canvas for smoothing
        smoothingCanvas.width = canvas.width;
        smoothingCanvas.height = canvas.height;
        smoothingCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height);

        // Apply a smoothing filter (bilinear)
        smoothingCtx.filter = 'blur(1px)'; // Adjust the blur level as needed
        smoothingCtx.drawImage(smoothingCanvas, 0, 0, canvas.width, canvas.height);

        // Copy the smoothed rendering back to the main canvas
        const imageData = smoothingCtx.getImageData(0, 0, canvas.width, canvas.height);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageData);
    }

    /**
     * Resizes the canvas to fit its parent element and redraws the fractal.
     */
    function resizeCanvas() {
        const rect = canvas.parentNode.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        drawFractal();
    }

    /**
     * Centers the fractal view on a specific point.
     * @param {number} clientX - The x-coordinate of the point to center on.
     * @param {number} clientY - The y-coordinate of
     * @param {number} clientY - The y-coordinate of the point to center on.
     */
    function centerOnPoint(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const x = (clientX - rect.left) / rect.width - 0.5;
        const y = (clientY - rect.top) / rect.height - 0.5;
        offsetX += x / zoomLevel * 3.0;
        offsetY -= y / zoomLevel * 3.0;
        drawFractal();
    }

    /**
     * Starts the auto-zoom functionality.
     */
    function startAutoZoom() {
        if (autoZooming) return;
        autoZooming = true;
        zoomInterval = setInterval(() => {
            if (zoomLevel > 500000) return;
            zoomLevel *= zoomFactor;
            drawFractal();
            maxIterations += 4;
        }, 100);
    }

    /**
     * Stops the auto-zoom functionality.
     */
    function stopAutoZoom() {
        autoZooming = false;
        clearInterval(zoomInterval);
    }

    /**
     * Converts a hexadecimal color to an RGB array.
     * @param {string} hex - The hexadecimal color string.
     * @returns {Array} - The RGB color array.
     */
    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r / 255, g / 255, b / 255];
    }

    /**
     * Resets the fractal view to the initial state.
     */
    function resetFractal() {
        zoomLevel = 1;
        maxIterations = 77;
        offsetX = 0;
        offsetY = 0;
        drawFractal();
    }

    // Event Listeners
    resetButton.addEventListener('click', resetFractal);

    canvas.addEventListener('wheel', (event) => {
        event.preventDefault();
        if (event.deltaY < 0 && zoomLevel < 500000) {
            zoomLevel *= zoomFactor;
            maxIterations += 3;
        } else if (event.deltaY > 0 && maxIterations > 7) {
            zoomLevel /= zoomFactor;
            maxIterations -= 3;
        }
        drawFractal();
    });

    canvas.addEventListener('mousedown', (event) => {
        if (event.button === 0) { // Left click
            centerOnPoint(event.clientX, event.clientY);
            maxIterations++;
            startAutoZoom();
        }
        isDragging = true;
        dragStartX = event.clientX;
        dragStartY = event.clientY;
    });

    canvas.addEventListener('mousemove', (event) => {
        if (isDragging) {
            const dx = (event.clientX - dragStartX) / zoomLevel;
            const dy = (event.clientY - dragStartY) / zoomLevel;
            offsetX -= dx / 100;
            offsetY += dy / 100;
            dragStartX = event.clientX;
            dragStartY = event.clientY;
            drawFractal();
        }
    });

    canvas.addEventListener('mouseup', (event) => {
        if (event.button === 0) { // Left click
            stopAutoZoom();
            isDragging = false;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
    });

    canvas.addEventListener('touchstart', (event) => {
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const dx = touch2.clientX - touch1.clientX;
            const dy = touch2.clientY - touch1.clientY;
            initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
            lastZoomLevel = zoomLevel;
        } else if (event.touches.length === 1) {
            const touch = event.touches[0];
            dragStartX = touch.clientX;
            dragStartY = touch.clientY;
        }
    });

    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
        if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const dx = touch2.clientX - touch1.clientX;
            const dy = touch2.clientY - touch1.clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            zoomLevel = lastZoomLevel * (distance / initialPinchDistance);
            drawFractal();
        } else if (event.touches.length === 1 && isDragging) {
            const touch = event.touches[0];
            const dx = (touch.clientX - dragStartX) / zoomLevel;
            const dy = (touch.clientY - dragStartY) / zoomLevel;
            offsetX += dx;
            offsetY += dy;
            dragStartX = touch.clientX;
            dragStartY = touch.clientY;
            drawFractal();
        }
    });

    canvas.addEventListener('touchend', () => {
        if (event.touches.length < 2) {
            isDragging = false;
        }
    });

    fractalTypeSelector.addEventListener('change', () => {
        if (parseInt(fractalTypeSelector.value) === 4) {
            document.getElementById('customParams').style.display = 'block';
        } else {
            document.getElementById('customParams').style.display = 'none';
        }
        drawFractal();
    });

    zSlider.addEventListener('input', () => {
        zValueDisplay.textContent = zSlider.value;
        drawFractal();
    });

    cSlider.addEventListener('input', () => {
        cValueDisplay.textContent = cSlider.value;
        drawFractal();
    });

    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentColorScheme = parseInt(button.getAttribute('data-color-scheme'));
            document.getElementById('customColorParams').style.display = currentColorScheme === 7 ? 'block' : 'none';
            drawFractal();
        });
    });

    customColorBtn.addEventListener('click', () => {
        currentColorScheme = 7;
        document.getElementById('customColorParams').style.display = 'block';
        drawFractal();
    });

    color1Slider.addEventListener('input', () => {
        color1ValueDisplay.textContent = color1Slider.value;
        drawFractal();
    });

    color2Slider.addEventListener('input', () => {
        color2ValueDisplay.textContent = color2Slider.value;
        drawFractal();
    });

    window.addEventListener('resize', resizeCanvas);

    resizeCanvas();
});
