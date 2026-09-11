<?php
/**
 * Attach the owner's photos to import_car posts: first file = featured image, the rest = gallery_image_1..7.
 * Every file is converted to WebP (GD, quality 82, alpha kept) before it enters the media library.
 *   stage under /tmp/alifleet-stage/vehicle-images/ : the files + map.json {slug: {files: [...], alt: {he, ar, en}}}
 *   sudo wp-agent wp eval-file /tmp/alifleet-stage/apply-vehicle-gallery.php dry|apply
 */
$mode = $args[0] ?? 'dry'; $dir = '/tmp/alifleet-stage/vehicle-images';
$map = json_decode( file_get_contents( "$dir/map.json" ), true );
if ( ! function_exists( 'imagewebp' ) ) WP_CLI::error( 'GD has no WebP support' );
require_once ABSPATH . 'wp-admin/includes/image.php'; require_once ABSPATH . 'wp-admin/includes/file.php'; require_once ABSPATH . 'wp-admin/includes/media.php';
function alifleet_to_webp( string $src ): ?string {
	$ext = strtolower( pathinfo( $src, PATHINFO_EXTENSION ) );
	$im = 'png' === $ext ? @imagecreatefrompng( $src ) : ( 'webp' === $ext ? @imagecreatefromwebp( $src ) : @imagecreatefromjpeg( $src ) );
	if ( ! $im ) return null;
	imagepalettetotruecolor( $im ); imagealphablending( $im, false ); imagesavealpha( $im, true );
	$out = preg_replace( '/\.(png|jpe?g)$/i', '.webp', $src ); if ( $out === $src ) $out = preg_replace( '/\.webp$/i', '-w.webp', $src ); imagewebp( $im, $out, 82 ); imagedestroy( $im );
	return $out;
}
$done = 0;
foreach ( $map as $slug => $m ) {
	$ids = get_posts( [ 'post_type' => 'import_car', 'name' => $slug, 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids' ] );
	if ( ! $ids ) { WP_CLI::warning( "$slug: post not found" ); continue; }
	$id = (int) $ids[0]; $alt = $m['alt'];
	// Idempotent: skip a vehicle whose featured image already comes from this batch (first file, as .webp).
	$thumb = (int) get_post_thumbnail_id( $id );
	$first = preg_replace( '/\.(png|jpe?g)$/i', '.webp', $m['files'][0] ); if ( $first === $m['files'][0] ) $first = preg_replace( '/\.webp$/i', '-w.webp', $first );
	if ( $thumb && basename( (string) get_attached_file( $thumb ) ) === $first ) { WP_CLI::line( "skip  #$id $slug (already done)" ); continue; }
	WP_CLI::line( sprintf( '%s #%d %s: %d photos', 'apply' === $mode ? 'write' : 'plan ', $id, $slug, count( $m['files'] ) ) );
	if ( 'apply' !== $mode ) continue;
	$attached = [];
	foreach ( $m['files'] as $i => $file ) {
		$path = "$dir/$file"; if ( ! file_exists( $path ) ) { WP_CLI::warning( "  missing $file" ); continue; }
		$webp = alifleet_to_webp( $path ); if ( ! $webp ) { WP_CLI::warning( "  cannot convert $file" ); continue; }
		$tmp = wp_tempnam( basename( $webp ) ); copy( $webp, $tmp );
		$att = media_handle_sideload( [ 'name' => basename( $webp ), 'tmp_name' => $tmp ], $id, $alt['he'] );
		if ( is_wp_error( $att ) ) { WP_CLI::warning( '  ' . $att->get_error_message() ); continue; }
		update_post_meta( $att, '_wp_attachment_image_alt', $alt['he'] );
		$attached[] = $att;
	}
	if ( ! $attached ) continue;
	$featured = array_shift( $attached );
	update_field( 'featured_image', $featured, $id ); set_post_thumbnail( $id, $featured );
	for ( $n = 1; $n <= 8; $n++ ) {
		$img = $attached[ $n - 1 ] ?? null;
		update_field( "gallery_image_$n", [ 'image' => $img ?: null, 'alt_text_ar' => $img ? $alt['ar'] : '', 'alt_text_en' => $img ? $alt['en'] : '', 'alt_text_he' => $img ? $alt['he'] : '' ], $id );
	}
	clean_post_cache( $id ); $done++;
	WP_CLI::line( sprintf( '        featured #%d + %d gallery (%s)', $featured, count( $attached ), implode( ',', $attached ) ) );
}
WP_CLI::success( sprintf( '%s: %d vehicles', 'apply' === $mode ? 'applied' : 'dry run', $done ) );
