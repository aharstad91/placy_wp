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

    // 5. POI (Points of Interest) - Gjenbrukbare steder/lokasjoner
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
    ));
}
add_action('init', 'placy_register_cpts');

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
}
add_action('acf/init', 'placy_register_acf_fields');

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

