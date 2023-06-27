import classNames from 'classnames';
import { StringParam, useQueryParams } from 'use-query-params';

import { upgrade } from '@content-control/icons';
import { Icon, Popover } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

import Header from './header';
import RestrictionsView from './restrictions-view';
import SettingsView from './settings-view';

import type { TabComponent } from './types';
import { useLicense } from '@content-control/core-data';
import UpgradeView from './upgrades-view';

const {
	permissions: {
		manage_settings: userCanManageSettings,
		edit_restrictions: userCanEditRestrictions,
	},
} = contentControlSettingsPage;

const App = () => {
	const { isLicenseActive } = useLicense();

	const [ { view = 'restrictions' }, setParams ] = useQueryParams( {
		tab: StringParam,
		view: StringParam,
	} );

	let views: TabComponent[] = [];

	if ( userCanEditRestrictions ) {
		views.push( {
			name: 'restrictions',
			title: __( 'Restrictions', 'content-control' ),
			className: 'restrictions',
			pageTitle: __(
				'Content Control - Global Restrictions',
				'content-control'
			),
			heading: __(
				'Content Control - Global Restrictions',
				'content-control'
			),
			comp: RestrictionsView,
		} );
	}

	if ( userCanManageSettings ) {
		views.push( {
			name: 'settings',
			title: __( 'Settings', 'content-control' ),
			className: 'settings',
			pageTitle: __(
				'Content Control - Plugin Settings',
				'content-control'
			),
			heading: __( 'Plugin Settings', 'content-control' ),
			comp: SettingsView,
		} );
	}

	/**
	 * Filter the list of views.
	 *
	 * @param {TabComponent[]} views List of views.
	 *
	 * @return {TabComponent[]} Filtered list of views.
	 */
	views = applyFilters( 'contentControl.adminViews', [
		...views,
		{
			name: 'upgrade',
			className: 'upgrade',
			title: (
				<>
					<Icon size={ 20 } icon={ upgrade } />
					{ ! isLicenseActive
						? __( 'Upgrade to Pro', 'content-control' )
						: __( 'License Status', 'content-control' ) }{ ' ' }
				</>
			),
			pageTitle: __(
				'Content Control - Upgrade to Pro',
				'content-control'
			),
			heading: __(
				'Content Control - Upgrade to Pro',
				'content-control'
			),
			href: 'https://contentcontrolplugin.com/pricing/?utm_source=plugin&utm_medium=upgrade-link&utm_campaign=plugin&utm_content=plugin-menu',
			target: '_blank',
			onClick: () => {
				setParams( {
					view: 'settings',
					tab: 'license-and-updates',
				} );

				// Return false prevents tab component from rendering.
				return false;
			},
		},
	] ) as TabComponent[];

	// Assign the current view from the list of views.
	const currentView = views.find( ( _view ) => _view.name === view );

	// Create a generic component from currentView.
	const ViewComponent = currentView?.comp ? currentView.comp : () => <></>;

	// Update page title with contextual info based on current view.
	useEffect( () => {
		document.title =
			views.find( ( obj ) => obj.name === view )?.pageTitle ??
			__( 'Content Control', 'content-control' );
	}, [ view, views ] );

	return (
		<div
			className={ classNames( [ 'cc-settings-page', `view-${ view }` ] ) }
		>
			<UpgradeView />
			<Header tabs={ views } />
			<div className="cc-settings-page__content">
				<ViewComponent />
			</div>
			{ /*
			// @ts-ignore */ }
			<Popover.Slot />
		</div>
	);
};

export default App;
