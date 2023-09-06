import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useDebounce } from '@wordpress/compose';
import { store as coreDataStore } from '@wordpress/core-data';
import { SmartTokenControl } from '@content-control/components';

import type { Post, Taxonomy } from '@wordpress/core-data';

import type {
	ObjectSelectFieldProps,
	PostSelectFieldProps,
	TaxonomySelectFieldProps,
	WithOnChange,
} from '../types';

interface ObjectOption extends Post< 'edit' >, Taxonomy< 'edit' > {}

const ObjectSelectField = ( {
	label,
	value,
	onChange,
	entityKind = 'postType',
	entityType = 'post',
	multiple = false,
}: WithOnChange<
	ObjectSelectFieldProps | PostSelectFieldProps | TaxonomySelectFieldProps
> ) => {
	const [ queryText, setQueryText ] = useState( '' );

	const updateQueryText = useDebounce( ( text: string ) => {
		setQueryText( text );
	}, 300 );

	const { prefill = [] } = useSelect(
		( select ) => ( {
			// @ts-ignore
			prefill: select( coreDataStore ).getEntityRecords(
				entityKind,
				entityType,
				{
					context: 'view',
					include: value,
					per_page: -1,
				}
			) as ObjectOption[],
		} ),
		[ value, entityKind, entityType ]
	);

	const { suggestions = [] } = useSelect(
		( select ) => ( {
			// @ts-ignore
			suggestions: select( coreDataStore ).getEntityRecords(
				entityKind,
				entityType,
				{
					context: 'view',
					search: queryText,
					per_page: 10,
				}
			) as ObjectOption[],
		} ),
		[ queryText, entityKind, entityType ]
	);

	const findSuggestion = ( id: number | string ) => {
		const found =
			suggestions &&
			suggestions.find(
				( suggestion ) => suggestion.id.toString() === id.toString()
			);

		if ( found ) {
			return found;
		}

		return (
			prefill &&
			prefill.find(
				( suggestion ) => suggestion.id.toString() === id.toString()
			)
		);
	};

	const values = ( () => {
		if ( ! value ) {
			return [];
		}

		return typeof value === 'number' || typeof value === 'string'
			? [ value ]
			: value;
	} )();

	const getTokenValue = ( token: string | { value: string } ) => {
		if ( typeof token === 'object' ) {
			return token.value;
		}

		return token;
	};

	return (
		<div className="cc-object-search-field">
			<SmartTokenControl
				label={
					label
						? label
						: sprintf(
								// translators: %s: entity type.
								__( '%s(s)', 'content-control' ),
								entityType
									.replace( /_/g, ' ' )
									// uppercase first letter.
									.charAt( 0 )
									.toUpperCase() +
									entityType.replace( /_/g, ' ' ).slice( 1 )
						  )
				}
				hideLabelFromVision={ true }
				multiple={ multiple }
				placeholder={ sprintf(
					// translators: %s: entity type.
					__( 'Select %s(s)', 'content-control' ),
					entityType.replace( /_/g, ' ' ).toLowerCase()
				) }
				tokenOnComma={ true }
				value={ values.map( ( v ) => v.toString() ) }
				onInputChange={ updateQueryText }
				onChange={ ( newValue ) => {
					onChange(
						newValue
							.map( ( v ) => parseInt( getTokenValue( v ), 10 ) )
							.filter( ( v ) => ! isNaN( v ) )
					);
				} }
				renderToken={ ( token ) => {
					const suggestion = findSuggestion( getTokenValue( token ) );

					if ( ! suggestion ) {
						return getTokenValue( token );
					}

					return 'postType' === entityKind
						? suggestion.title.rendered
						: suggestion.name;
				} }
				renderSuggestion={ ( item ) => {
					const suggestion = findSuggestion( item );

					if ( ! suggestion ) {
						return item;
					}
					return (
						<>
							{ 'postType' === entityKind
								? suggestion.title.rendered
								: suggestion.name }
						</>
					);
				} }
				suggestions={
					suggestions
						? suggestions.map( ( option ) => {
								return option?.id.toString() ?? false;
						  } )
						: []
				}
			/>
		</div>
	);
};

export default ObjectSelectField;
