<?php

require get_theme_file_path( '/inc/like-route.php' );
require get_theme_file_path( '/inc/search-route.php' );

function uni_custom_rest() {
	register_rest_field( 'post', 'authorName', array(
		'get_callback' => function () {
			return get_the_author();
		}
	) );
	register_rest_field( 'note', 'userNoteCount', array(
		'get_callback' => function () {
			return count_user_posts( get_current_user_id(), 'note' );
		}
	) );
}

add_action( 'rest_api_init', 'uni_custom_rest' );

function pageBanner( $args = null ) {
	if ( ! isset( $args['title'] ) ) {
		$args['title'] = get_the_title();
	}
	if ( ! isset( $args['subtitle'] ) ) {
		$args['subtitle'] = get_field( 'page_banner_subtitle' );
	}
	if ( ! isset( $args['photo'] ) ) {
		if ( get_field( 'page_banner_background_image' ) and ! is_archive() and ! is_home() ) {
			$args['photo'] = get_field( 'page_banner_background_image' )['sizes']['pageBanner'];
		} else {
			$args['photo'] = get_theme_file_uri( '/images/ocean.jpg' );
		}
	}

	?>
    <div class="page-banner">
        <div class="page-banner__bg-image" style="background-image: url(
		<?php
		echo $args['photo'];
		?>)">
        </div>
        <div class="page-banner__content container container--narrow">
            <h1 class="page-banner__title">
				<?php
				echo $args['title']; ?>
            </h1>
            <div class="page-banner__intro">
                <p><?php
					echo $args['subtitle']; ?></p>
            </div>
        </div>
    </div>
	<?php
}

function uni_files() {
	wp_enqueue_script( 'main-uni-script', get_theme_file_uri( '/build/index.js' ), [ 'jquery' ], '0.1', true );
	/*wp_enqueue_style(
		'custom-google-font',
		'//fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i'
	);
	wp_enqueue_style( 'font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css' );*/
	wp_enqueue_style( 'uni_main_styles', get_theme_file_uri( '/build/style-index.css' ) );
	wp_enqueue_style( 'uni_extra_styles', get_theme_file_uri( '/build/index.css' ) );

	wp_localize_script( 'main-uni-script', 'uniData', array(
		'root_url' => get_site_url(),
		'nonce'    => wp_create_nonce( 'wp_rest' ),
	) );
}

add_action( 'wp_enqueue_scripts', 'uni_files' );


function uni_features() {
	register_nav_menu( 'headerMenuLocation', 'Header Menu' );
	register_nav_menu( 'footerLocationOne', 'Footer One' );
	register_nav_menu( 'footerLocationTwo', 'Footer Two' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_image_size( 'professorLandscape', 400, 260, true );
	add_image_size( 'professorPortrait', 480, 650, true );
	add_image_size( 'pageBanner', 1500, 350, true );
}

add_action( 'after_setup_theme', 'uni_features' );

//disable_plugin_updates
function disable_plugin_updates( $value ) {
	if ( isset( $value ) && is_object( $value ) ) {
		if ( isset( $value->response['advanced-custom-fields-pro/acf.php'] ) ) {
			unset( $value->response['advanced-custom-fields-pro/acf.php'] );
		}
	}

	return $value;
}

add_filter( 'site_transient_update_plugins', 'disable_plugin_updates' );


// add current-menu-item class to subpages of cpt
function additional_active_item_classes( $classes = [], $menu_item = false ) {
	// custom taxonomy
	if ( $menu_item->title == 'Custom Tax Name Page' && is_tax( 'custom_tax' ) ) {
		$classes[] = 'current-menu-item';
	}
	// Events post type single
	if ( $menu_item->title == 'Events' && ( is_singular( 'event' ) || is_page( 'past-events' ) ) ) {
		$classes[] = 'current-menu-item';
	}

	// Programs post type single
	if ( $menu_item->title == 'Programs' && ( is_singular( 'program' ) ) ) {
		$classes[] = 'current-menu-item';
	}
	// blog post single
	if ( $menu_item->title == 'Blog' && is_singular( 'post' ) ) {
		$classes[] = 'current-menu-item';
	}
	// blog post single
	if ( $menu_item->title == 'Campuses' && is_singular( 'campus' ) ) {
		$classes[] = 'current-menu-item';
	}

	return $classes;
}

add_filter( 'nav_menu_css_class', 'additional_active_item_classes', 10, 2 );


function uni_adjust_queries( $query ) {
	if ( ! is_admin() && is_post_type_archive( 'campus' ) && $query->is_main_query() ) {
		$query->set( 'orderby', 'title' );
		$query->set( 'order', 'ASC' );
		$query->set( 'posts_per_page', - 1 );
	}

	if ( ! is_admin() && is_post_type_archive( 'program' ) && $query->is_main_query() ) {
		$query->set( 'orderby', 'title' );
		$query->set( 'order', 'ASC' );
		$query->set( 'posts_per_page', - 1 );
	}

	if ( ! is_admin() && is_post_type_archive( 'event' ) && $query->is_main_query() ) {
		$today = date( 'Ymd' );
		$query->set( 'meta_key', 'event_date' );
		$query->set( 'orderby', 'meta_value_num' );
		$query->set( 'order', 'ASC' );
		$query->set( 'meta_query', [
			[
				'key'     => 'event_date',
				'compare' => '>=',
				'value'   => $today,
				'type'    => 'numeric',
			],
		] );
	}
}

add_action( 'pre_get_posts', 'uni_adjust_queries' );

// Redirect subscriber account out of admin to homepage
add_action( 'admin_init', 'redirectSubsToFrontEnd' );

function redirectSubsToFrontEnd() {
	$ourCurrentUser = wp_get_current_user();

	if ( count( $ourCurrentUser->roles ) == 1 and $ourCurrentUser->roles[0] == 'subscriber' ) {
		wp_safe_redirect( home_url() );
	}
}

add_action( 'wp_loaded', 'noSubsAdminBar' );

function noSubsAdminBar() {
	$ourCurrentUser = wp_get_current_user();

	if ( count( $ourCurrentUser->roles ) == 1 and $ourCurrentUser->roles[0] == 'subscriber' ) {
		show_admin_bar( false );
	}
}

// Customize login screen
add_filter( 'login_headerurl', 'ourHeaderUrl' );

function ourHeaderUrl() {
	return 'https://danyk.ru';
}

add_action( 'login_enqueue_scripts', 'ourLoginCSS' );

function ourLoginCSS() {
	wp_enqueue_style( 'uni_main_styles', get_theme_file_uri( '/build/style-index.css' ) );
	wp_enqueue_style( 'uni_extra_styles', get_theme_file_uri( '/build/index.css' ) );
}

add_filter( 'login_headertext', 'ourLoginTitle' );

function ourLoginTitle() {
	return 'Powered by Danyk';
}

// Force note posts to be private
add_filter( 'wp_insert_post_data', 'makeNotePrivate', 10, 2 );

function makeNotePrivate( $data, $postarr ) {
	if ( $data['post_type'] == 'note' ) {
		if ( count_user_posts( get_current_user_id(), 'note' ) > 4 && ! $postarr['ID'] ) {
			wp_die( 'You have reached your note limit.' );
		}

		$data['post_content'] = sanitize_textarea_field( $data['post_content'] );
		$data['post_title']   = sanitize_text_field( $data['post_title'] );
	}

	if ( $data['post_type'] == 'note' && $data['post_status'] != 'trash' ) {
		$data['post_status'] = 'private';
	}


	return $data;
}
