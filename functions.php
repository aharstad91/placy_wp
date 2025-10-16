<?php
/**
 * Placy Headless WordPress Theme
 * Minimal theme for headless WordPress with Next.js frontend
 * 
 * @package Placy
 * @version 1.0.0
 * 
 * 🔄 SYNC TO WORDPRESS:
 * This is the source file under version control.
 * After editing, sync to WordPress with:
 *   npm run sync:backend
 * or for auto-sync while developing:
 *   npm run watch:backend
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

/**
 * Enqueue Mapbox Draw scripts and styles in WordPress admin
 * Only loads on route_story edit screens
 */
function placy_admin_enqueue_mapbox_draw($hook) {
    // Only load on route_story edit/new screens
    global $post_type;
    if (($hook === 'post.php' || $hook === 'post-new.php') && $post_type === 'route_story') {
        
        // Mapbox GL JS
        wp_enqueue_style(
            'mapbox-gl',
            'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css',
            array(),
            '3.0.1'
        );
        wp_enqueue_script(
            'mapbox-gl',
            'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js',
            array(),
            '3.0.1',
            false
        );
        
        // Mapbox Draw
        wp_enqueue_style(
            'mapbox-draw',
            'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.css',
            array('mapbox-gl'),
            '1.4.3'
        );
        wp_enqueue_script(
            'mapbox-draw',
            'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-draw/v1.4.3/mapbox-gl-draw.js',
            array('mapbox-gl'),
            '1.4.3',
            false
        );
        
        // Custom admin CSS
        wp_enqueue_style(
            'placy-mapbox-draw-admin',
            get_template_directory_uri() . '/mapbox-draw-admin.css',
            array('mapbox-draw'),
            '1.0.0'
        );
        
        // Custom admin JS (with cache-busting timestamp)
        wp_enqueue_script(
            'placy-mapbox-draw-admin',
            get_template_directory_uri() . '/mapbox-draw-admin.js',
            array('jquery', 'mapbox-gl', 'mapbox-draw'),
            filemtime(get_template_directory() . '/mapbox-draw-admin.js'), // Cache bust with file modification time
            true
        );
        
        // Pass Mapbox token to JavaScript
        // Use environment variable or define constant in wp-config.php
        $mapbox_token = defined('MAPBOX_ACCESS_TOKEN') ? MAPBOX_ACCESS_TOKEN : getenv('NEXT_PUBLIC_MAPBOX_TOKEN');
        
        wp_localize_script(
            'placy-mapbox-draw-admin',
            'placyMapboxConfig',
            array(
                'token' => $mapbox_token,
                'defaultCenter' => array(13.0, 65.0),
                'defaultZoom' => 5
            )
        );
    }
}
add_action('admin_enqueue_scripts', 'placy_admin_enqueue_mapbox_draw');

/**
 * AJAX handler to save route geometry directly to database
 * Bypasses WordPress form submit to ensure data persists
 */
function placy_save_route_geometry_ajax() {
    // Get post ID and verify it exists
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    
    if (!$post_id) {
        wp_send_json_error(array(
            'message' => 'Missing post ID',
            'debug' => $_POST
        ));
        return;
    }
    
    // Verify nonce - try multiple nonce sources
    $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
    $nonce_valid = false;
    
    // Try standard update-post nonce
    if (wp_verify_nonce($nonce, 'update-post_' . $post_id)) {
        $nonce_valid = true;
    }
    
    // If that fails, try checking if user has edit permissions directly
    if (!$nonce_valid && current_user_can('edit_post', $post_id)) {
        $nonce_valid = true;
    }
    
    if (!$nonce_valid) {
        wp_send_json_error(array(
            'message' => 'Security check failed',
            'post_id' => $post_id,
            'nonce_provided' => !empty($nonce),
            'user_can_edit' => current_user_can('edit_post', $post_id)
        ));
        return;
    }
    
    // Verify this is a route_story post
    if (get_post_type($post_id) !== 'route_story') {
        wp_send_json_error(array(
            'message' => 'Invalid post type',
            'post_type' => get_post_type($post_id)
        ));
        return;
    }
    
    $geometry_json = isset($_POST['geometry_json']) ? stripslashes($_POST['geometry_json']) : '';
    
    if (empty($geometry_json)) {
        wp_send_json_error(array(
            'message' => 'Empty geometry data'
        ));
        return;
    }
    
    // Save directly to post meta using ACF field key (not field name)
    // ACF requires the field_key format for update_field() to work
    $field_key = 'field_route_geometry_json';
    
    // Try ACF update_field first
    $updated = update_field($field_key, $geometry_json, $post_id);
    
    // If ACF fails, try direct post meta update as fallback
    if ($updated === false) {
        $meta_key = '_route_geometry_json';
        $updated = update_post_meta($post_id, 'route_geometry_json', $geometry_json);
        update_post_meta($post_id, $meta_key, $field_key);
    }
    
    // Verify the save
    $verify = get_field($field_key, $post_id);
    
    if ($verify && strlen($verify) > 0) {
        wp_send_json_success(array(
            'message' => 'Route geometry saved successfully',
            'post_id' => $post_id,
            'saved_length' => strlen($geometry_json),
            'verified_length' => strlen($verify),
            'method' => ($updated !== false) ? 'update_field' : 'update_post_meta'
        ));
    } else {
        wp_send_json_error(array(
            'message' => 'Failed to verify saved data',
            'update_result' => $updated,
            'field_key' => $field_key
        ));
    }
}
add_action('wp_ajax_save_route_geometry', 'placy_save_route_geometry_ajax');

/**
 * Increase PHP limits for large GeoJSON route data
 */
@ini_set('post_max_size', '64M');
@ini_set('upload_max_filesize', '64M');
@ini_set('memory_limit', '256M');
@ini_set('max_input_vars', '5000');

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
        // 1. KUNDER (Customers) - WordPress Title + ACF
    register_post_type('kunde', array(
        'labels' => array(
            'name' => 'Kunder',
            'singular_name' => 'Kunde',
            'add_new' => 'Legg til kunde',
            'add_new_item' => 'Legg til ny kunde',
            'edit_item' => 'Rediger kunde',
            'view_item' => 'Vis kunde',
            'all_items' => 'Alle kunder',
            'search_items' => 'Søk kunder',
        ),
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'kunde',
        'graphql_plural_name' => 'kunder',
        'supports' => array('title', 'custom-fields'), // Title + ACF fields
        'has_archive' => true,
        'rewrite' => array('slug' => 'kunder'),
        'menu_icon' => 'dashicons-groups',
        'menu_position' => 5,
    ));

    // 2. PROSJEKTER (Projects) - WordPress Title + ACF
    register_post_type('prosjekt', array(
        'labels' => array(
            'name' => 'Prosjekter',
            'singular_name' => 'Prosjekt',
            'add_new' => 'Legg til prosjekt',
            'add_new_item' => 'Legg til nytt prosjekt',
            'edit_item' => 'Rediger prosjekt',
            'view_item' => 'Vis prosjekt',
            'all_items' => 'Alle prosjekter',
            'search_items' => 'Søk prosjekter',
        ),
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'prosjekt',
        'graphql_plural_name' => 'prosjekter',
        'supports' => array('title', 'custom-fields'), // Title + ACF fields
        'has_archive' => true,
        'rewrite' => array('slug' => 'prosjekter'),
        'menu_icon' => 'dashicons-portfolio',
        'menu_position' => 6,
    ));

    // 3. STORIES - Full ACF (Hierarkisk URL: /[prosjekt]/[story])
    register_post_type('story', array(
        'labels' => array(
            'name' => 'Stories',
            'singular_name' => 'Story',
            'add_new' => 'Legg til story',
            'add_new_item' => 'Legg til ny story',
            'edit_item' => 'Rediger story',
            'view_item' => 'Vis story',
            'all_items' => 'Alle stories',
            'search_items' => 'Søk stories',
        ),
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'story',
        'graphql_plural_name' => 'stories',
        'supports' => array('title', 'custom-fields'), // Title + ACF fields
        'has_archive' => false, // No archive, stories accessed via /[prosjekt]/[story]
        'rewrite' => false, // Custom rewrite handled below
        'menu_icon' => 'dashicons-media-document',
        'menu_position' => 7,
    ));

    // 4. TEMA-STORIES - Destinasjonsmarkedsføring (gjenbruker Story struktur)
    register_post_type('tema_story', array(
        'labels' => array(
            'name' => 'Tema-Stories',
            'singular_name' => 'Tema-Story',
            'add_new' => 'Legg til tema-story',
            'add_new_item' => 'Legg til ny tema-story',
            'edit_item' => 'Rediger tema-story',
            'view_item' => 'Vis tema-story',
            'all_items' => 'Alle tema-stories',
            'search_items' => 'Søk tema-stories',
        ),
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'themeStory',
        'graphql_plural_name' => 'themeStories',
        'supports' => array('title', 'custom-fields'), // Title + ACF fields
        'has_archive' => false, // No archive, accessed via /[prosjekt]/[tema-story]
        'rewrite' => false, // Custom rewrite handled below
        'menu_icon' => 'dashicons-location-alt',
        'menu_position' => 7.5,
    ));

    // 5. ROUTE STORIES - Guided walking/cycling tours with waypoints
    register_post_type('route_story', array(
        'labels' => array(
            'name' => 'Route Stories',
            'singular_name' => 'Route Story',
            'add_new' => 'Add New Route',
            'add_new_item' => 'Add New Route Story',
            'edit_item' => 'Edit Route Story',
            'view_item' => 'View Route Story',
            'all_items' => 'All Route Stories',
            'search_items' => 'Search Route Stories',
        ),
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'routeStory',
        'graphql_plural_name' => 'routeStories',
        'supports' => array('title', 'custom-fields'), // Title + ACF fields only
        'has_archive' => false, // No archive, accessed via /[project]/routes/[route]
        'rewrite' => false, // Custom rewrite handled by Next.js
        'menu_icon' => 'dashicons-location-alt',
        'menu_position' => 7.7,
    ));

    // 6. POI (Points of Interest) - Gjenbrukbare steder/lokasjoner
    register_post_type('poi', array(
        'labels' => array(
            'name' => 'POI (Steder)',
            'singular_name' => 'POI',
            'add_new' => 'Legg til POI',
            'add_new_item' => 'Legg til nytt sted',
            'edit_item' => 'Rediger POI',
            'view_item' => 'Vis POI',
            'all_items' => 'Alle POIs',
            'search_items' => 'Søk POIs',
        ),
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'poi',
        'graphql_plural_name' => 'pois',
        'supports' => array('title', 'custom-fields'), // Title + ACF fields
        'has_archive' => false,
        'rewrite' => array('slug' => 'poi'),
        'menu_icon' => 'dashicons-location',
        'menu_position' => 8,
        'taxonomies' => array('poi_type'), // Support for POI type taxonomy
    ));
}
add_action('init', 'placy_register_cpts');

/**
 * Register POI Type Taxonomy
 * Differentiates between major POIs (always visible) and minor POIs (zoom-dependent)
 */
function placy_register_poi_taxonomy() {
    register_taxonomy('poi_type', array('poi'), array(
        'labels' => array(
            'name' => 'POI Type',
            'singular_name' => 'POI Type',
            'menu_name' => 'POI Type',
            'all_items' => 'Alle typer',
            'edit_item' => 'Rediger type',
            'view_item' => 'Vis type',
            'update_item' => 'Oppdater type',
            'add_new_item' => 'Legg til ny type',
            'new_item_name' => 'Nytt typenavn',
            'search_items' => 'Søk typer',
        ),
        'public' => true,
        'show_in_rest' => true,
        'show_in_graphql' => true,
        'graphql_single_name' => 'poiType',
        'graphql_plural_name' => 'poiTypes',
        'hierarchical' => false, // Tag-style, not category-style
        'show_admin_column' => true,
        'show_in_menu' => true,
        'show_ui' => true,
        'meta_box_cb' => 'post_categories_meta_box', // Simple radio selection
        'rewrite' => array('slug' => 'poi-type'),
    ));
    
    // Create default terms if they don't exist
    if (!term_exists('Hoved-POI', 'poi_type')) {
        wp_insert_term(
            'Hoved-POI',
            'poi_type',
            array(
                'description' => 'Hoved-attraksjon som alltid vises på kartet',
                'slug' => 'major'
            )
        );
    }
    
    if (!term_exists('Mini-POI', 'poi_type')) {
        wp_insert_term(
            'Mini-POI',
            'poi_type',
            array(
                'description' => 'Detaljer som vises ved høyere zoom-nivå (benker, lekeplasser, etc.)',
                'slug' => 'minor'
            )
        );
    }
}
add_action('init', 'placy_register_poi_taxonomy');

/**
 * CUSTOM REWRITE RULES FOR HIERARCHICAL STORY URLs
 * URL Structure: /[prosjekt-slug]/[story-slug]
 */
function placy_story_rewrite_rules() {
    add_rewrite_rule(
        '^([^/]+)/([^/]+)/?$',
        'index.php?story=$matches[2]&prosjekt_slug=$matches[1]',
        'top'
    );
}
add_action('init', 'placy_story_rewrite_rules');

// Add custom query var for prosjekt_slug
function placy_query_vars($vars) {
    $vars[] = 'prosjekt_slug';
    return $vars;
}
add_filter('query_vars', 'placy_query_vars');

// Custom permalink structure for Story CPT
function placy_story_permalink($post_link, $post) {
    if ($post->post_type !== 'story') {
        return $post_link;
    }
    
    // Get the prosjekt relation from ACF
    $prosjekt = get_field('prosjekt', $post->ID);
    
    if ($prosjekt && isset($prosjekt->post_name)) {
        $prosjekt_slug = $prosjekt->post_name;
        $story_slug = $post->post_name;
        return home_url("/{$prosjekt_slug}/{$story_slug}/");
    }
    
    // Fallback if no prosjekt is set
    return home_url("/stories/{$post->post_name}/");
}
add_filter('post_type_link', 'placy_story_permalink', 10, 2);

/**
 * Calculate geographic bounds from GeoJSON LineString with buffer
 * 
 * @param string $geojson_string GeoJSON string containing LineString geometry
 * @param float $buffer_meters Buffer distance in meters (default 10000m / 10km)
 * @return array|null Array with [north, south, east, west] or null on failure
 */
function placy_calculate_route_bounds($geojson_string, $buffer_meters = 10000) {
    if (empty($geojson_string)) {
        return null;
    }
    
    $geojson = json_decode($geojson_string, true);
    if (!$geojson || !isset($geojson['coordinates'])) {
        return null;
    }
    
    $coordinates = $geojson['coordinates'];
    if (empty($coordinates)) {
        return null;
    }
    
    // Find min/max coordinates
    $lats = array_column($coordinates, 1);
    $lngs = array_column($coordinates, 0);
    
    $min_lat = min($lats);
    $max_lat = max($lats);
    $min_lng = min($lngs);
    $max_lng = max($lngs);
    
    // Convert buffer from meters to degrees (rough approximation)
    // At latitude ~60° (Norway): 1° lat ≈ 111km, 1° lng ≈ 55km
    $avg_lat = ($min_lat + $max_lat) / 2;
    $lat_buffer = $buffer_meters / 111000; // degrees latitude
    $lng_buffer = $buffer_meters / (111000 * cos(deg2rad($avg_lat))); // degrees longitude adjusted for latitude
    
    return array(
        'north' => $max_lat + $lat_buffer,
        'south' => $min_lat - $lat_buffer,
        'east' => $max_lng + $lng_buffer,
        'west' => $min_lng - $lng_buffer,
    );
}

/**
 * Auto-populate map bounds when route geometry is saved
 * Calculates bounding box from BOTH route geometry AND waypoint POI coordinates
 */
function placy_auto_calculate_route_bounds($post_id) {
    // Only run for route_story post type
    if (get_post_type($post_id) !== 'route_story') {
        return;
    }
    
    // Avoid infinite loops
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    
    // Check user permissions
    if (!current_user_can('edit_post', $post_id)) {
        return;
    }
    
    // Get route geometry
    $geometry_json = get_field('route_geometry_json', $post_id);
    if (empty($geometry_json)) {
        $geometry_json = get_post_meta($post_id, 'route_geometry_json', true);
    }
    
    if (empty($geometry_json)) {
        return;
    }
    
    // Start with route geometry bounds
    $geojson = json_decode($geometry_json, true);
    if (!$geojson) {
        return;
    }
    
    // Handle both Feature wrapper and direct LineString
    if (isset($geojson['type']) && $geojson['type'] === 'Feature' && isset($geojson['geometry'])) {
        $geojson = $geojson['geometry'];
    }
    
    if (!isset($geojson['coordinates']) || empty($geojson['coordinates'])) {
        return;
    }
    
    // Collect all coordinates (route + waypoints)
    $all_lats = array();
    $all_lngs = array();
    
    // Add route coordinates
    foreach ($geojson['coordinates'] as $coord) {
        $all_lngs[] = $coord[0]; // longitude
        $all_lats[] = $coord[1]; // latitude
    }
    
    // Get waypoints and add their coordinates
    $waypoints = get_field('route_waypoints', $post_id);
    
    if ($waypoints && is_array($waypoints)) {
        foreach ($waypoints as $waypoint) {
            // Get POI relationship (field name is 'related_poi')
            $poi = isset($waypoint['related_poi']) ? $waypoint['related_poi'] : null;
            
            if ($poi && is_object($poi)) {
                // Get POI coordinates directly (not nested in poiFields group)
                $lat = get_field('poi_latitude', $poi->ID);
                $lng = get_field('poi_longitude', $poi->ID);
                
                if ($lat && $lng) {
                    $all_lats[] = floatval($lat);
                    $all_lngs[] = floatval($lng);
                }
            }
        }
    }
    
    // Calculate bounds from all coordinates
    if (empty($all_lats) || empty($all_lngs)) {
        return;
    }
    
    $min_lat = min($all_lats);
    $max_lat = max($all_lats);
    $min_lng = min($all_lngs);
    $max_lng = max($all_lngs);
    
    // Apply buffer (2km for generous padding)
    $buffer_meters = 2000;
    $avg_lat = ($min_lat + $max_lat) / 2;
    $lat_buffer = $buffer_meters / 111000;
    $lng_buffer = $buffer_meters / (111000 * cos(deg2rad($avg_lat)));
    
    $bounds = array(
        'north' => $max_lat + $lat_buffer,
        'south' => $min_lat - $lat_buffer,
        'east' => $max_lng + $lng_buffer,
        'west' => $min_lng - $lng_buffer,
    );
    
    // Update bounds fields
    update_field('field_map_bounds_north', $bounds['north'], $post_id);
    update_field('field_map_bounds_south', $bounds['south'], $post_id);
    update_field('field_map_bounds_east', $bounds['east'], $post_id);
    update_field('field_map_bounds_west', $bounds['west'], $post_id);
    
    // Also update as direct post meta as backup
    update_post_meta($post_id, 'map_bounds_north', $bounds['north']);
    update_post_meta($post_id, 'map_bounds_south', $bounds['south']);
    update_post_meta($post_id, 'map_bounds_east', $bounds['east']);
    update_post_meta($post_id, 'map_bounds_west', $bounds['west']);
}
add_action('acf/save_post', 'placy_auto_calculate_route_bounds', 20);

/**
 * ACF FIELD GROUPS - RELASJONER & METADATA
 * Hierarki: Kunde → Prosjekt → Story
 */
function placy_register_acf_fields() {
    if( !function_exists('acf_add_local_field_group') ) return;

    // ============================================
    // KUNDE FIELDS - WordPress Title + ACF Metadata
    // ============================================
    acf_add_local_field_group(array(
        'key' => 'group_kunde',
        'title' => 'Kunde Informasjon',
        'fields' => array(
            array(
                'key' => 'field_kunde_beskrivelse',
                'label' => 'Beskrivelse',
                'name' => 'beskrivelse',
                'type' => 'wysiwyg',
                'required' => 0,
                'tabs' => 'all',
                'toolbar' => 'basic',
                'media_upload' => 0,
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_kunde_logo',
                'label' => 'Logo',
                'name' => 'logo',
                'type' => 'image',
                'required' => 0,
                'return_format' => 'array',
                'preview_size' => 'medium',
                'instructions' => 'Last opp kundens logo (valgfritt)',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_kunde_website',
                'label' => 'Website',
                'name' => 'website',
                'type' => 'url',
                'instructions' => 'Kundens nettside URL',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_kunde_industry',
                'label' => 'Bransje',
                'name' => 'bransje',
                'type' => 'select',
                'choices' => array(
                    'tech' => 'Teknologi',
                    'retail' => 'Detaljhandel',
                    'finance' => 'Finans',
                    'healthcare' => 'Helse',
                    'education' => 'Utdanning',
                    'manufacturing' => 'Industri',
                    'real_estate' => 'Eiendom',
                    'other' => 'Annet',
                ),
                'allow_null' => 1,
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_kunde_brand_color',
                'label' => 'Merkevare Farge',
                'name' => 'brand_color',
                'type' => 'color_picker',
                'default_value' => '#000000',
                'instructions' => 'Kundens primærfarge',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_kunde_kontaktperson',
                'label' => 'Kontaktperson',
                'name' => 'kontaktperson',
                'type' => 'text',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_kunde_epost',
                'label' => 'E-post',
                'name' => 'epost',
                'type' => 'email',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_kunde_telefon',
                'label' => 'Telefon',
                'name' => 'telefon',
                'type' => 'text',
                'show_in_graphql' => 1,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'kunde',
                ),
            ),
        ),
        'show_in_graphql' => 1,
        'graphql_field_name' => 'kundeFields',
        'menu_order' => 0,
        'position' => 'acf_after_title',
        'label_placement' => 'top',
    ));

    // ============================================
    // PROSJEKT FIELDS - WordPress Title + ACF Metadata
    // ============================================
    acf_add_local_field_group(array(
        'key' => 'group_prosjekt',
        'title' => 'Prosjekt Informasjon',
        'fields' => array(
            array(
                'key' => 'field_prosjekt_beskrivelse',
                'label' => 'Beskrivelse',
                'name' => 'beskrivelse',
                'type' => 'wysiwyg',
                'required' => 0,
                'tabs' => 'all',
                'toolbar' => 'full',
                'media_upload' => 1,
                'instructions' => 'Beskriv prosjektet i detalj',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_kunde',
                'label' => 'Kunde',
                'name' => 'kunde',
                'type' => 'post_object',
                'instructions' => 'Velg hvilken kunde dette prosjektet tilhører',
                'required' => 1,
                'post_type' => array('kunde'),
                'return_format' => 'object',
                'ui' => 1,
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_bilder',
                'label' => 'Prosjektbilder',
                'name' => 'bilder',
                'type' => 'gallery',
                'return_format' => 'array',
                'preview_size' => 'medium',
                'instructions' => 'Last opp bilder fra prosjektet',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_start_date',
                'label' => 'Startdato',
                'name' => 'start_date',
                'type' => 'date_picker',
                'display_format' => 'd/m/Y',
                'return_format' => 'Y-m-d',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_end_date',
                'label' => 'Sluttdato',
                'name' => 'end_date',
                'type' => 'date_picker',
                'display_format' => 'd/m/Y',
                'return_format' => 'Y-m-d',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_status',
                'label' => 'Status',
                'name' => 'status',
                'type' => 'select',
                'choices' => array(
                    'planning' => 'Planlegging',
                    'active' => 'Aktiv',
                    'completed' => 'Fullført',
                    'on_hold' => 'På vent',
                    'archived' => 'Arkivert',
                ),
                'default_value' => 'planning',
                'required' => 1,
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_tech_stack',
                'label' => 'Teknologi Stack',
                'name' => 'tech_stack',
                'type' => 'checkbox',
                'choices' => array(
                    'nextjs' => 'Next.js',
                    'wordpress' => 'WordPress',
                    'react' => 'React',
                    'typescript' => 'TypeScript',
                    'tailwind' => 'Tailwind CSS',
                    'graphql' => 'GraphQL',
                    'nodejs' => 'Node.js',
                    'python' => 'Python',
                    'docker' => 'Docker',
                ),
                'layout' => 'vertical',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_url',
                'label' => 'Prosjekt URL',
                'name' => 'project_url',
                'type' => 'url',
                'instructions' => 'Live URL til prosjektet',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_github',
                'label' => 'GitHub Repository',
                'name' => 'github_url',
                'type' => 'url',
                'instructions' => 'Link til GitHub repository',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_latitude',
                'label' => 'Latitude (Breddegrad)',
                'name' => 'prosjekt_latitude',
                'type' => 'text',
                'instructions' => 'Prosjektets breddegrad for Mapbox Directions (eks: 63.4305)',
                'placeholder' => '63.4305',
                'required' => 0,
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_longitude',
                'label' => 'Longitude (Lengdegrad)',
                'name' => 'prosjekt_longitude',
                'type' => 'text',
                'instructions' => 'Prosjektets lengdegrad for Mapbox Directions (eks: 10.3951)',
                'placeholder' => '10.3951',
                'required' => 0,
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_adresse',
                'label' => 'Adresse',
                'name' => 'prosjekt_adresse',
                'type' => 'text',
                'instructions' => 'Prosjektets adresse (valgfritt, for visning i rute)',
                'placeholder' => 'Lundveien 18 C, 0678 Oslo',
                'required' => 0,
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_has_landing_hub',
                'label' => 'Vis som Landing Hub',
                'name' => 'has_landing_hub',
                'type' => 'true_false',
                'instructions' => 'Når aktivert, viser prosjekt-siden en oversikt over relaterte tema-stories (f.eks Visit Trondheim Cruise Guide)',
                'default_value' => 0,
                'ui' => 1,
                'ui_on_text' => 'Ja - Vis landing hub',
                'ui_off_text' => 'Nei - Standard prosjekt',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_frontend_url',
                'label' => '🔗 Frontend URL',
                'name' => 'frontend_url',
                'type' => 'url',
                'instructions' => 'Full URL til frontend-siden (auto-generert basert på slug)',
                'default_value' => '',
                'readonly' => 1,
                'disabled' => 1,
                'show_in_graphql' => 0,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'prosjekt',
                ),
            ),
        ),
        'show_in_graphql' => 1,
        'graphql_field_name' => 'prosjektFields',
        'menu_order' => 0,
        'position' => 'acf_after_title',
        'label_placement' => 'top',
    ));

    // ============================================
    // POI FIELDS - Gjenbrukbare steder/lokasjoner (Mapbox-ready)
    // ============================================
    acf_add_local_field_group(array(
        'key' => 'group_poi',
        'title' => 'POI Informasjon',
        'fields' => array(
            array(
                'key' => 'field_poi_description',
                'label' => 'Beskrivelse',
                'name' => 'poi_description',
                'type' => 'textarea',
                'rows' => 4,
                'instructions' => 'Kort beskrivelse av stedet',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_poi_image',
                'label' => 'POI Bilde',
                'name' => 'poi_image',
                'type' => 'image',
                'instructions' => 'Bilde av stedet/POI (vises i Route Stops)',
                'return_format' => 'array',
                'preview_size' => 'medium',
                'library' => 'all',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_poi_category',
                'label' => 'Kategori',
                'name' => 'poi_category',
                'type' => 'text',
                'instructions' => 'Type POI (eks: idrett, natur, handel, transport)',
                'placeholder' => 'idrett',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_poi_icon',
                'label' => 'Ikon (emoji)',
                'name' => 'poi_icon',
                'type' => 'text',
                'instructions' => 'Emoji-ikon for POI (eks: ⚽, 🏊, 🌲)',
                'placeholder' => '⚽',
                'maxlength' => 2,
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_poi_latitude',
                'label' => 'Latitude (Breddegrad)',
                'name' => 'poi_latitude',
                'type' => 'number',
                'instructions' => 'Breddegrad for Mapbox (eks: 63.4305)',
                'placeholder' => '63.4305',
                'required' => 1,
                'step' => 0.000001,
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_poi_longitude',
                'label' => 'Longitude (Lengdegrad)',
                'name' => 'poi_longitude',
                'type' => 'number',
                'instructions' => 'Lengdegrad for Mapbox (eks: 10.3951)',
                'placeholder' => '10.3951',
                'required' => 1,
                'step' => 0.000001,
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_poi_display_location',
                'label' => 'Visningssted',
                'name' => 'poi_display_location',
                'type' => 'text',
                'instructions' => 'Sted/by som vises i dropdown (eks: "Trondheim", "Bergen") for å skille like navn',
                'placeholder' => 'Trondheim',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_poi_display_subtitle',
                'label' => 'Undertittel',
                'name' => 'poi_display_subtitle',
                'type' => 'text',
                'instructions' => 'Ekstra kontekst (eks: "Sentrum", "Byåsen", "Ved havna") som vises under tittel',
                'placeholder' => 'Sentrum',
                'show_in_graphql' => 1,
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'poi',
                ),
            ),
        ),
        'show_in_graphql' => 1,
        'graphql_field_name' => 'poiFields',
        'menu_order' => 0,
        'position' => 'acf_after_title',
        'label_placement' => 'top',
    ));

    // ============================================
    // STORY FIELDS - Hero + Flexible Sections
    // ============================================
    acf_add_local_field_group(array(
        'key' => 'group_story',
        'title' => 'Story Innhold',
        'fields' => array(
            // Prosjekt Relation
            array(
                'key' => 'field_story_prosjekt',
                'label' => 'Prosjekt',
                'name' => 'prosjekt',
                'type' => 'post_object',
                'instructions' => 'Velg hvilket prosjekt denne storyen tilhører',
                'required' => 1,
                'post_type' => array('prosjekt'),
                'return_format' => 'object',
                'ui' => 1,
                'show_in_graphql' => 1,
            ),
            // Hero Section Group
            array(
                'key' => 'field_story_hero',
                'label' => 'Hero Section',
                'name' => 'hero_section',
                'type' => 'group',
                'instructions' => 'Hovedbilde og intro for storyen',
                'show_in_graphql' => 1,
                'sub_fields' => array(
                    array(
                        'key' => 'field_hero_background_image',
                        'label' => 'Bakgrunnsbilde',
                        'name' => 'background_image',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'large',
                        'instructions' => 'Stort bakgrunnsbilde for hero-seksjonen',
                        'show_in_graphql' => 1,
                    ),
                    array(
                        'key' => 'field_hero_title',
                        'label' => 'Tittel',
                        'name' => 'title',
                        'type' => 'text',
                        'instructions' => 'Hovedtittel (eks: "Velkommen over til Overvik")',
                        'show_in_graphql' => 1,
                    ),
                    array(
                        'key' => 'field_hero_description',
                        'label' => 'Beskrivelse',
                        'name' => 'description',
                        'type' => 'textarea',
                        'rows' => 3,
                        'instructions' => 'Intro-tekst under tittelen',
                        'show_in_graphql' => 1,
                    ),
                ),
            ),
            
            // Story Sections - Flexible Content
            array(
                'key' => 'field_story_sections',
                'label' => 'Story Seksjoner',
                'name' => 'story_sections',
                'type' => 'flexible_content',
                'instructions' => 'Legg til seksjoner til storyen (basert på Idrett-seksjonen fra prototype)',
                'button_label' => 'Legg til seksjon',
                'show_in_graphql' => 1,
                'layouts' => array(
                    // Layout: Story Section
                    'layout_story_section' => array(
                        'key' => 'layout_story_section',
                        'name' => 'story_section',
                        'label' => 'Story Section',
                        'display' => 'block',
                        'sub_fields' => array(
                            array(
                                'key' => 'field_section_id',
                                'label' => 'Section ID',
                                'name' => 'section_id',
                                'type' => 'text',
                                'instructions' => 'Unik ID for anchor links (eks: "idrettsbydelen")',
                                'required' => 1,
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_section_icon',
                                'label' => 'Ikon',
                                'name' => 'section_icon',
                                'type' => 'text',
                                'instructions' => 'Emoji eller ikon (eks: ⚽)',
                                'default_value' => '📍',
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_section_header_image',
                                'label' => 'Header Bilde',
                                'name' => 'header_image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                                'instructions' => 'Bilde øverst i seksjonen (33vh høyde)',
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_section_title',
                                'label' => 'Tittel',
                                'name' => 'title',
                                'type' => 'text',
                                'instructions' => 'Seksjonstittel (eks: "Idrett & trening")',
                                'required' => 1,
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_section_description',
                                'label' => 'Beskrivelse',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 4,
                                'instructions' => 'Intro-tekst for seksjonen',
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_section_map_type',
                                'label' => 'Kart Type',
                                'name' => 'map_type',
                                'type' => 'select',
                                'instructions' => 'Hvilket kart skal vises',
                                'choices' => array(
                                    'none' => 'Ingen kart',
                                    'idrett' => 'Idrett',
                                    'mikrolokasjon' => 'Mikrolokasjon',
                                    'hverdagsliv' => 'Hverdagsliv',
                                    'kafe' => 'Kafé & spisesteder',
                                    'natur' => 'Friluftsområder',
                                    'transport' => 'Transport',
                                    'oppvekst' => 'Oppvekst',
                                ),
                                'default_value' => 'none',
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_section_poi_display_mode',
                                'label' => 'POI Visning',
                                'name' => 'poi_display_mode',
                                'type' => 'radio',
                                'instructions' => 'Hvordan skal POI\'s vises? Samlekart viser alle på ett kart, Individuelle kort viser hvert POI som sitt eget kort.',
                                'choices' => array(
                                    'collection_map' => 'Samlekart (alle POI\'s på ett kart)',
                                    'individual_cards' => 'Individuelle kort (grid av POI kort)',
                                ),
                                'default_value' => 'collection_map',
                                'layout' => 'vertical',
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_section_show_map',
                                'label' => 'Vis Kart',
                                'name' => 'show_map',
                                'type' => 'true_false',
                                'instructions' => 'Vis kart-placeholder i seksjonen',
                                'default_value' => 1,
                                'ui' => 1,
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_section_related_pois',
                                'label' => 'Relaterte POIs',
                                'name' => 'related_pois',
                                'type' => 'relationship',
                                'instructions' => 'Velg POIs som skal vises i denne seksjonen',
                                'post_type' => array('poi'),
                                'filters' => array('search'),
                                'return_format' => 'object',
                                'show_in_graphql' => 1,
                            ),
                        ),
                    ),
                ),
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'story',
                ),
            ),
        ),
        'show_in_graphql' => 1,
        'graphql_field_name' => 'storyFields',
        'menu_order' => 0,
        'position' => 'acf_after_title',
        'label_placement' => 'top',
    ));

    // ============================================
    // TEMA-STORY FIELDS - Gjenbruker Story struktur + Related Prosjekt
    // ============================================
    acf_add_local_field_group(array(
        'key' => 'group_tema_story',
        'title' => 'Tema-Story Innhold',
        'fields' => array(
            // Related Prosjekt (NYTT FELT - eneste forskjell fra Story)
            array(
                'key' => 'field_tema_story_related_prosjekt',
                'label' => 'Relatert Prosjekt',
                'name' => 'related_prosjekt',
                'type' => 'post_object',
                'instructions' => 'Velg hvilket prosjekt denne tema-storyen tilhører (f.eks Visit Trondheim Cruise Tour)',
                'required' => 1,
                'post_type' => array('prosjekt'),
                'return_format' => 'object',
                'ui' => 1,
                'show_in_graphql' => 1,
            ),
            // Hero Section Group (SAMME SOM STORY)
            array(
                'key' => 'field_tema_story_hero',
                'label' => 'Hero Section',
                'name' => 'hero_section',
                'type' => 'group',
                'instructions' => 'Hovedbilde og intro for tema-storyen',
                'show_in_graphql' => 1,
                'sub_fields' => array(
                    array(
                        'key' => 'field_tema_hero_background_image',
                        'label' => 'Bakgrunnsbilde',
                        'name' => 'background_image',
                        'type' => 'image',
                        'return_format' => 'array',
                        'preview_size' => 'large',
                        'instructions' => 'Stort bakgrunnsbilde for hero-seksjonen',
                        'show_in_graphql' => 1,
                    ),
                    array(
                        'key' => 'field_tema_hero_title',
                        'label' => 'Tittel',
                        'name' => 'title',
                        'type' => 'text',
                        'instructions' => 'Hovedtittel (eks: "Kulinariske Opplevelser")',
                        'show_in_graphql' => 1,
                    ),
                    array(
                        'key' => 'field_tema_hero_description',
                        'label' => 'Beskrivelse',
                        'name' => 'description',
                        'type' => 'textarea',
                        'rows' => 3,
                        'instructions' => 'Intro-tekst under tittelen',
                        'show_in_graphql' => 1,
                    ),
                ),
            ),
            
            // Story Sections - Flexible Content (SAMME SOM STORY)
            array(
                'key' => 'field_tema_story_sections',
                'label' => 'Tema-Story Seksjoner',
                'name' => 'story_sections',
                'type' => 'flexible_content',
                'instructions' => 'Legg til seksjoner til tema-storyen (f.eks Fine Dining, Street Food, etc)',
                'button_label' => 'Legg til seksjon',
                'show_in_graphql' => 1,
                'layouts' => array(
                    // Layout: Story Section
                    'layout_tema_story_section' => array(
                        'key' => 'layout_tema_story_section',
                        'name' => 'story_section',
                        'label' => 'Story Section',
                        'display' => 'block',
                        'sub_fields' => array(
                            array(
                                'key' => 'field_tema_section_id',
                                'label' => 'Section ID',
                                'name' => 'section_id',
                                'type' => 'text',
                                'instructions' => 'Unik ID for anchor links (eks: "fine-dining")',
                                'required' => 1,
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_tema_section_icon',
                                'label' => 'Ikon',
                                'name' => 'section_icon',
                                'type' => 'text',
                                'instructions' => 'Emoji eller ikon (eks: 🍽️)',
                                'default_value' => '📍',
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_tema_section_header_image',
                                'label' => 'Header Bilde',
                                'name' => 'header_image',
                                'type' => 'image',
                                'return_format' => 'array',
                                'preview_size' => 'medium',
                                'instructions' => 'Bilde øverst i seksjonen',
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_tema_section_title',
                                'label' => 'Tittel',
                                'name' => 'title',
                                'type' => 'text',
                                'instructions' => 'Seksjonstittel (eks: "Fine Dining")',
                                'required' => 1,
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_tema_section_description',
                                'label' => 'Beskrivelse',
                                'name' => 'description',
                                'type' => 'textarea',
                                'rows' => 4,
                                'instructions' => 'Intro-tekst for seksjonen',
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_tema_section_map_type',
                                'label' => 'Kart Type',
                                'name' => 'map_type',
                                'type' => 'select',
                                'instructions' => 'Hvilket kart skal vises',
                                'choices' => array(
                                    'none' => 'Ingen kart',
                                    'kulinarisk' => 'Kulinarisk',
                                    'shopping' => 'Shopping',
                                    'kultur' => 'Kultur',
                                    'natur' => 'Natur',
                                    'transport' => 'Transport',
                                    'historie' => 'Historie',
                                ),
                                'default_value' => 'none',
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_tema_section_poi_display_mode',
                                'label' => 'POI Visning',
                                'name' => 'poi_display_mode',
                                'type' => 'radio',
                                'instructions' => 'Hvordan skal POI\'s vises?',
                                'choices' => array(
                                    'collection_map' => 'Samlekart (alle POI\'s på ett kart)',
                                    'individual_cards' => 'Individuelle kort (grid av POI kort)',
                                ),
                                'default_value' => 'collection_map',
                                'layout' => 'vertical',
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_tema_section_show_map',
                                'label' => 'Vis Kart',
                                'name' => 'show_map',
                                'type' => 'true_false',
                                'instructions' => 'Vis kart i seksjonen',
                                'default_value' => 1,
                                'ui' => 1,
                                'show_in_graphql' => 1,
                            ),
                            array(
                                'key' => 'field_tema_section_related_pois',
                                'label' => 'Relaterte POIs',
                                'name' => 'related_pois',
                                'type' => 'relationship',
                                'instructions' => 'Velg POIs som skal vises i denne seksjonen',
                                'post_type' => array('poi'),
                                'filters' => array('search'),
                                'return_format' => 'object',
                                'show_in_graphql' => 1,
                            ),
                        ),
                    ),
                ),
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'tema_story',
                ),
            ),
        ),
        'show_in_graphql' => 1,
        'graphql_field_name' => 'themeStoryFields',
        'menu_order' => 0,
        'position' => 'acf_after_title',
        'label_placement' => 'top',
    ));

    // ROUTE STORY FIELDS - Guided tours with waypoints
    acf_add_local_field_group(array(
        'key' => 'group_route_story',
        'title' => 'Route Story Fields',
        'fields' => array(
            // Related Project
            array(
                'key' => 'field_route_related_prosjekt',
                'label' => 'Related Project',
                'name' => 'related_prosjekt',
                'type' => 'post_object',
                'instructions' => 'Select the project this route belongs to',
                'required' => 1,
                'post_type' => array('prosjekt'),
                'return_format' => 'object',
                'show_in_graphql' => 1,
            ),
            // Route Metadata
            array(
                'key' => 'field_route_duration',
                'label' => 'Duration (minutes)',
                'name' => 'route_duration',
                'type' => 'number',
                'instructions' => 'Estimated duration in minutes',
                'required' => 1,
                'min' => 1,
                'show_in_graphql' => 1,
                'wrapper' => array(
                    'width' => '25',
                ),
            ),
            array(
                'key' => 'field_route_distance',
                'label' => 'Distance (km)',
                'name' => 'route_distance',
                'type' => 'number',
                'instructions' => 'Total distance in kilometers',
                'required' => 1,
                'min' => 0,
                'step' => 0.1,
                'show_in_graphql' => 1,
                'wrapper' => array(
                    'width' => '25',
                ),
            ),
            array(
                'key' => 'field_route_difficulty',
                'label' => 'Difficulty',
                'name' => 'route_difficulty',
                'type' => 'select',
                'instructions' => 'Physical difficulty level',
                'required' => 1,
                'choices' => array(
                    'easy' => 'Easy',
                    'moderate' => 'Moderate',
                    'challenging' => 'Challenging',
                ),
                'default_value' => 'easy',
                'show_in_graphql' => 1,
                'wrapper' => array(
                    'width' => '25',
                ),
            ),
            array(
                'key' => 'field_route_type',
                'label' => 'Route Type',
                'name' => 'route_type',
                'type' => 'select',
                'instructions' => 'Type of tour',
                'required' => 1,
                'choices' => array(
                    'walking' => 'Walking Tour',
                    'cycling' => 'Cycling Tour',
                    'driving' => 'Driving Tour',
                ),
                'default_value' => 'walking',
                'show_in_graphql' => 1,
                'wrapper' => array(
                    'width' => '25',
                ),
            ),
            // Start Location
            array(
                'key' => 'field_route_start_location',
                'label' => 'Start Location',
                'name' => 'start_location',
                'type' => 'group',
                'instructions' => 'Where the route begins',
                'show_in_graphql' => 1,
                'sub_fields' => array(
                    array(
                        'key' => 'field_start_name',
                        'label' => 'Location Name',
                        'name' => 'name',
                        'type' => 'text',
                        'required' => 1,
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '40',
                        ),
                    ),
                    array(
                        'key' => 'field_start_latitude',
                        'label' => 'Latitude',
                        'name' => 'latitude',
                        'type' => 'number',
                        'required' => 1,
                        'step' => 0.000001,
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '30',
                        ),
                    ),
                    array(
                        'key' => 'field_start_longitude',
                        'label' => 'Longitude',
                        'name' => 'longitude',
                        'type' => 'number',
                        'required' => 1,
                        'step' => 0.000001,
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '30',
                        ),
                    ),
                    array(
                        'key' => 'field_start_image',
                        'label' => 'Start Location Image',
                        'name' => 'image',
                        'type' => 'image',
                        'instructions' => 'Image for start location marker',
                        'return_format' => 'array',
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '50',
                        ),
                    ),
                    array(
                        'key' => 'field_include_approach_in_route',
                        'label' => 'Include Approach in Route',
                        'name' => 'include_approach_in_route',
                        'type' => 'true_false',
                        'instructions' => 'If ON: Start→First waypoint is part of main route (dark blue). If OFF: Light blue approach line (not part of route)',
                        'default_value' => 0,
                        'ui' => 1,
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '50',
                        ),
                    ),
                    array(
                        'key' => 'field_show_return_route',
                        'label' => 'Show Return Route',
                        'name' => 'show_return_route',
                        'type' => 'true_false',
                        'instructions' => 'If ON: Show light blue return line (not part of route). If OFF: No return line',
                        'default_value' => 1,
                        'ui' => 1,
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '50',
                        ),
                    ),
                ),
            ),
            // Route Geometry Source
            array(
                'key' => 'field_route_geometry_source',
                'label' => 'Route Geometry Source',
                'name' => 'route_geometry_source',
                'type' => 'radio',
                'instructions' => 'How should the route line be calculated?',
                'required' => 1,
                'choices' => array(
                    'mapbox_directions' => 'Mapbox Directions API (automatic routing between waypoints)',
                    'custom_drawn' => 'Custom Drawn Route (manual path using Mapbox Draw)',
                ),
                'default_value' => 'mapbox_directions',
                'layout' => 'vertical',
                'show_in_graphql' => 1,
            ),
            // Custom Route Geometry (GeoJSON)
            array(
                'key' => 'field_route_geometry_json',
                'label' => 'Custom Route Geometry (GeoJSON)',
                'name' => 'route_geometry_json',
                'type' => 'textarea',
                'instructions' => 'GeoJSON LineString data from Mapbox Draw (automatically populated)',
                'rows' => 5,
                'maxlength' => '', // Remove character limit
                'readonly' => 0, // Changed from 1 to 0 - must be editable for WordPress to save it
                'show_in_graphql' => 1,
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_route_geometry_source',
                            'operator' => '==',
                            'value' => 'custom_drawn',
                        ),
                    ),
                ),
            ),
            // Map Bounds (Auto-calculated from route geometry)
            array(
                'key' => 'field_map_bounds_north',
                'label' => 'Map Bounds North',
                'name' => 'map_bounds_north',
                'type' => 'number',
                'instructions' => 'Northernmost latitude (auto-calculated from route + 500m buffer)',
                'step' => 0.000001,
                'readonly' => 1,
                'show_in_graphql' => 1,
                'wrapper' => array('width' => '25'),
            ),
            array(
                'key' => 'field_map_bounds_south',
                'label' => 'Map Bounds South',
                'name' => 'map_bounds_south',
                'type' => 'number',
                'instructions' => 'Southernmost latitude (auto-calculated)',
                'step' => 0.000001,
                'readonly' => 1,
                'show_in_graphql' => 1,
                'wrapper' => array('width' => '25'),
            ),
            array(
                'key' => 'field_map_bounds_east',
                'label' => 'Map Bounds East',
                'name' => 'map_bounds_east',
                'type' => 'number',
                'instructions' => 'Easternmost longitude (auto-calculated)',
                'step' => 0.000001,
                'readonly' => 1,
                'show_in_graphql' => 1,
                'wrapper' => array('width' => '25'),
            ),
            array(
                'key' => 'field_map_bounds_west',
                'label' => 'Map Bounds West',
                'name' => 'map_bounds_west',
                'type' => 'number',
                'instructions' => 'Westernmost longitude (auto-calculated)',
                'step' => 0.000001,
                'readonly' => 1,
                'show_in_graphql' => 1,
                'wrapper' => array('width' => '25'),
            ),
            array(
                'key' => 'field_map_min_zoom',
                'label' => 'Min Zoom Level',
                'name' => 'map_min_zoom',
                'type' => 'number',
                'instructions' => 'Minimum zoom level (prevents zooming too far out)',
                'default_value' => 11,
                'min' => 0,
                'max' => 22,
                'step' => 1,
                'show_in_graphql' => 1,
                'wrapper' => array('width' => '50'),
            ),
            array(
                'key' => 'field_map_max_zoom',
                'label' => 'Max Zoom Level',
                'name' => 'map_max_zoom',
                'type' => 'number',
                'instructions' => 'Maximum zoom level (prevents zooming too close)',
                'default_value' => 18,
                'min' => 0,
                'max' => 22,
                'step' => 1,
                'show_in_graphql' => 1,
                'wrapper' => array('width' => '50'),
            ),
            // Waypoint Display Settings
            array(
                'key' => 'field_hide_waypoint_numbers',
                'label' => 'Hide Waypoint Numbers',
                'name' => 'hide_waypoint_numbers',
                'type' => 'true_false',
                'instructions' => 'Toggle waypoint number visibility. OFF = Show numbers and circles, ON = Hide numbers and circles',
                'default_value' => 0,
                'ui' => 1,
                'show_in_graphql' => 1,
                'wrapper' => array(
                    'width' => '100',
                ),
            ),
            // Mapbox Draw Interface Trigger
            array(
                'key' => 'field_route_draw_interface',
                'label' => 'Draw Route on Map',
                'name' => 'route_draw_interface',
                'type' => 'message',
                'message' => '<div id="placy-mapbox-draw-trigger">
                    <button type="button" class="button button-primary button-large" id="open-mapbox-draw">
                        <span class="dashicons dashicons-location-alt"></span> Open Mapbox Draw
                    </button>
                    <p class="description">Click to open an interactive map where you can draw the route manually.</p>
                    <div id="mapbox-draw-preview" style="margin-top: 15px; display: none;">
                        <p><strong>Route drawn:</strong> <span id="draw-coordinates-count">0</span> coordinates</p>
                        <button type="button" class="button" id="edit-mapbox-draw" style="display: none;">
                            <span class="dashicons dashicons-edit"></span> Edit Route
                        </button>
                        <button type="button" class="button" id="clear-mapbox-draw" style="display: none;">
                            <span class="dashicons dashicons-trash"></span> Clear Route
                        </button>
                    </div>
                </div>',
                'show_in_graphql' => 0,
                'conditional_logic' => array(
                    array(
                        array(
                            'field' => 'field_route_geometry_source',
                            'operator' => '==',
                            'value' => 'custom_drawn',
                        ),
                    ),
                ),
            ),
            // Hero Section
            array(
                'key' => 'field_route_hero',
                'label' => 'Hero Section',
                'name' => 'hero_section',
                'type' => 'group',
                'instructions' => 'Top section with title, image, and optional video',
                'show_in_graphql' => 1,
                'sub_fields' => array(
                    array(
                        'key' => 'field_route_hero_title',
                        'label' => 'Hero Title',
                        'name' => 'title',
                        'type' => 'text',
                        'required' => 1,
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '60',
                        ),
                    ),
                    array(
                        'key' => 'field_route_hero_image',
                        'label' => 'Hero Image',
                        'name' => 'hero_image',
                        'type' => 'image',
                        'instructions' => 'Main background image',
                        'return_format' => 'array',
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '40',
                        ),
                    ),
                    array(
                        'key' => 'field_route_hero_subtitle',
                        'label' => 'Hero Subtitle',
                        'name' => 'subtitle',
                        'type' => 'textarea',
                        'rows' => 2,
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '60',
                        ),
                    ),
                    array(
                        'key' => 'field_route_video_embed',
                        'label' => 'Video Embed URL',
                        'name' => 'video_embed_url',
                        'type' => 'url',
                        'instructions' => 'YouTube/Vimeo (optional flyover)',
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '40',
                        ),
                    ),
                ),
            ),
            // Route Waypoints
            array(
                'key' => 'field_route_waypoints',
                'label' => 'Route Waypoints',
                'name' => 'route_waypoints',
                'type' => 'repeater',
                'instructions' => 'Sequential stops along the route',
                'required' => 1,
                'min' => 1,
                'max' => 50,
                'layout' => 'row',
                'collapsed' => 'field_waypoint_poi',
                'button_label' => 'Add Waypoint Stop',
                'show_in_graphql' => 1,
                'sub_fields' => array(
                    array(
                        'key' => 'field_waypoint_poi',
                        'label' => 'Related POI (Optional)',
                        'name' => 'related_poi',
                        'type' => 'post_object',
                        'instructions' => 'Select POI for this waypoint (optional - waypoints can exist without POI)',
                        'required' => 0, // ⚠️ CHANGED: Waypoints can exist without POI
                        'post_type' => array('poi'),
                        'return_format' => 'object',
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '60',
                        ),
                    ),
                    array(
                        'key' => 'field_waypoint_time',
                        'label' => 'Time at Stop (minutes)',
                        'name' => 'estimated_time',
                        'type' => 'number',
                        'instructions' => 'Suggested time to spend here',
                        'min' => 1,
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '40',
                        ),
                    ),
                    array(
                        'key' => 'field_waypoint_order',
                        'label' => 'Order',
                        'name' => 'waypoint_order',
                        'type' => 'number',
                        'instructions' => 'Auto-generated from position in list',
                        'required' => 0,
                        'min' => 1,
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '0',
                            'class' => 'hidden',
                        ),
                        'readonly' => 1,
                    ),
                    array(
                        'key' => 'field_waypoint_description',
                        'label' => 'Waypoint Description',
                        'name' => 'description',
                        'type' => 'textarea',
                        'instructions' => 'What to do/see at this stop',
                        'rows' => 3,
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '100',
                        ),
                    ),
                    // Coordinates (for waypoints without POI)
                    array(
                        'key' => 'field_waypoint_latitude',
                        'label' => 'Latitude (if no POI)',
                        'name' => 'waypoint_latitude',
                        'type' => 'number',
                        'instructions' => 'Only needed if no POI is selected',
                        'required' => 0,
                        'step' => 'any',
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '50',
                        ),
                        'conditional_logic' => array(
                            array(
                                array(
                                    'field' => 'field_waypoint_poi',
                                    'operator' => '==empty',
                                ),
                            ),
                        ),
                    ),
                    array(
                        'key' => 'field_waypoint_longitude',
                        'label' => 'Longitude (if no POI)',
                        'name' => 'waypoint_longitude',
                        'type' => 'number',
                        'instructions' => 'Only needed if no POI is selected',
                        'required' => 0,
                        'step' => 'any',
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '50',
                        ),
                        'conditional_logic' => array(
                            array(
                                array(
                                    'field' => 'field_waypoint_poi',
                                    'operator' => '==empty',
                                ),
                            ),
                        ),
                    ),
                ),
            ),
            // Practical Info
            array(
                'key' => 'field_route_practical',
                'label' => 'Practical Information',
                'name' => 'practical_info',
                'type' => 'group',
                'instructions' => 'Additional details for planning',
                'show_in_graphql' => 1,
                'sub_fields' => array(
                    array(
                        'key' => 'field_route_season',
                        'label' => 'Best Season',
                        'name' => 'best_season',
                        'type' => 'text',
                        'instructions' => 'e.g., "Year-round" or "May-September"',
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '33',
                        ),
                    ),
                    array(
                        'key' => 'field_route_price',
                        'label' => 'Price Information',
                        'name' => 'price_info',
                        'type' => 'text',
                        'instructions' => 'e.g., "Free" or "NOK 250 with guide"',
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '33',
                        ),
                    ),
                    array(
                        'key' => 'field_route_accessibility',
                        'label' => 'Accessibility Notes',
                        'name' => 'accessibility_notes',
                        'type' => 'textarea',
                        'instructions' => 'Wheelchair access, stairs, terrain',
                        'rows' => 2,
                        'show_in_graphql' => 1,
                        'wrapper' => array(
                            'width' => '34',
                        ),
                    ),
                ),
            ),
        ),
        'location' => array(
            array(
                array(
                    'param' => 'post_type',
                    'operator' => '==',
                    'value' => 'route_story',
                ),
            ),
        ),
        'show_in_graphql' => 1,
        'graphql_field_name' => 'routeStoryFields',
        'menu_order' => 0,
        'position' => 'acf_after_title',
        'label_placement' => 'top',
    ));
}
add_action('acf/init', 'placy_register_acf_fields');

/**
 * AUTO-POPULATE FRONTEND URL FOR PROSJEKT
 */
function placy_populate_frontend_url($value, $post_id, $field) {
    // Only for prosjekt post type
    if (get_post_type($post_id) !== 'prosjekt') {
        return $value;
    }
    
    // Get the post slug
    $post = get_post($post_id);
    if (!$post) {
        return $value;
    }
    
    // Frontend base URL (change this to your production URL when deploying)
    $frontend_base = 'http://localhost:3001';
    
    // Generate URL based on slug
    $frontend_url = $frontend_base . '/' . $post->post_name;
    
    return $frontend_url;
}
add_filter('acf/load_value/name=frontend_url', 'placy_populate_frontend_url', 10, 3);

/**
 * AUTO-SET WAYPOINT ORDER BASED ON POSITION IN REPEATER
 */
function placy_auto_set_waypoint_order($value, $post_id, $field) {
    // Only for route_waypoints repeater
    if ($field['name'] !== 'route_waypoints') {
        return $value;
    }
    
    // If we have waypoints, auto-set the order based on array position
    if (is_array($value) && !empty($value)) {
        foreach ($value as $index => $waypoint) {
            $value[$index]['waypoint_order'] = $index + 1;
        }
    }
    
    return $value;
}
add_filter('acf/update_value/name=route_waypoints', 'placy_auto_set_waypoint_order', 10, 3);

/**
 * ADD "VIEW ON FRONTEND" BUTTON TO PROSJEKT ADMIN
 */
function placy_add_frontend_view_button() {
    global $post;
    
    if (get_post_type($post) === 'prosjekt') {
        $frontend_base = 'http://localhost:3001';
        $frontend_url = $frontend_base . '/' . $post->post_name;
        ?>
        <div id="placy-frontend-link" class="misc-pub-section">
            <span style="display: inline-block; margin-right: 8px;">🌐</span>
            <a href="<?php echo esc_url($frontend_url); ?>" target="_blank" style="font-weight: 600; color: #2271b1;">
                View on Frontend
            </a>
            <span style="color: #999; margin-left: 8px;">↗</span>
        </div>
        <style>
            #placy-frontend-link {
                padding: 8px 12px;
                border-top: 1px solid #ddd;
            }
            #placy-frontend-link a:hover {
                color: #135e96;
            }
        </style>
        <?php
    }
}
add_action('post_submitbox_misc_actions', 'placy_add_frontend_view_button');

/**
 * ADD "VIEW ON FRONTEND" BUTTON TO STORY & TEMA-STORY ADMIN
 */
function placy_add_story_frontend_view_button() {
    global $post;
    
    $post_type = get_post_type($post);
    
    if ($post_type === 'story' || $post_type === 'tema_story') {
        // Get related prosjekt
        $prosjekt = null;
        
        if ($post_type === 'story') {
            $prosjekt = get_field('prosjekt', $post->ID);
        } elseif ($post_type === 'tema_story') {
            $prosjekt_connection = get_field('related_prosjekt', $post->ID);
            if ($prosjekt_connection && is_array($prosjekt_connection) && !empty($prosjekt_connection)) {
                $prosjekt = $prosjekt_connection[0]; // Get first related prosjekt
            }
        }
        
        if ($prosjekt) {
            $prosjekt_slug = is_object($prosjekt) ? $prosjekt->post_name : '';
            $frontend_base = 'http://localhost:3001';
            $frontend_url = $frontend_base . '/' . $prosjekt_slug . '/' . $post->post_name;
            
            $type_label = $post_type === 'story' ? 'Prosjekt-Story' : 'Tema-Story';
            ?>
            <div id="placy-story-frontend-link" class="misc-pub-section">
                <span style="display: inline-block; margin-right: 8px;">🌐</span>
                <a href="<?php echo esc_url($frontend_url); ?>" target="_blank" style="font-weight: 600; color: #2271b1;">
                    View <?php echo esc_html($type_label); ?> on Frontend
                </a>
                <span style="color: #999; margin-left: 8px;">↗</span>
            </div>
            <style>
                #placy-story-frontend-link {
                    padding: 8px 12px;
                    border-top: 1px solid #ddd;
                }
                #placy-story-frontend-link a:hover {
                    color: #135e96;
                }
            </style>
            <?php
        }
    }
}
add_action('post_submitbox_misc_actions', 'placy_add_story_frontend_view_button');

/**
 * ADD "VIEW ON FRONTEND" BUTTON TO ROUTE STORY ADMIN
 */
function placy_add_route_frontend_view_button() {
    global $post;
    
    if ($post && get_post_type($post) === 'route_story') {
        // Get related prosjekt
        $prosjekt_connection = get_field('related_prosjekt', $post->ID);
        
        $prosjekt = null;
        if ($prosjekt_connection && is_array($prosjekt_connection) && !empty($prosjekt_connection)) {
            $prosjekt = $prosjekt_connection[0]; // Get first related prosjekt
        } elseif (is_object($prosjekt_connection)) {
            $prosjekt = $prosjekt_connection;
        }
        
        if ($prosjekt) {
            $prosjekt_slug = is_object($prosjekt) ? $prosjekt->post_name : '';
            $frontend_base = 'http://localhost:3001';
            $frontend_url = $frontend_base . '/' . $prosjekt_slug . '/routes/' . $post->post_name;
            ?>
            <div id="placy-route-frontend-link" class="misc-pub-section">
                <span style="display: inline-block; margin-right: 8px;">🧭</span>
                <a href="<?php echo esc_url($frontend_url); ?>" target="_blank" style="font-weight: 600; color: #2271b1;">
                    View Route on Frontend
                </a>
                <span style="color: #999; margin-left: 8px;">↗</span>
            </div>
            <style>
                #placy-route-frontend-link {
                    padding: 8px 12px;
                    border-top: 1px solid #ddd;
                }
                #placy-route-frontend-link a:hover {
                    color: #135e96;
                }
            </style>
            <?php
        }
    }
}
add_action('post_submitbox_misc_actions', 'placy_add_route_frontend_view_button');

/**
 * ADMIN COLUMNS - BEDRE OVERSIKT
 */

// Prosjekt columns - vis kunde og status
function placy_prosjekt_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['prosjekt_tittel'] = '📁 Prosjekttittel';
    $new_columns['kunde'] = '👤 Kunde';
    $new_columns['status'] = '📊 Status';
    $new_columns['tech'] = '⚙️ Tech Stack';
    $new_columns['date'] = $columns['date'];
    return $new_columns;
}
add_filter('manage_prosjekt_posts_columns', 'placy_prosjekt_columns');

function placy_prosjekt_column_content($column, $post_id) {
    if ($column === 'prosjekt_tittel') {
        $tittel = get_field('tittel', $post_id);
        echo $tittel ? '<strong><a href="' . get_edit_post_link($post_id) . '">' . esc_html($tittel) . '</a></strong>' : '<span style="color: #999;">Uten tittel</span>';
    }
    if ($column === 'kunde') {
        $kunde = get_field('kunde', $post_id);
        if ($kunde) {
            $kunde_navn = get_field('navn', $kunde->ID);
            echo '<a href="' . get_edit_post_link($kunde->ID) . '"><strong>' . esc_html($kunde_navn) . '</strong></a>';
        } else {
            echo '<span style="color: #999;">Ingen kunde</span>';
        }
    }
    if ($column === 'status') {
        $status = get_field('status', $post_id);
        $badges = array(
            'planning' => '<span style="color: #00a0d2;">◐</span> Planlegging',
            'active' => '<span style="color: #46b450;">●</span> Aktiv',
            'completed' => '<span style="color: #00a0d2;">✓</span> Fullført',
            'on_hold' => '<span style="color: #ffb900;">⏸</span> På vent',
            'archived' => '<span style="color: #999;">□</span> Arkivert',
        );
        echo $badges[$status] ?? esc_html($status);
    }
    if ($column === 'tech') {
        $tech = get_field('tech_stack', $post_id);
        if ($tech && is_array($tech)) {
            echo '<small>' . esc_html(implode(', ', array_slice($tech, 0, 3))) . '</small>';
        }
    }
}
add_action('manage_prosjekt_posts_custom_column', 'placy_prosjekt_column_content', 10, 2);

// Story columns - vis prosjekt, kunde og type
function placy_story_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['story_tittel'] = '📄 Story Tittel';
    $new_columns['prosjekt'] = '📁 Prosjekt';
    $new_columns['kunde'] = '👤 Kunde';
    $new_columns['type'] = '🏷️ Type';
    $new_columns['story_date'] = '📅 Story Dato';
    $new_columns['date'] = $columns['date'];
    return $new_columns;
}
add_filter('manage_story_posts_columns', 'placy_story_columns');

function placy_story_column_content($column, $post_id) {
    if ($column === 'story_tittel') {
        $tittel = get_field('tittel', $post_id);
        echo $tittel ? '<strong><a href="' . get_edit_post_link($post_id) . '">' . esc_html($tittel) . '</a></strong>' : '<span style="color: #999;">Uten tittel</span>';
    }
    if ($column === 'prosjekt') {
        $prosjekt = get_field('prosjekt', $post_id);
        if ($prosjekt) {
            $prosjekt_tittel = get_field('tittel', $prosjekt->ID);
            echo '<a href="' . get_edit_post_link($prosjekt->ID) . '"><strong>' . esc_html($prosjekt_tittel) . '</strong></a>';
        } else {
            echo '<span style="color: #999;">Ingen prosjekt</span>';
        }
    }
    if ($column === 'kunde') {
        $prosjekt = get_field('prosjekt', $post_id);
        if ($prosjekt) {
            $kunde = get_field('kunde', $prosjekt->ID);
            if ($kunde) {
                $kunde_navn = get_field('navn', $kunde->ID);
                echo '<a href="' . get_edit_post_link($kunde->ID) . '">' . esc_html($kunde_navn) . '</a>';
            }
        } else {
            echo '<span style="color: #999;">—</span>';
        }
    }
    if ($column === 'type') {
        $type = get_field('story_type', $post_id);
        $icons = array(
            'update' => '📝 Oppdatering',
            'milestone' => '🎯 Milepæl',
            'challenge' => '⚠️ Utfordring',
            'success' => '🎉 Suksess',
            'insight' => '💡 Innsikt',
            'announcement' => '📢 Kunngjøring',
        );
        echo $icons[$type] ?? esc_html($type);
    }
    if ($column === 'story_date') {
        $date = get_field('story_date', $post_id);
        if ($date) {
            echo '<small>' . esc_html(date('d/m/Y', strtotime($date))) . '</small>';
        }
    }
}
add_action('manage_story_posts_custom_column', 'placy_story_column_content', 10, 2);

// Kunde columns - vis antall prosjekter
function placy_kunde_columns($columns) {
    $new_columns = array();
    $new_columns['cb'] = $columns['cb'];
    $new_columns['kunde_navn'] = '👤 Kundenavn';
    $new_columns['logo'] = '🖼️ Logo';
    $new_columns['industry'] = '🏢 Bransje';
    $new_columns['projects_count'] = '📊 Antall Prosjekter';
    $new_columns['date'] = $columns['date'];
    return $new_columns;
}
add_filter('manage_kunde_posts_columns', 'placy_kunde_columns');

function placy_kunde_column_content($column, $post_id) {
    if ($column === 'kunde_navn') {
        $navn = get_field('navn', $post_id);
        echo $navn ? '<strong><a href="' . get_edit_post_link($post_id) . '">' . esc_html($navn) . '</a></strong>' : '<span style="color: #999;">Uten navn</span>';
    }
    if ($column === 'logo') {
        $logo = get_field('logo', $post_id);
        if ($logo && isset($logo['sizes']['thumbnail'])) {
            echo '<img src="' . esc_url($logo['sizes']['thumbnail']) . '" style="width: 40px; height: 40px; object-fit: contain;" />';
        }
    }
    if ($column === 'industry') {
        $bransje = get_field('bransje', $post_id);
        $bransje_labels = array(
            'tech' => 'Teknologi',
            'retail' => 'Detaljhandel',
            'finance' => 'Finans',
            'healthcare' => 'Helse',
            'education' => 'Utdanning',
            'manufacturing' => 'Industri',
            'real_estate' => 'Eiendom',
            'other' => 'Annet',
        );
        echo $bransje ? esc_html($bransje_labels[$bransje] ?? $bransje) : '<span style="color: #999;">—</span>';
    }
    if ($column === 'projects_count') {
        $args = array(
            'post_type' => 'prosjekt',
            'posts_per_page' => -1,
            'meta_query' => array(
                array(
                    'key' => 'kunde',
                    'value' => $post_id,
                    'compare' => '='
                )
            )
        );
        $query = new WP_Query($args);
        echo '<strong>' . $query->found_posts . '</strong> prosjekt' . ($query->found_posts != 1 ? 'er' : '');
        wp_reset_postdata();
    }
}
add_action('manage_kunde_posts_custom_column', 'placy_kunde_column_content', 10, 2);

/**
 * CUSTOM FORMATTERING AV POI I RELATIONSHIP FIELD
 * Viser lokasjon og undertittel i dropdown for å skille POI-er med samme navn
 */
function placy_format_poi_relationship_result($title, $post, $field, $post_id) {
    // Kun for POI post type
    if ($post->post_type !== 'poi') {
        return $title;
    }
    
    // Hent feltene direkte (de ligger ikke i en sub-group)
    $display_location = get_field('poi_display_location', $post->ID);
    $display_subtitle = get_field('poi_display_subtitle', $post->ID);
    
    // Bygg formatert tittel
    $formatted_title = $title;
    
    if ($display_location) {
        $formatted_title .= ' <span style="color: #666; font-weight: normal;">(' . esc_html($display_location) . ')</span>';
    }
    
    if ($display_subtitle) {
        $formatted_title .= '<br><span style="color: #999; font-size: 0.9em; font-weight: normal;">' . esc_html($display_subtitle) . '</span>';
    }
    
    return $formatted_title;
}
add_filter('acf/fields/relationship/result', 'placy_format_poi_relationship_result', 10, 4);

