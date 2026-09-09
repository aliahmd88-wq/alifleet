<?php
/**
 * Create or update `import_car` posts from the staged vehicles.json.
 *   sudo wp-agent stage /tmp/vehicles.json
 *   sudo wp-agent stage /tmp/apply-import-cars.php
 *   sudo wp-agent wp eval-file /tmp/alifleet-stage/apply-import-cars.php dry
 *   sudo wp-agent wp eval-file /tmp/alifleet-stage/apply-import-cars.php apply
 *
 * A vehicle is matched by its slug (post_name), so the script can be re-run:
 * an existing post is updated in place, everything else is created. The owner
 * can edit any field afterwards in WordPress (ACF group "Vehicle Import CPT
 * Fields"); re-running this script would overwrite those edits, so only run it
 * for new vehicles or after updating vehicles.json deliberately.
 */
$mode = $args[0] ?? 'dry';
$file = '/tmp/alifleet-stage/vehicles.json';
if ( ! file_exists( $file ) ) WP_CLI::error( "missing $file" );
$data = json_decode( file_get_contents( $file ), true );
if ( empty( $data['vehicles'] ) ) WP_CLI::error( 'vehicles.json is empty or invalid' );
if ( ! function_exists( 'update_field' ) ) WP_CLI::error( 'ACF is not active' );

$created = $updated = 0;
foreach ( $data['vehicles'] as $v ) {
	$existing = get_posts( [ 'post_type' => 'import_car', 'name' => $v['slug'], 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids' ] );
	$id = $existing ? (int) $existing[0] : 0;
	WP_CLI::line( sprintf( '%s %s %s  %s', 'apply' === $mode ? 'write' : 'plan ', $id ? "update #$id" : 'create   ', $v['slug'], $v['car_model'] ) );
	if ( 'apply' !== $mode ) { $id ? $updated++ : $created++; continue; }

	$postarr = [ 'post_type' => 'import_car', 'post_status' => 'publish', 'post_title' => $v['title'], 'post_name' => $v['slug'] ];
	if ( $id ) { $postarr['ID'] = $id; $r = wp_update_post( $postarr, true ); }
	else { $r = wp_insert_post( $postarr, true ); }
	if ( is_wp_error( $r ) ) { WP_CLI::warning( $v['slug'] . ': ' . $r->get_error_message() ); continue; }
	$id ? $updated++ : $created++;
	$id = (int) $r;

	update_field( 'car_model', $v['car_model'], $id );
	foreach ( [ 'ar', 'en', 'he' ] as $l ) {
		update_field( "car_subtitle_$l", $v['subtitle'][ $l ], $id );
		update_field( "description_$l", $v['description'][ $l ], $id );
		update_field( "eta_$l", $v['eta'][ $l ], $id );
	}
	update_field( 'body_type', $v['body_type'], $id );
	update_field( 'origin', $v['origin'], $id );
	update_field( 'status', $v['status'], $id );
	update_field( 'stage', (int) $v['stage'], $id );
	update_field( 'year', (int) $v['year'], $id );
	update_field( 'mileage', (int) $v['mileage'], $id );
	update_field( 'price', '' === $v['price'] ? null : (float) $v['price'], $id );
	update_field( 'featured', (bool) $v['featured'], $id );
	// Only seed the illustrative render when the post has no photo yet; real photos attached later must survive re-runs.
	if ( ! empty( $v['featured_image'] ) && ! has_post_thumbnail( $id ) && get_post( (int) $v['featured_image'] ) ) {
		update_field( 'featured_image', (int) $v['featured_image'], $id );
		set_post_thumbnail( $id, (int) $v['featured_image'] );
	}
	for ( $i = 1; $i <= 8; $i++ ) {
		$h = $v['highlights'][ $i - 1 ] ?? null;
		update_field( "highlight_$i", [ 'item_ar' => $h['ar'] ?? '', 'item_en' => $h['en'] ?? '', 'item_he' => $h['he'] ?? '' ], $id );
	}
	$s = $v['specs'];
	update_field( 'specs', [
		'engine' => $s['engine'], 'transmission' => $s['transmission'], 'fuel' => $s['fuel'], 'drivetrain' => $s['drivetrain'],
		'color_ar' => '', 'color_en' => '', 'color_he' => '', 'seats' => '' === $s['seats'] ? null : (int) $s['seats'],
	], $id );
	clean_post_cache( $id );
}
WP_CLI::success( sprintf( '%s: %d created, %d updated', 'apply' === $mode ? 'applied' : 'dry run', $created, $updated ) );
