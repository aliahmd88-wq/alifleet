<?php
// Append staged photos to a vehicle's gallery (after the existing entries), converting to WebP. Input: append.json {slug: {files: [...], alt: {...}}}
$dir = '/tmp/alifleet-stage/vehicle-images'; $map = json_decode( file_get_contents( "$dir/append.json" ), true );
require_once ABSPATH . 'wp-admin/includes/image.php'; require_once ABSPATH . 'wp-admin/includes/file.php'; require_once ABSPATH . 'wp-admin/includes/media.php';
foreach ( $map as $slug => $m ) {
	$ids = get_posts( [ 'post_type' => 'import_car', 'name' => $slug, 'post_status' => 'any', 'numberposts' => 1, 'fields' => 'ids' ] ); if ( ! $ids ) continue; $id = (int) $ids[0]; $alt = $m['alt'];
	$existing = []; for ( $n = 1; $n <= 8; $n++ ) { $g = get_field( "gallery_image_$n", $id ); $img = is_array( $g ) ? ( $g['image']['ID'] ?? $g['image'] ?? null ) : null; if ( $img ) $existing[] = (int) $img; }
	foreach ( $m['files'] as $file ) {
		$src = "$dir/$file"; $ext = strtolower( pathinfo( $src, PATHINFO_EXTENSION ) );
		$im = 'png' === $ext ? @imagecreatefrompng( $src ) : ( 'webp' === $ext ? @imagecreatefromwebp( $src ) : @imagecreatefromjpeg( $src ) ); if ( ! $im ) continue;
		imagepalettetotruecolor( $im ); imagealphablending( $im, false ); imagesavealpha( $im, true ); $out = preg_replace( '/\.(png|jpe?g)$/i', '.webp', $src ); imagewebp( $im, $out, 82 ); imagedestroy( $im );
		$tmp = wp_tempnam( basename( $out ) ); copy( $out, $tmp ); $att = media_handle_sideload( [ 'name' => basename( $out ), 'tmp_name' => $tmp ], $id, $alt['he'] );
		if ( is_wp_error( $att ) ) { WP_CLI::warning( $att->get_error_message() ); continue; } update_post_meta( $att, '_wp_attachment_image_alt', $alt['he'] ); $existing[] = (int) $att;
	}
	for ( $n = 1; $n <= 8; $n++ ) { $img = $existing[ $n - 1 ] ?? null; update_field( "gallery_image_$n", [ 'image' => $img ?: null, 'alt_text_ar' => $img ? $alt['ar'] : '', 'alt_text_en' => $img ? $alt['en'] : '', 'alt_text_he' => $img ? $alt['he'] : '' ], $id ); }
	clean_post_cache( $id ); WP_CLI::line( "$slug: gallery now " . implode( ',', $existing ) );
}
WP_CLI::success( 'appended' );
