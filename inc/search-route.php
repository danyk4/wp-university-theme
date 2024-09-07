<?php

add_action( 'rest_api_init', 'uniRegisterSearch' );

function uniRegisterSearch() {
	register_rest_route( 'uni/v1', 'search', array(
		'methods'  => WP_REST_Server::READABLE, // GET
		'callback' => 'uniSearchResults',
	) );
}

function uniSearchResults( $data ) {
	$mainQuery = new WP_Query( array(
		'post_type' => array( 'post', 'page', 'professor', 'event', 'program', 'campus' ),
		's'         => sanitize_text_field( $data['term'] )
	) );

	$results = array(
		'generalInfo' => array(),
		'professors'  => array(),
		'programs'    => array(),
		'events'      => array(),
		'campuses'    => array()
	);

	while ( $mainQuery->have_posts() ) {
		$mainQuery->the_post();

		if ( get_post_type() === 'post' || get_post_type() === 'page' ) {
			$results['generalInfo'] = array(
				'title'     => get_the_title(),
				'permalink' => get_permalink(),
			);
		}

		if ( get_post_type() === 'professor' ) {
			$results['professors'] = array(
				'title'     => get_the_title(),
				'permalink' => get_permalink(),
			);
		}

		if ( get_post_type() === 'program' ) {
			$results['programs'] = array(
				'title'     => get_the_title(),
				'permalink' => get_permalink(),
			);
		}

		if ( get_post_type() === 'event' ) {
			$results['events'] = array(
				'title'     => get_the_title(),
				'permalink' => get_permalink(),
			);
		}

		if ( get_post_type() === 'campus' ) {
			$results['campuses'] = array(
				'title'     => get_the_title(),
				'permalink' => get_permalink(),
			);
		}
	}

	return $results;
}
