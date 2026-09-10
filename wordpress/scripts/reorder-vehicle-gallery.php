<?php
// Re-point featured + gallery to already-uploaded attachments in a new order (exterior first). No re-upload.
$map = json_decode( file_get_contents( '/tmp/alifleet-stage/vehicle-images/reorder.json' ), true );
global $wpdb;
foreach ( $map as $slug => $m ) {
	$ids = get_posts( [ 'post_type' => 'import_car', 'name' => $slug, 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids' ] );
	if ( ! $ids ) { WP_CLI::warning( "$slug: post not found" ); continue; }
	$id = (int) $ids[0]; $atts = [];
	foreach ( $m['files'] as $f ) {
		$att = (int) $wpdb->get_var( $wpdb->prepare( "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_wp_attached_file' AND meta_value LIKE %s ORDER BY post_id DESC LIMIT 1", '%/' . $wpdb->esc_like( $f ) ) );
		if ( $att ) $atts[] = $att; else WP_CLI::warning( "$slug: attachment for $f not found" );
	}
	if ( ! $atts ) continue;
	$featured = array_shift( $atts ); $alt = $m['alt'];
	update_field( 'featured_image', $featured, $id ); set_post_thumbnail( $id, $featured );
	for ( $n = 1; $n <= 8; $n++ ) { $img = $atts[ $n - 1 ] ?? null; update_field( "gallery_image_$n", [ 'image' => $img ?: null, 'alt_text_ar' => $img ? $alt['ar'] : '', 'alt_text_en' => $img ? $alt['en'] : '', 'alt_text_he' => $img ? $alt['he'] : '' ], $id ); }
	clean_post_cache( $id ); WP_CLI::line( "$slug: featured #$featured, gallery " . implode( ',', $atts ) );
}
WP_CLI::success( 'reordered' );
