<?php

function uni_files()
{
  wp_enqueue_script('main-uni-script', get_theme_file_uri('/build/index.js'), ['jquery'], '0.1', true);
  wp_enqueue_style(
    'custom-google-font',
    '//fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i|Roboto:100,300,400,400i,700,700i'
  );
  wp_enqueue_style('font-awesome', '//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
  wp_enqueue_style('uni_main_styles', get_theme_file_uri('/build/style-index.css'));
  wp_enqueue_style('uni_extra_styles', get_theme_file_uri('/build/index.css'));
}

add_action('wp_enqueue_scripts', 'uni_files');


function uni_features()
{
  register_nav_menu('headerMenuLocation', 'Header Menu');
  register_nav_menu('footerLocationOne', 'Footer One');
  register_nav_menu('footerLocationTwo', 'Footer Two');
  add_theme_support('title-tag');
}

add_action('after_setup_theme', 'uni_features');

//disable_plugin_updates
function disable_plugin_updates($value)
{
  if (isset($value) && is_object($value)) {
    if (isset($value->response['advanced-custom-fields-pro/acf.php'])) {
      unset($value->response['advanced-custom-fields-pro/acf.php']);
    }
  }

  return $value;
}

add_filter('site_transient_update_plugins', 'disable_plugin_updates');


// add current-menu-item class to subpages of cpt
function additional_active_item_classes($classes = [], $menu_item = false)
{
  // custom taxonomy
  if ($menu_item->title == 'Custom Tax Name Page' && is_tax('custom_tax')) {
    $classes[] = 'current-menu-item';
  }
  // Events post type single
  if ($menu_item->title == 'Events' && (is_singular('event') || is_page('past-events'))) {
    $classes[] = 'current-menu-item';
  }

  // Programs post type single
  if ($menu_item->title == 'Programs' && (is_singular('program'))) {
    $classes[] = 'current-menu-item';
  }
  // blog post single
  if ($menu_item->title == 'Blog' && is_singular('post')) {
    $classes[] = 'current-menu-item';
  }

  return $classes;
}

add_filter('nav_menu_css_class', 'additional_active_item_classes', 10, 2);


function uni_adjust_queries($query)
{
  if ( ! is_admin() && is_post_type_archive('program') && $query->is_main_query()) {
    $query->set('orderby', 'title');
    $query->set('order', 'ASC');
    $query->set('posts_per_page', -1);
  }

  if ( ! is_admin() && is_post_type_archive('event') && $query->is_main_query()) {
    $today = date('Ymd');
    $query->set('meta_key', 'event_date');
    $query->set('orderby', 'meta_value_num');
    $query->set('order', 'ASC');
    $query->set('meta_query', [
      [
        'key'     => 'event_date',
        'compare' => '>=',
        'value'   => $today,
        'type'    => 'numeric',
      ],
    ]);
  }
}

add_action('pre_get_posts', 'uni_adjust_queries');
