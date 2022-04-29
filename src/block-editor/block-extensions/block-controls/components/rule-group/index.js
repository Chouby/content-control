/**
 * External Imports
 */
import classNames from 'classnames';

/**
 * WordPress Imports
 */
import {
	Children,
	cloneElement,
	isValidElement,
	forwardRef,
} from '@wordpress/element';

/**
 * Internal Imports.
 */
import RuleGroupHeader from './header';

/**
 * Style Imports
 */
import './index.scss';

/**
 * RuleGroup component.
 *
 * @param {Object} props Object container required props.
 * @param {Object} ref   Forwarded reference to the toggle button.
 */
const RuleGroup = forwardRef(
	(
		{
			label,
			groupId,
			icon,
			rules,
			setRules,
			defaults = {},
			children,
			...extraChildProps
		},
		ref
	) => {
		const groupDefaults = defaults[ groupId ] ?? null;

		const { [ groupId ]: groupRules = null } = rules;

		const isOpened = null !== groupRules;

		/**
		 * Update single rule group's settings by ID.
		 *
		 * @param {Object|Array|null} newRules New rules to save for group.
		 *
		 * @return {void}
		 */
		const setGroupRules = ( newRules ) => {
			setRules( { ...rules, [ groupId ]: newRules } );
		};

		/**
		 * Render children with additional props.
		 */
		const childrenWithProps = Children.map( children, ( child ) => {
			// Checking isValidElement is the safe way and avoids a typescript
			// error too.
			if ( isValidElement( child ) ) {
				return cloneElement( child, {
					...extraChildProps,
					groupRules,
					setGroupRules,
				} );
			}
			return child;
		} );

		return (
			<div
				className={ classNames( [
					'cc__rules-group',
					`cc__rules-group--type-${ groupId }`,
					isOpened ? 'is-opened' : null,
				] ) }
			>
				<RuleGroupHeader
					headerProps={ {
						className: 'cc__rules-group__header',
					} }
					label={ label }
					isOpened={ isOpened }
					icon={ icon }
					setGroupRules={ setGroupRules }
				groupRules={ groupRules }
					ref={ ref }
				/>
				{ isOpened && (
					<div className="cc__rules-group__body">
						{ childrenWithProps }
					</div>
				) }
			</div>
		);
	}
);

export default RuleGroup;
