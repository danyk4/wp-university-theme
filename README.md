# Wordpress University Theme

you'll need file 'uni-post-types.php' in 'mu-plugins' dir to register your custom post types

```php
<?php

function uni_post_types()
{
  // Event post type
  register_post_type('event', [
    'show_in_rest' => true,
    'supports'     => ['title', 'editor', 'excerpt'],
    'rewrite'      => ['slug' => 'events'],
    'has_archive'  => true,
    'public'       => true,
    'labels'       => [
      'name'          => 'Events',
      'add_new_item'  => 'Add New Event',
      'edit_item'     => 'Edit Event',
      'all_items'     => 'All Events',
      'singular_name' => 'Event',
      'add_new'       => 'Add New Event',
    ],
    'menu_icon'    => 'dashicons-calendar',
  ]);

  // Program post type
  register_post_type('program', [
    'show_in_rest' => true,
    'supports'     => ['title', 'editor'],
    'rewrite'      => ['slug' => 'programs'],
    'has_archive'  => true,
    'public'       => true,
    'labels'       => [
      'name'          => 'Programs',
      'add_new_item'  => 'Add New Program',
      'edit_item'     => 'Edit Program',
      'all_items'     => 'All Programs',
      'singular_name' => 'Program',
      'add_new'       => 'Add New Program',
    ],
    'menu_icon'    => 'dashicons-awards',
  ]);
}

add_action('init', 'uni_post_types');

```
