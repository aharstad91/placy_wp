<?php
/**
 * WordPress Production Configuration for Servebolt
 * Kopier denne til wp-config.php på produksjonsserveren
 */

// ** Database settings - Servebolt production ** //
define( 'DB_NAME', 'your_production_db' );
define( 'DB_USER', 'your_production_user' );
define( 'DB_PASSWORD', 'your_production_password' );
define( 'DB_HOST', 'localhost' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 * Generate new keys at: https://api.wordpress.org/secret-key/1.1/salt/
 */
define( 'AUTH_KEY',         'put your unique phrase here' );
define( 'SECURE_AUTH_KEY',  'put your unique phrase here' );
define( 'LOGGED_IN_KEY',    'put your unique phrase here' );
define( 'NONCE_KEY',        'put your unique phrase here' );
define( 'AUTH_SALT',        'put your unique phrase here' );
define( 'SECURE_AUTH_SALT', 'put your unique phrase here' );
define( 'LOGGED_IN_SALT',   'put your unique phrase here' );
define( 'NONCE_SALT',       'put your unique phrase here' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 */
define( 'WP_DEBUG', false );
define( 'WP_DEBUG_LOG', false );
define( 'WP_DEBUG_DISPLAY', false );

/**
 * Headless WordPress Production Settings
 */
// CORS for production frontend
$frontend_url = 'https://placywp.no'; // Endre til din frontend URL
header("Access-Control-Allow-Origin: $frontend_url");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// GraphQL settings
define( 'GRAPHQL_DEBUG', false );

// Security enhancements
define( 'FORCE_SSL_ADMIN', true );
define( 'DISALLOW_FILE_EDIT', true );

// WordPress URLs (endre til ditt domene)
define( 'WP_HOME', 'https://api.placywp.no' );
define( 'WP_SITEURL', 'https://api.placywp.no' );

/**
 * Servebolt optimizations
 */
define( 'WP_CACHE', true );
define( 'AUTOMATIC_UPDATER_DISABLED', true );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';