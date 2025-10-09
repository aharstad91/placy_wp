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
    // 1. KUNDER (Clients)
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
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'has_archive' => true,
        'rewrite' => array('slug' => 'kunder'),
        'menu_icon' => 'dashicons-businessperson',
        'menu_position' => 5,
    ));

    // 2. PROSJEKTER (Projects)
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
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'has_archive' => true,
        'rewrite' => array('slug' => 'prosjekter'),
        'menu_icon' => 'dashicons-portfolio',
        'menu_position' => 6,
    ));

    // 3. STORIES
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
        'supports' => array('title', 'editor', 'thumbnail', 'excerpt'),
        'has_archive' => true,
        'rewrite' => array('slug' => 'stories'),
        'menu_icon' => 'dashicons-media-document',
        'menu_position' => 7,
    ));
}
add_action('init', 'placy_register_cpts');

/**
 * ACF FIELD GROUPS - RELASJONER & METADATA
 * Hierarki: Kunde → Prosjekt → Story
 */
function placy_register_acf_fields() {
    if( !function_exists('acf_add_local_field_group') ) return;

    // ============================================
    // KUNDE FIELDS
    // ============================================
    acf_add_local_field_group(array(
        'key' => 'group_kunde',
        'title' => 'Kunde Informasjon',
        'fields' => array(
            array(
                'key' => 'field_kunde_logo',
                'label' => 'Logo',
                'name' => 'logo',
                'type' => 'image',
                'return_format' => 'array',
                'preview_size' => 'medium',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_kunde_website',
                'label' => 'Website',
                'name' => 'website',
                'type' => 'url',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_kunde_industry',
                'label' => 'Bransje',
                'name' => 'industry',
                'type' => 'text',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_kunde_brand_color',
                'label' => 'Merkevare Farge',
                'name' => 'brand_color',
                'type' => 'color_picker',
                'default_value' => '#000000',
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
    ));

    // ============================================
    // PROSJEKT FIELDS + RELASJON TIL KUNDE
    // ============================================
    acf_add_local_field_group(array(
        'key' => 'group_prosjekt',
        'title' => 'Prosjekt Informasjon',
        'fields' => array(
            array(
                'key' => 'field_prosjekt_kunde',
                'label' => 'Kunde',
                'name' => 'kunde',
                'type' => 'post_object',
                'instructions' => 'Velg hvilken kunde dette prosjektet tilhører',
                'required' => 1,
                'post_type' => array('kunde'),
                'return_format' => 'object',
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
                    'active' => 'Aktiv',
                    'completed' => 'Fullført',
                    'on_hold' => 'På vent',
                    'archived' => 'Arkivert',
                ),
                'default_value' => 'active',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_tech_stack',
                'label' => 'Teknologi',
                'name' => 'tech_stack',
                'type' => 'checkbox',
                'choices' => array(
                    'nextjs' => 'Next.js',
                    'wordpress' => 'WordPress',
                    'react' => 'React',
                    'typescript' => 'TypeScript',
                    'tailwind' => 'Tailwind CSS',
                    'graphql' => 'GraphQL',
                ),
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_prosjekt_url',
                'label' => 'Prosjekt URL',
                'name' => 'project_url',
                'type' => 'url',
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
    ));

    // ============================================
    // STORY FIELDS + RELASJON TIL PROSJEKT
    // ============================================
    acf_add_local_field_group(array(
        'key' => 'group_story',
        'title' => 'Story Informasjon',
        'fields' => array(
            array(
                'key' => 'field_story_prosjekt',
                'label' => 'Prosjekt',
                'name' => 'prosjekt',
                'type' => 'post_object',
                'instructions' => 'Velg hvilket prosjekt denne storyen tilhører',
                'required' => 1,
                'post_type' => array('prosjekt'),
                'return_format' => 'object',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_story_type',
                'label' => 'Type',
                'name' => 'story_type',
                'type' => 'select',
                'choices' => array(
                    'update' => 'Oppdatering',
                    'milestone' => 'Milepæl',
                    'challenge' => 'Utfordring',
                    'success' => 'Suksess',
                    'insight' => 'Innsikt',
                ),
                'default_value' => 'update',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_story_date',
                'label' => 'Dato',
                'name' => 'story_date',
                'type' => 'date_picker',
                'display_format' => 'd/m/Y',
                'return_format' => 'Y-m-d',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_story_media',
                'label' => 'Media (Bilder/Video)',
                'name' => 'media',
                'type' => 'gallery',
                'return_format' => 'array',
                'preview_size' => 'medium',
                'show_in_graphql' => 1,
            ),
            array(
                'key' => 'field_story_video_url',
                'label' => 'Video URL',
                'name' => 'video_url',
                'type' => 'url',
                'instructions' => 'YouTube, Vimeo eller annen video URL',
                'show_in_graphql' => 1,
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
    $new_columns['title'] = $columns['title'];
    $new_columns['kunde'] = '👤 Kunde';
    $new_columns['status'] = '📊 Status';
    $new_columns['tech'] = '⚙️ Tech Stack';
    $new_columns['date'] = $columns['date'];
    return $new_columns;
}
add_filter('manage_prosjekt_posts_columns', 'placy_prosjekt_columns');

function placy_prosjekt_column_content($column, $post_id) {
    if ($column === 'kunde') {
        $kunde = get_field('kunde', $post_id);
        if ($kunde) {
            echo '<a href="' . get_edit_post_link($kunde->ID) . '"><strong>' . esc_html($kunde->post_title) . '</strong></a>';
        } else {
            echo '<span style="color: #999;">Ingen kunde</span>';
        }
    }
    if ($column === 'status') {
        $status = get_field('status', $post_id);
        $badges = array(
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
    $new_columns['title'] = $columns['title'];
    $new_columns['prosjekt'] = '📁 Prosjekt';
    $new_columns['kunde'] = '👤 Kunde';
    $new_columns['type'] = '🏷️ Type';
    $new_columns['story_date'] = '📅 Story Dato';
    $new_columns['date'] = $columns['date'];
    return $new_columns;
}
add_filter('manage_story_posts_columns', 'placy_story_columns');

function placy_story_column_content($column, $post_id) {
    if ($column === 'prosjekt') {
        $prosjekt = get_field('prosjekt', $post_id);
        if ($prosjekt) {
            echo '<a href="' . get_edit_post_link($prosjekt->ID) . '"><strong>' . esc_html($prosjekt->post_title) . '</strong></a>';
        } else {
            echo '<span style="color: #999;">Ingen prosjekt</span>';
        }
    }
    if ($column === 'kunde') {
        $prosjekt = get_field('prosjekt', $post_id);
        if ($prosjekt) {
            $kunde = get_field('kunde', $prosjekt->ID);
            if ($kunde) {
                echo '<a href="' . get_edit_post_link($kunde->ID) . '">' . esc_html($kunde->post_title) . '</a>';
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
    $new_columns['title'] = $columns['title'];
    $new_columns['logo'] = '🖼️ Logo';
    $new_columns['industry'] = '🏢 Bransje';
    $new_columns['projects_count'] = '📊 Antall Prosjekter';
    $new_columns['date'] = $columns['date'];
    return $new_columns;
}
add_filter('manage_kunde_posts_columns', 'placy_kunde_columns');

function placy_kunde_column_content($column, $post_id) {
    if ($column === 'logo') {
        $logo = get_field('logo', $post_id);
        if ($logo && isset($logo['sizes']['thumbnail'])) {
            echo '<img src="' . esc_url($logo['sizes']['thumbnail']) . '" style="width: 40px; height: 40px; object-fit: contain;" />';
        }
    }
    if ($column === 'industry') {
        $industry = get_field('industry', $post_id);
        echo $industry ? esc_html($industry) : '<span style="color: #999;">—</span>';
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
