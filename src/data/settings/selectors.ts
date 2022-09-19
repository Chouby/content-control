import { settingsDefaults, Status } from './constants';

/**
 * Get setting by name.
 *
 * @param {SettingsState} state Current state.
 * @return {Settings} Object containing all plugin settings.
 */
export const getSettings = ( state: SettingsState ): Settings => state.settings;

/**
 * Get setting by name.
 *
 * @param {SettingsState} state        Current state.
 * @param {string}        name         Setting to get.
 * @param {any}           defaultValue Default value if not already set.
 * @return {any} Current value of given setting.
 */
export const getSetting = <
	K extends keyof Settings,
	D extends Settings[ K ] | undefined | false
>(
	state: SettingsState,
	name: K,
	defaultValue: D
): Settings[ K ] | D => {
	const settings = getSettings( state );

	return settings[ name ] ?? defaultValue;
};

/**
 * Gets object of unsaved settings changes.
 *
 * @param {SettingsState} state Current state.
 * @return {SettingsState['unsavedChanges']} Object containing unsaved changes.
 */
export const getUnsavedChanges = ( state: SettingsState ) => {
	return state?.unsavedChanges ?? {};
};

/**
 * Get list of excluded blocks.
 *
 * @param {SettingsState} state Current state.
 * @return {string[]} List of excluded block types.
 */
export const getExcludedBlocks = ( state: SettingsState ): string[] =>
	getSetting( state, 'excludedBlocks', settingsDefaults.excludedBlocks );

/**
 * Get required cap/permission for given capability.
 *
 * @param {SettingsState} state Current state.
 * @param {T}             cap   Capability to check for.
 * @return {string} Mapped WP capability.
 */
export const getReqPermission = < T extends keyof Settings[ 'permissions' ] >(
	state: SettingsState,
	cap: T
): string => {
	const permissions = getSetting(
		state,
		'permissions',
		settingsDefaults.permissions
	);

	// REVIEW should this be the default?
	return permissions[ cap ] ?? 'manage_options';
};

/**
 * Get current status for dispatched action.
 *
 * @param {SettingsState}                state      Current state.
 * @param {SettingsStore['ActionNames']} actionName Action name to check.
 *
 * @return {string} Current status for dispatched action.
 */
export const getDispatchStatus = (
	state: SettingsState,
	actionName: SettingsStore[ 'ActionNames' ]
): string | undefined => state?.dispatchStatus?.[ actionName ]?.status;

/**
 * Check if action is dispatching.
 *
 * @param {SettingsState}                                               state       Current state.
 * @param {SettingsStore['ActionNames']|SettingsStore['ActionNames'][]} actionNames Action name or array of names to check.
 *
 * @return {boolean} True if is dispatching.
 */
export const isDispatching = (
	state: SettingsState,
	actionNames:
		| SettingsStore[ 'ActionNames' ]
		| SettingsStore[ 'ActionNames' ][]
): boolean => {
	if ( ! Array.isArray( actionNames ) ) {
		return getDispatchStatus( state, actionNames ) === Status.Resolving;
	}

	let dispatching = false;

	for ( let i = 0; actionNames.length > i; i++ ) {
		dispatching =
			getDispatchStatus( state, actionNames[ i ] ) === Status.Resolving;

		if ( dispatching ) {
			return true;
		}
	}

	return dispatching;
};

/**
 * Check if action has finished dispatching.
 *
 * @param {SettingsState}                state      Current state.
 * @param {SettingsStore['ActionNames']} actionName Action name to check.
 *
 * @return {boolean} True if dispatched.
 */
export const hasDispatched = (
	state: SettingsState,
	actionName: SettingsStore[ 'ActionNames' ]
): boolean => {
	const status = getDispatchStatus( state, actionName );

	return !! (
		status &&
		( [ Status.Success, Status.Error ] as string[] ).indexOf( status ) >= 0
	);
};

/**
 * Get dispatch action error if esists.
 *
 * @param {SettingsState}                state      Current state.
 * @param {SettingsStore['ActionNames']} actionName Action name to check.
 *
 * @return {string|undefined} Current error message.
 */
export const getDispatchError = (
	state: SettingsState,
	actionName: SettingsStore[ 'ActionNames' ]
): string | undefined => state?.dispatchStatus?.[ actionName ]?.error;
