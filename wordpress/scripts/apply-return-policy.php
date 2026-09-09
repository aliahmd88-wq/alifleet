<?php
/**
 * Replace the content of the three return-policy pages with the staged HTML.
 *   sudo wp-agent wp eval-file /tmp/alifleet-stage/apply-return-policy.php dry
 *   sudo wp-agent wp eval-file /tmp/alifleet-stage/apply-return-policy.php apply
 */
$mode  = $args[0] ?? 'dry';
$pages = [
	'he' => [ 'id' => 1029, 'file' => '/tmp/alifleet-stage/return-policy-he.html', 'title' => 'מדיניות החזרה, החלפה ואחריות' ],
	'ar' => [ 'id' => 1030, 'file' => '/tmp/alifleet-stage/return-policy-ar.html', 'title' => 'سياسة الإرجاع والاستبدال والضمان' ],
	'en' => [ 'id' => 1033, 'file' => '/tmp/alifleet-stage/return-policy-en.html', 'title' => 'Returns, Exchanges & Warranty Policy' ],
];
foreach ( $pages as $lang => $p ) {
	$post = get_post( $p['id'] );
	if ( ! $post || 'page' !== $post->post_type ) { WP_CLI::warning( "$lang: page {$p['id']} missing" ); continue; }
	if ( ! file_exists( $p['file'] ) ) { WP_CLI::warning( "$lang: staged file missing" ); continue; }
	$html = trim( file_get_contents( $p['file'] ) );
	WP_CLI::line( sprintf( '%s  %s #%d %s: %d -> %d chars, title "%s" -> "%s"', 'apply' === $mode ? 'write' : 'plan ', $lang, $p['id'], $post->post_name, strlen( $post->post_content ), strlen( $html ), $post->post_title, $p['title'] ) );
	if ( 'apply' !== $mode ) continue;
	$r = wp_update_post( [ 'ID' => $p['id'], 'post_title' => $p['title'], 'post_content' => $html ], true );
	if ( is_wp_error( $r ) ) { WP_CLI::warning( "$lang: " . $r->get_error_message() ); continue; }
	clean_post_cache( $p['id'] );
}
WP_CLI::success( 'apply' === $mode ? 'return policy pages updated' : 'dry run only' );
