import type { Icon } from '@wordpress/components';

export type DeviceScreenSize = {
	label: string;
	icon?: Icon.IconType< any >;
};

export type DeviceScreenSizes = {
	[ key: string ]: DeviceScreenSize;
};

export interface BlockControlsGroupBase {}

export interface DeviceBlockControlsGroup extends BlockControlsGroupBase {
	hideOn: {
		[ key: string ]: boolean;
	};
}

export interface ConditionalBlockControlsGroup extends BlockControlsGroupBase {
	anyAll: 'any' | 'all' | 'none';
	// TODO Refactor to take query from rule-engine package.
	conditionSets: {
		id: string;
		type: 'rule' | 'group';
	}[];
}

export interface ControlGroups {
	device: DeviceBlockControlsGroup;
	conditional: ConditionalBlockControlsGroup;
}

export type BlockControlsGroup = ControlGroups[ keyof ControlGroups ];
