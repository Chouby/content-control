import { DeviceToggle } from '@content-control/components';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { desktop, mobile, tablet } from '@wordpress/icons';
import { useBlockControls } from '../../../contexts';

import type {
	DeviceBlockControlsGroup,
	DeviceScreenSizes,
} from '../../../types';

const DeviceRules = () => {
	const { getGroupRules, setGroupRules, getGroupDefaults } =
		useBlockControls();

	const defaultValues = getGroupDefaults( 'device' );
	const currentRules = getGroupRules( 'device' ) ?? defaultValues;

	const setDeviceRules = ( deviceRules: DeviceBlockControlsGroup ) =>
		setGroupRules( 'device', deviceRules );

	const screenSizes = applyFilters(
		'contentControl.blockControls.screenSizes',
		{
			mobile: { label: __( 'Mobile', 'content-control' ), icon: mobile },
			tablet: { label: __( 'Tablet', 'content-control' ), icon: tablet },
			desktop: {
				label: __( 'Desktop', 'content-control' ),
				icon: desktop,
			},
		}
	) as DeviceScreenSizes;

	const { hideOn = {} } = currentRules;

	const toggleDeviceRule = ( device: string, hide: boolean ) =>
		setDeviceRules( {
			...currentRules,
			hideOn: {
				...hideOn,
				[ device ]: !! hide,
			},
		} );

	return (
		<>
			<p>
				{ __(
					'Use these options to control which devices this block will appear on.',
					'content-control'
				) }
			</p>
			{ Object.entries( screenSizes ).map(
				( [ deviceKey, { label, icon } ] ) => (
					<DeviceToggle
						key={ deviceKey }
						label={ label }
						icon={ icon }
						checked={ hideOn[ deviceKey ] ?? false }
						onChange={ ( hide ) =>
							toggleDeviceRule( deviceKey, hide )
						}
					/>
				)
			) }
		</>
	);
};

export default DeviceRules;
