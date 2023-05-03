<?php

namespace ContentControl;

defined( 'ABSPATH' ) || exit;

/**
 * Class Conditions
 *
 * @package ContentControl
 */
class Conditions {

	/**
	 * @var
	 */
	public static $instance;

	/**
	 * @var bool
	 */
	public $preload_posts = false;

	/**
	 * @var array
	 */
	public $conditions;

	/**
	 * @var array
	 */
	public $condition_sort_order = [];

	/**
	 * @return \ContentControl\Conditions
	 */
	public static function instance() {
		if ( ! isset( self::$instance ) ) {
			self::$instance                = new self();
			self::$instance->preload_posts = isset( $_GET['page'] ) && $_GET['page'] == 'jp-cc-settings';
		}

		return self::$instance;
	}

	/**
	 * @param array $conditions
	 */
	public function add_conditions( $conditions = [] ) {
		foreach ( $conditions as $key => $condition ) {
			if ( empty( $condition['id'] ) && ! is_numeric( $key ) ) {
				$condition['id'] = $key;
			}

			$this->add_condition( $condition );
		}
	}

	/**
	 * @param array $condition
	 */
	public function add_condition( $condition = [] ) {
		if ( ! empty( $condition['id'] ) && ! isset( $this->conditions[ $condition['id'] ] ) ) {
			$condition = wp_parse_args( $condition, [
				'id'       => '',
				'callback' => null,
				'group'    => '',
				'name'     => '',
				'priority' => 10,
				'fields'   => [],
				'advanced' => false,
			] );

			$this->conditions[ $condition['id'] ] = $condition;
		}

		return;
	}

	/**
	 * @return array
	 */
	public function get_conditions() {
		if ( ! isset( $this->conditions ) ) {
			$this->register_conditions();
		}

		return $this->conditions;
	}

	/**
	 * @return array|mixed
	 */
	public function condition_sort_order() {
		if ( ! $this->condition_sort_order ) {
			$order = [
				__( 'General', 'content-control' )    => 1,
				__( 'Pages', 'content-control' )      => 5,
				__( 'Posts', 'content-control' )      => 5,
				__( 'Categories', 'content-control' ) => 14,
				__( 'Tags', 'content-control' )       => 14,
				__( 'Format', 'content-control' )     => 16,
			];

			$post_types = get_post_types( [
				'public'   => true,
				'_builtin' => false,
			], 'objects' );
			foreach ( $post_types as $name => $post_type ) {
				$order[ $post_type->labels->name ] = 10;
			}

			$taxonomies = get_taxonomies( [
				'public'   => true,
				'_builtin' => false,
			], 'objects' );
			foreach ( $taxonomies as $tax_name => $taxonomy ) {
				$order[ $taxonomy->labels->name ] = 15;
			}

			$this->condition_sort_order = apply_filters( 'jp_cc_condition_sort_order', $order );
		}

		return $this->condition_sort_order;
	}

	/**
	 * @param $a
	 * @param $b
	 *
	 * @return int
	 */
	public function sort_condition_groups( $a, $b ) {
		$order = $this->condition_sort_order();

		$ai = isset( $order[ $a ] ) ? intval( $order[ $a ] ) : 10;
		$bi = isset( $order[ $b ] ) ? intval( $order[ $b ] ) : 10;

		if ( $ai == $bi ) {
			return 0;
		}

		// Compare their positions in line.
		return $ai > $bi ? 1 : -1;
	}

	/**
	 * @return array
	 */
	public function get_conditions_by_group() {
		static $groups;

		if ( ! isset( $groups ) ) {
			$groups = [];

			foreach ( $this->get_conditions() as $condition ) {
				$groups[ $condition['group'] ][ $condition['id'] ] = $condition;
			}

			uksort( $groups, [ $this, 'sort_condition_groups' ] );
		}

		return $groups;
	}

	/**
	 * @return array
	 */
	public function conditions_dropdown_list() {
		$groups = [];

		$conditions_by_group = $this->get_conditions_by_group();

		foreach ( $conditions_by_group as $group => $_conditions ) {
			$conditions = [];

			foreach ( $_conditions as $id => $condition ) {
				$conditions[ $id ] = $condition['name'];
			}

			$groups[ $group ] = $conditions;
		}

		return $groups;
	}

	/**
	 * @param array $args
	 */
	public function conditions_selectbox( $args = [] ) {
		$args = wp_parse_args( $args, [
			'id'      => '',
			'name'    => '',
			'current' => '',
		] );

		// TODO: Generate this using PUM_Fields. Use a switch to generate a templ version when needed. ?>
	<select class="target facet-select" id="<?php esc_attr_e( $args['id'] ); ?>" name="<?php esc_attr_e( $args['name'] ); ?>">
		<option value=""><?php _e( 'Select a condition', 'content-control' ); ?></option>
		<?php foreach ( $this->get_conditions_by_group() as $group => $conditions ) : ?>
			<optgroup label="<?php echo esc_attr_e( $group ); ?>">
				<?php foreach ( $conditions as $id => $condition ) : ?>
					<option value="<?php echo $id; ?>" <?php selected( $args['current'], $id ); ?>>
						<?php echo $condition->get_label( 'name' ); ?>
					</option>
				<?php endforeach ?>
			</optgroup>
		<?php endforeach ?>
		</select>
		<?php
	}

	/**
	 * @param null $condition
	 *
	 * @return mixed|null
	 */
	public function get_condition( $condition = null ) {
		$conditions = $this->get_conditions();

		return isset( $conditions[ $condition ] ) ? $conditions[ $condition ] : null;
	}

	/**
	 * @return array
	 */
	public function generate_post_type_conditions() {
		$conditions = [];
		$post_types = get_post_types( [ 'public' => true ], 'objects' );

		foreach ( $post_types as $name => $post_type ) {
			if ( $post_type->has_archive ) {
				$conditions[ $name . '_index' ] = [
					'group'    => $post_type->labels->name,
					'name'     => sprintf( _x( '%s Archive', 'condition: post type plural label ie. Posts: All', 'content-control' ), $post_type->labels->name ),
					'callback' => [ '\\ContentControl\Condition_Callbacks', 'post_type' ],
					'priority' => 5,
				];
			}

			$conditions[ $name . '_all' ] = [
				'group'    => $post_type->labels->name,
				'name'     => sprintf( _x( 'A %s', 'condition: post type singular label ie. Posts: All', 'content-control' ), $post_type->labels->singular_name ),
				'callback' => [ '\\ContentControl\Condition_Callbacks', 'post_type' ],
			];

			$conditions[ $name . '_selected' ] = [
				'group'    => $post_type->labels->name,
				'name'     => sprintf( _x( 'A Selected %s', 'condition: post type singular label ie. Posts: Selected', 'content-control' ), $post_type->labels->singular_name ),
				'fields'   => [
					'selected' => [
						'placeholder' => sprintf( _x( 'Select %s.', 'condition: post type singular label ie. Select Posts', 'content-control' ), strtolower( $post_type->labels->singular_name ) ),
						'type'        => 'postselect',
						'post_type'   => $name,
						'multiple'    => true,
						'as_array'    => true,
						'std'         => [],
					],
				],
				'callback' => [ '\\ContentControl\Condition_Callbacks', 'post_type' ],
			];

			$conditions[ $name . '_ID' ] = [
				'group'    => $post_type->labels->name,
				'name'     => sprintf( _x( 'A %s with ID', 'condition: post type singular label ie. Posts: ID', 'content-control' ), $post_type->labels->singular_name ),
				'fields'   => [
					'selected' => [
						'placeholder' => sprintf( _x( '%s IDs: 128, 129', 'condition: post type singular label ie. Posts IDs', 'content-control' ), strtolower( $post_type->labels->singular_name ) ),
						'type'        => 'text',
					],
				],
				'callback' => [ '\\ContentControl\Condition_Callbacks', 'post_type' ],
			];

			if ( is_post_type_hierarchical( $name ) ) {
				$conditions[ $name . '_children' ] = [
					'group'    => $post_type->labels->name,
					'name'     => sprintf( _x( '%s: Child Of', 'condition: post type plural label ie. Posts: ID', 'content-control' ), $post_type->labels->name ),
					'fields'   => [
						'selected' => [
							'placeholder' => sprintf( _x( 'Select %s.', 'condition: post type plural label ie. Select Posts', 'content-control' ), strtolower( $post_type->labels->name ) ),
							'type'        => 'postselect',
							'post_type'   => $name,
							'multiple'    => true,
							'as_array'    => true,
						],
					],
					'callback' => [ '\\ContentControl\Condition_Callbacks', 'post_type' ],
				];

				$conditions[ $name . '_ancestors' ] = [
					'group'    => $post_type->labels->name,
					'name'     => sprintf( _x( '%s: Ancestor Of', 'condition: post type plural label ie. Posts: ID', 'content-control' ), $post_type->labels->name ),
					'fields'   => [
						'selected' => [
							'placeholder' => sprintf( _x( 'Select %s.', 'condition: post type plural label ie. Select Posts', 'content-control' ), strtolower( $post_type->labels->name ) ),
							'type'        => 'postselect',
							'post_type'   => $name,
							'multiple'    => true,
							'as_array'    => true,
						],
					],
					'callback' => [ '\\ContentControl\Condition_Callbacks', 'post_type' ],
				];
			}

			$templates = wp_get_theme()->get_page_templates();

			if ( $name == 'page' && ! empty( $templates ) ) {
				$conditions[ $name . '_template' ] = [
					'group'    => $post_type->labels->name,
					'name'     => sprintf( _x( 'A %s: With Template', 'condition: post type plural label ie. Pages: With Template', 'content-control' ), $post_type->labels->name ),
					'fields'   => [
						'selected' => [
							'type'     => 'select',
							'select2'  => true,
							'multiple' => true,
							'as_array' => true,
							'options'  => array_merge( [ 'default' => __( 'Default', 'content-control' ) ], $templates ),
						],
					],
					'callback' => [ '\\ContentControl\Condition_Callbacks', 'post_type' ],
				];
			}

			$conditions = array_merge( $conditions, $this->generate_post_type_tax_conditions( $name ) );
		}

		return $conditions;
	}

	/**
	 * @param $name
	 *
	 * @return array
	 */
	public function generate_post_type_tax_conditions( $name ) {
		$post_type  = get_post_type_object( $name );
		$taxonomies = get_object_taxonomies( $name, 'object' );
		$conditions = [];
		foreach ( $taxonomies as $tax_name => $taxonomy ) {
			$conditions[ $name . '_w_' . $tax_name ] = [
				'group'    => $post_type->labels->name,
				'name'     => sprintf( _x( 'A %1$s with %2$s', 'condition: post type plural and taxonomy singular label ie. Posts: With Category', 'content-control' ), $post_type->labels->singular_name, $taxonomy->labels->singular_name ),
				'fields'   => [
					'selected' => [
						'placeholder' => sprintf( _x( 'Select %s.', 'condition: post type plural label ie. Select categories', 'content-control' ), strtolower( $taxonomy->labels->name ) ),
						'type'        => 'taxonomyselect',
						'taxonomy'    => $tax_name,
						'multiple'    => true,
						'as_array'    => true,
						'options'     => $this->preload_posts ? $this->taxonomy_selectlist( $tax_name ) : [],
					],
				],
				'callback' => [ '\\ContentControl\Condition_Callbacks', 'post_type_tax' ],
			];
		}

		return $conditions;
	}


	/**
	 * Generates conditions for all public taxonomies.
	 *
	 * @return array
	 */
	public function generate_taxonomy_conditions() {
		$conditions = [];
		$taxonomies = get_taxonomies( [ 'public' => true ], 'objects' );

		foreach ( $taxonomies as $tax_name => $taxonomy ) {
			$conditions[ 'tax_' . $tax_name . '_all' ] = [
				'group'    => $taxonomy->labels->name,
				'name'     => sprintf( _x( 'A %s', 'condition: taxonomy plural label ie. Categories: All', 'content-control' ), $taxonomy->labels->name ),
				'callback' => [ '\\ContentControl\Condition_Callbacks', 'taxonomy' ],
			];

			$conditions[ 'tax_' . $tax_name . '_selected' ] = [
				'group'    => $taxonomy->labels->name,
				'name'     => sprintf( _x( '%s: Selected', 'condition: taxonomy plural label ie. Categories: Selected', 'content-control' ), $taxonomy->labels->name ),
				'fields'   => [
					'selected' => [
						'placeholder' => sprintf( _x( 'Select %s.', 'condition: taxonomy plural label ie. Select Categories', 'content-control' ), strtolower( $taxonomy->labels->name ) ),
						'type'        => 'taxonomyselect',
						'taxonomy'    => $tax_name,
						'multiple'    => true,
						'as_array'    => true,
					],
				],
				'callback' => [ '\\ContentControl\Condition_Callbacks', 'taxonomy' ],
			];

			$conditions[ 'tax_' . $tax_name . '_ID' ] = [
				'group'    => $taxonomy->labels->name,
				'name'     => sprintf( _x( 'A %s with IDs', 'condition: taxonomy plural label ie. Categories: Selected', 'content-control' ), $taxonomy->labels->name ),
				'fields'   => [
					'selected' => [
						'placeholder' => sprintf( _x( '%s IDs: 128, 129', 'condition: taxonomy plural label ie. Category IDs', 'content-control' ), strtolower( $taxonomy->labels->singular_name ) ),
						'type'        => 'text',
					],
				],
				'callback' => [ '\\ContentControl\Condition_Callbacks', 'taxonomy' ],
			];
		}

		return $conditions;
	}

	/**
	 * @return mixed|void
	 */
	public function register_conditions() {
		$conditions = array_merge( $this->generate_post_type_conditions(), $this->generate_taxonomy_conditions() );

		$conditions['is_front_page'] = [
			'group'    => __( 'Pages' ),
			'name'     => __( 'The Home Page', 'content-control' ),
			'callback' => 'is_front_page',
			'priority' => 2,
		];

		$conditions['is_home'] = [
			'group'    => __( 'Posts' ),
			'name'     => __( 'The Blog Index', 'content-control' ),
			'callback' => 'is_home',
			'priority' => 1,
		];

		$conditions['is_search'] = [
			'group'    => __( 'Pages' ),
			'name'     => __( 'A Search Result Page', 'content-control' ),
			'callback' => 'is_search',
		];

		$conditions['is_404'] = [
			'group'    => __( 'Pages' ),
			'name'     => __( 'A 404 Error Page', 'content-control' ),
			'callback' => 'is_404',
		];

		$conditions = apply_filters( 'jp_cc_registered_conditions', $conditions );

		$this->add_conditions( $conditions );
	}


	public static function taxonomy_selectlist( $taxonomies = [], $args = [], $include_total = false ) {
		if ( empty( $taxonomies ) ) {
			$taxonomies = [ 'category' ];
		}

		$args = wp_parse_args( $args, [
			'hide_empty' => false,
			'number'     => 10,
			'search'     => '',
			'include'    => null,
			'offset'     => 0,
			'page'       => null,
		] );

		if ( $args['page'] ) {
			$args['offset'] = ( $args['page'] - 1 ) * $args['number'];
		}

		// Query Caching.
		static $queries = [];

		$key = md5( serialize( $args ) );

		if ( ! isset( $queries[ $key ] ) ) {
			$terms = [];

			foreach ( get_terms( $taxonomies, $args ) as $term ) {
				$terms[ $term->name ] = $term->term_id;
			}

			$total_args = $args;
			unset( $total_args['number'] );
			unset( $total_args['offset'] );

			$results = [
				'items'       => $terms,
				'total_count' => $include_total ? wp_count_terms( $taxonomies, $total_args ) : null,
			];

			$queries[ $key ] = $results;
		} else {
			$results = $queries[ $key ];
		}

		return ! $include_total ? $results['items'] : $results;
	}

}
