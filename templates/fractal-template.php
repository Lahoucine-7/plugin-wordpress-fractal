<div>
    <!-- Container for the fractal canvas -->
    <div id="fractalContainer">
        <canvas id="fractalCanvas" height="400px" width="400px"></canvas>
    </div>

    <!-- Control panel for fractal settings -->
    <div class="controls">
        <label for="fractalType">Liste de fractales :</label>
        <select id="fractalType">
            <option value="0">Mandelbrot</option>
            <option value="1">Julia</option>
            <option value="2">Burning Ship</option>
            <option value="3">Magnet Fractal</option>
            <option value="4">Personnalisé</option>
        </select>

        <!-- Custom parameters for the "Personnalisé" fractal type -->
        <div id="customParams" style="display:none;">
            <label for="zSlider">Z: <span id="zValue">0</span></label>
            <input type="range" id="zSlider" min="-1" max="1" step="0.001" value="0">
            <br>
            <label for="cSlider">C: <span id="cValue">0</span></label>
            <input type="range" id="cSlider" min="-1" max="1" step="0.001" value="0">
        </div>
        <br>

        <!-- Reset button to reset the fractal view -->
        <button id="resetButton">Réinitialiser</button>

        <!-- Color scheme selection -->
        <div id="colors">
            <label for="colorSchemes">Choix de couleur :</label>
            <div id="colorSchemes">
                <button class="color-btn" data-color-scheme="0" style="background: linear-gradient(to right, #990011, #FCF6F5, #990011);">Cherry Red & Off-White</button>
                <button class="color-btn" data-color-scheme="1" style="background: linear-gradient(to right, #8AAAE5, #FFFFFF, #8AAAE5);">Baby Blue & White</button>
                <button class="color-btn" data-color-scheme="2" style="background: linear-gradient(to right, #00246B, #CADCFC, #00246B);">Dark Blue & Light Blue</button>
                <button class="color-btn" data-color-scheme="3" style="background: linear-gradient(to right, #EA738D, #89ABE3, #EA738D);">Sky Blue & Bubblegum Pink</button>
                <button class="color-btn" data-color-scheme="4" style="background: linear-gradient(to right, #2C5F2D, #97BC62, #2C5F2D);">Forest Green & Moss Green</button>
                <button class="color-btn" data-color-scheme="5" style="background: linear-gradient(to right, #1E2761, #408EC6, #7A2048);">Midnight Blue, Royal Blue & Burgundy Red</button>
                <button class="color-btn" data-color-scheme="6" style="background: linear-gradient(to right, #A1BE95, #F98866, #A1BE95);">Pastel Olive Green & Salmon Pink</button>
                <button id="customColorBtn" style="background: linear-gradient(to right, #000000, #FFFFFF);">Personnalisé</button>
            </div>

            <!-- Custom color parameters for the "Personnalisé" color scheme -->
            <div id="customColorParams" style="display:none;">
                <label for="color1Slider">Couleur 1: <span id="color1Value">#000000</span></label>
                <input type="color" id="color1Slider" value="#000000">
                <br>
                <label for="color2Slider">Couleur 2: <span id="color2Value">#FFFFFF</span></label>
                <input type="color" id="color2Slider" value="#FFFFFF">
            </div>
        </div>
    </div>

    <!-- Modal for displaying instructions -->
    <div id="modal" class="modal">
        <div class="modal-content">
            <h2>Instructions</h2>
            <p>Bienvenue dans le générateur de fractales !</p>
            <br/>
            <p>Pour commencer, choisissez le type de fractale souhaité ainsi que la couleur.</p>
            <p>Utilisez la molette de la souris pour zoomer et dézoomer.</p>
            <p>Maintenez le clic gauche enfoncé pour zoomer et/ou déplacer la fractale.</p>
            <p>Sur mobile, tapotez, pincez et dé-pincez :)</p>
            <br/>
            <p>Cliquez sur OK pour commencer.</p> 
            <button id="modal-ok-button">OK</button>
        </div>
    </div>

    <!-- Include the main JavaScript file as a module -->
    <script type="module" src="<?php echo plugin_dir_url(__FILE__) . '../assets/main.js'; ?>"></script>
</div>
