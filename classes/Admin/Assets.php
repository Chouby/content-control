<?php


namespace ContentControl\Admin;

use function \ContentControl\plugin;

defined( 'ABSPATH' ) || exit;


class Assets {

	public static function init() {
		add_action( 'admin_enqueue_scripts', [ __CLASS__, 'scripts_styles' ] );
	}

	public static function scripts_styles( $hook ) {
		global $post_type;

		// Use minified libraries if SCRIPT_DEBUG is turned off
		$suffix = ( defined( 'SCRIPT_DEBUG' ) && SCRIPT_DEBUG ) ? '' : '.min';

		if ( $hook == 'widgets.php' ) {
			wp_enqueue_style( 'jpcc-widget-editor', plugin()->get_url( 'assets/styles/widget-editor' . $suffix . '.css' ), null, plugin( 'version' ), false );
			wp_enqueue_script( 'jpcc-widget-editor', plugin()->get_url( 'assets/scripts/widget-editor' . $suffix . '.js' ), [ 'jquery' ], plugin( 'version' ), true );
		}

		if ( $hook == 'settings_page_cc-settings' ) {
			if ( Settings::active_tab() == 'restrictions' ) {
				add_action( 'admin_footer', [ __CLASS__, 'js_wp_editor' ] );
			}

			Footer_Templates::init();

			wp_enqueue_style( 'jpcc-settings-page', plugin()->get_url( 'assets/styles/settings-page' . $suffix . '.css' ), [ 'editor-buttons' ], plugin( 'version' ), false );
			wp_enqueue_script( 'jpcc-settings-page', plugin()->get_url( 'assets/scripts/settings-page' . $suffix . '.js' ), [
				'jquery',
				'underscore',
				'wp-util',
				'wplink',
				'jquery-ui-sortable',
			], plugin( 'version' ), true );

			wp_localize_script( 'jpcc-settings-page', 'jp_cc_vars', [
				'nonce' => wp_create_nonce( 'jp-cc-admin-nonce' ),
				'I10n'  => [
					'tabs'              => [
						'general'    => __( 'General', 'content-control' ),
						'protection' => __( 'Protection', 'content-control' ),
						'content'    => __( 'Content', 'content-control' ),
					],
					'restrictions'      => [
						'confirm_remove' => __( 'Are you sure you want to delete this restriction?', 'content-control' ),
					],
					'restriction_modal' => [
						'title'       => __( 'Restriction Editor', 'content-control' ),
						'description' => __( 'Use this to modify a restrictions settings.', 'content-control' ),
					],
					'conditions'        => [
						'not_operand' => [
							'is'  => __( 'Is', 'content-control' ),
							'not' => __( 'Not', 'content-control' ),
						],
					],
					'save'              => __( 'Save', 'content-control' ),
					'cancel'            => __( 'Cancel', 'content-control' ),
					'add'               => __( 'Add', 'content-control' ),
					'update'            => __( 'Update', 'content-control' ),
				],
			] );
		}
	}


	/*
	 *  JavaScript WordPress editor
	 *	Author: 		Ante Primorac
	 *	Author URI: 	http://anteprimorac.from.hr
	 *	Version: 		1.1
	 *	License:
	 *		Copyright (c) 2013 Ante Primorac
	 *		Permission is hereby granted, free of charge, to any person obtaining a copy
	 *		of this software and associated documentation files (the "Software"), to deal
	 *		in the Software without restriction, including without limitation the rights
	 *		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 *		copies of the Software, and to permit persons to whom the Software is
	 *		furnished to do so, subject to the following conditions:
	 *
	 *		The above copyright notice and this permission notice shall be included in
	 *		all copies or substantial portions of the Software.
	 *
	 *		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 *		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 *		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 *		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 *		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 *		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	 *		THE SOFTWARE.
	 *	Usage:
	 *		server side(WP):
	 *			js_wp_editor( $settings );
	 *		client side(jQuery):
	 *			$('textarea').wp_editor( options );
	 */
	public static function js_wp_editor( $settings = [] ) {
		if ( ! class_exists( '\_WP_Editors' ) ) {
			require ABSPATH . WPINC . '/class-wp-editor.php';
		}

		/*
		ob_start();
		wp_editor( '', 'jp_cc_id' );
		ob_get_clean();
		*/
		$set = \_WP_Editors::parse_settings( 'jp_cc_id', $settings );

		if ( ! current_user_can( 'upload_files' ) ) {
			$set['media_buttons'] = false;
		}

		if ( $set['media_buttons'] ) {
			wp_enqueue_style( 'buttons' );
			wp_enqueue_script( 'thickbox' );
			wp_enqueue_style( 'thickbox' );
			wp_enqueue_script( 'media-upload' );
			wp_enqueue_script( 'wp-embed' );

			$post = get_post( 1 );
			if ( ! $post && ! empty( $GLOBALS['post_ID'] ) ) {
				$post = $GLOBALS['post_ID'];
			}
			wp_enqueue_media( [
				'post' => $post,
			] );
		}

		\_WP_Editors::editor_settings( 'jp_cc_id', $set );

		$jp_cc_vars = [
			'url'          => get_home_url(),
			'includes_url' => includes_url(),
		];

		wp_localize_script( 'jpcc-settings-page', 'jp_cc_wpeditor_vars', $jp_cc_vars );
	}
}
