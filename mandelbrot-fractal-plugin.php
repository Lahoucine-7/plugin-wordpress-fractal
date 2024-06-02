<?php
/*
Plugin Name: Mandelbrot Fractal Plugin
Description: Affiche des fractales de Mandelbrot avec des options de personnalisation des couleurs et un zoom infini.
Version: 1.0
Author: Lahoucine
*/

// Enqueue custom scripts and styles
function mandelbrot_fractal_enqueue_scripts() {
    wp_enqueue_script('mandelbrot-fractal-js', plugin_dir_url(__FILE__) . 'mandelbrot-fractal.js', array(), '1.0', true);
    wp_enqueue_style('mandelbrot-fractal-css', plugin_dir_url(__FILE__) . 'mandelbrot-fractal.css');
}
add_action('wp_enqueue_scripts', 'mandelbrot_fractal_enqueue_scripts');

// Shortcode function to embed the Mandelbrot fractal
function mandelbrot_fractal_shortcode($atts) {
    return '<div id="mandelbrot-container">
                <canvas id="mandelbrot-canvas" width="600" height="600"></canvas>
                <div>
                    <label for="colorStart">Début de la palette:</label>
                    <input type="color" id="colorStart" name="colorStart" value="#000000">
                    <label for="colorEnd">Fin de la palette:</label>
                    <input type="color" id="colorEnd" name="colorEnd" value="#FFFFFF">
                    <label for="multicolor">Multicolor:</label>
                    <input type="checkbox" id="multicolor" name="multicolor">
                    <label for="fractalType">Type de fractale:</label>
                    <select id="fractalType" name="fractalType">
                        <option value="mandelbrot">Mandelbrot</option>
                        <option value="julia">Julia</option>
                        <option value="custom">Personnalisée</option>
                    </select>
                </div>
                <div id="custom-controls" style="display: none;">
                    <label for="zValue">Valeur de Z:</label>
                    <input type="text" id="zValue" name="zValue" placeholder="Ex: -0.7, 0.27015">
                    <label for="cValue">Valeur de C:</label>
                    <input type="text" id="cValue" name="cValue" placeholder="Ex: -0.7, 0.27015">
                </div>
                <button id="reset-button">Réinitialiser</button>
                <button id="auto-zoom-button" style="display: none;">Auto Zoom</button>
                <div id="loading-message" style="display: none;">Chargement...</div>
            </div>';
}
add_shortcode('mandelbrot_fractal', 'mandelbrot_fractal_shortcode');
