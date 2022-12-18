import type { Icon } from '@wordpress/components';

export type DeviceScreenSize = {
	label: string;
	icon?: Icon.IconType< any >;
};

export type DeviceScreenSizes = {
	[ key: string ]: DeviceScreenSize;
};

export interface GroupRulesBase {}

export interface DeviceGroupRules extends GroupRulesBase {
	hideOn: {
		[ key: string ]: boolean;
	};
}

export interface ConditionalGroupRules extends GroupRulesBase {
	anyAll: 'any' | 'all' | 'none';
	conditionSets: {
		id: string;
		type: 'rule' | 'group';
	}[];
}

export type GroupRules = ConditionalGroupRules | DeviceGroupRules;
// TODO Remove this.
export type RuleGroup = GroupRules;

export type Rules = {
	device?: DeviceGroupRules;
	conditional?: ConditionalGroupRules;
};

export type BlockControls = {
	enabled: boolean;
	rules: Rules;
};

export type BlockControlAttrs = {
	contentControls?: BlockControls;
	[ key: string ]: any;
};
