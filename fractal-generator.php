<?php
/*
Plugin Name: Fractal Generator
Description: A plugin to generate and display various types of fractals.
Version: 1.3.1
Author: Lahoucine
*/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Enqueue scripts and styles
function fractal_generator_enqueue_scripts() {
    wp_enqueue_style('fractal-css', plugin_dir_url(__FILE__) . 'assets/fractal.css');

    wp_enqueue_script('main-js', plugin_dir_url(__FILE__) . 'assets/main.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'fractal_generator_enqueue_scripts');

// Shortcode to display the fractal generator
function fractal_generator_shortcode() {
    ob_start();
    include plugin_dir_path(__FILE__) . 'templates/fractal-template.php';
    return ob_get_clean();
}
add_shortcode('fractal_generator', 'fractal_generator_shortcode');
?>
