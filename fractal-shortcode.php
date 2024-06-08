<?php
// Vérifie si WordPress est défini pour éviter les accès directs
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Fonction pour afficher le template du générateur de fractales
function render_fractal_generator() {
    ob_start(); // Démarre la mise en mémoire tampon de sortie

    // Inclut le fichier de template
    include plugin_dir_path(__FILE__) . '../templates/fractal-template.php';

    return ob_get_clean(); // Retourne le contenu mis en mémoire tampon
}

// Enregistre le shortcode [fractal_generator]
function register_fractal_generator_shortcode() {
    add_shortcode('fractal_generator', 'render_fractal_generator');
}
add_action('init', 'register_fractal_generator_shortcode');
?>
