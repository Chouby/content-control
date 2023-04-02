<?php
/**
 * This file declares all of the plugin containers available services and accessors for IDEs to read.
 *
 * NOTE: VS Code can use this file as well when the PHP Intelliphense extension is installed to provide autocompletion.
 *
 * @package ContentControl\Core
 */

namespace PHPSTORM_META;

/**
 * Provide autocompletion for plugin container access.
 *
 * Return lists below all must match, it cannot be defined as a variable.
 * Thus all the duplication is needed.
 */

/**
  * NOTE: applies specifically to using the Plugin getter directly.
  * Example Usage: $events = pum_Scheduling_plugin()->get( 'events' );
  */
override( \ContentControl\Core\Plugin::get(0), map( [
  // Controllers.
  '' => '@',
  'options' => \ContentControl\Core\Options::class,
  'license' => \ContentControl\Core\License::class,
  'rules'   => \ContentControl\Rules::class,
] ) );

 /**
  * NOTE: applies specifically to using the global getter function.
  * Example Usage: $events = pum_scheduling( 'events' );
  */
override ( \ContentControl\plugin(0), map( [
  // Controllers.
  '' => '@',
  'options' => \ContentControl\Core\Options::class,
  'license' => \ContentControl\Core\License::class,
  'rules'   => \ContentControl\Rules::class,
] ) );
