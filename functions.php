<?php
/**
 * Placy Headless WordPress Theme
 * Minimal theme for headless WordPress with Next.js frontend
 * 
 * @package Placy
 * @version 1.0.0
 */

// Theme setup
function placy_setup() {
    // Add theme support for various features
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'automatic-feed-links' );
    
    // Enable HTML5 support
    add_theme_support( 'html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ) );
}
add_action( 'after_setup_theme', 'placy_setup' );

// Enqueue styles
function placy_enqueue_scripts() {
    wp_enqueue_style( 'placy-style', get_stylesheet_uri(), array(), '1.0.0' );
}
add_action( 'wp_enqueue_scripts', 'placy_enqueue_scripts' );

// Remove unnecessary WordPress features for headless setup
remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
remove_action( 'wp_print_styles', 'print_emoji_styles' );

// Disable XML-RPC (security)
add_filter( 'xmlrpc_enabled', '__return_false' );

/**
 * Register Custom Post Types
 * Uncomment and customize as needed
 */

/*
function placy_register_post_types() {
    // Example: Portfolio
    register_post_type('portfolio', array(
        'labels' => array(
            'name' => 'Portfolio',
            'singular_name' => 'Portfolio Item',
            'add_new' => 'Add New',
            'add_new_item' => 'Add New Portfolio Item',
            'edit_item' => 'Edit Portfolio Item',
            'view_item' => 'View Portfolio Item',
        ),
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'portfolioItem',
        'graphql_plural_name' => 'portfolioItems',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'has_archive' => true,
        'rewrite' => array('slug' => 'portfolio'),
        'menu_icon' => 'dashicons-portfolio',
    ));
}
add_action('init', 'placy_register_post_types');
*/

/**
 * Register Custom Taxonomies
 * Uncomment and customize as needed
 */

/*
function placy_register_taxonomies() {
    // Example: Project Categories
    register_taxonomy('project_category', 'portfolio', array(
        'labels' => array(
            'name' => 'Project Categories',
            'singular_name' => 'Project Category',
        ),
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'projectCategory',
        'graphql_plural_name' => 'projectCategories',
        'hierarchical' => true,
        'rewrite' => array('slug' => 'project-category'),
    ));
}
add_action('init', 'placy_register_taxonomies');
*/

/**
 * Add custom fields support
 * If using Advanced Custom Fields (ACF), fields will automatically
 * be available in GraphQL with WPGraphQL for ACF plugin
 */

// Notification for headless mode
function placy_admin_notice() {
    $screen = get_current_screen();
    if ( $screen->base === 'themes' ) {
        ?>
        <div class="notice notice-info is-dismissible">
            <p><strong>🚀 Placy Headless Theme Active</strong></p>
            <p>Dette temaet er designet for headless WordPress med Next.js frontend.</p>
            <p>Frontend: <a href="http://localhost:3000" target="_blank">http://localhost:3000</a></p>
            <p>GraphQL API: <code><?php echo home_url('/graphql'); ?></code></p>
        </div>
        <?php
    }
}
add_action( 'admin_notices', 'placy_admin_notice' );

// Customize admin footer text
function placy_admin_footer_text() {
    echo '🚀 Placy Headless WordPress | Frontend: <a href="http://localhost:3000" target="_blank">Next.js</a>';
}
add_filter( 'admin_footer_text', 'placy_admin_footer_text' );

/**
 * MINIMAL & REUSABLE CUSTOM POST TYPE FUNCTION
 * 
 * Usage: placy_cpt('name', 'Names', 'icon')
 * 
 * Examples:
 * placy_cpt('portfolio', 'Portfolio', 'portfolio');
 * placy_cpt('project', 'Projects', 'lightbulb');
 * placy_cpt('team', 'Team Members', 'groups');
 */
function placy_cpt($slug, $plural, $icon = 'admin-post') {
    register_post_type($slug, array(
        'labels' => array(
            'name' => $plural,
            'singular_name' => rtrim($plural, 's'),
        ),
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => $slug,
        'graphql_plural_name' => $slug . 's',
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'has_archive' => true,
        'menu_icon' => 'dashicons-' . $icon,
    ));
}

// Register your Custom Post Types here
function placy_register_cpts() {
    // Uncomment and add your CPTs:
    // placy_cpt('portfolio', 'Portfolio', 'portfolio');
    // placy_cpt('project', 'Projects', 'lightbulb');
    // placy_cpt('team', 'Team Members', 'groups');
    // placy_cpt('service', 'Services', 'admin-tools');
}
add_action('init', 'placy_register_cpts');
