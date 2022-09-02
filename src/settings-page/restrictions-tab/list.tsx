import { StringParam, useQueryParams, withDefault } from 'use-query-params';

import { __ } from '@wordpress/i18n';
import { info } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import {
	Button,
	Icon,
	Spinner,
	ToggleControl,
	Tooltip,
} from '@wordpress/components';

import { ListTable } from '@components';
import { restrictionsStore } from '@data';
import useEditor from './use-editor';

const statusOptionLabels: Record< Statuses, string > = {
	all: __( 'All', 'content-control' ),
	publish: __( 'Enabled', 'content-control' ),
	draft: __( 'Disabled', 'content-control' ),
	pending: __( 'Pending', 'content-control' ),
	trash: __( 'Trash', 'content-control' ),
};

const List = () => {
	// Get the shared method for setting editor Id & query params.
	const { setEditorId } = useEditor();

	// Fetch needed data from the @data & @wordpress/data stores.
	const { restrictions, isLoading, isDeleting } = useSelect( ( select ) => {
		const sel = select( restrictionsStore );
		// Restriction List & Load Status.
		return {
			restrictions: sel.getRestrictions(),
			isLoading: sel.isResolving( 'getRestrictions' ),
			isDeleting: sel.isDispatching( 'deleteRestriction' ),
		};
	}, [] );

	// Get action dispatchers.
	const { updateRestriction, deleteRestriction } =
		useDispatch( restrictionsStore );

	// Allow initiating the editor directly from a url.
	const [ filters, setFilters ] = useQueryParams( {
		status: withDefault( StringParam, 'all' ),
	} );

	// Quick helper to reset all query params.
	const clearFilterParams = () => setFilters( { status: undefined } );

	// Extract params with usable names.
	const { status } = filters;

	// Self clear query params when component is removed.
	useEffect( () => clearFilterParams, [] );

	// List of unique statuses from all items.
	const activeStatusCounts = useCallback(
		() =>
			restrictions.reduce< Record< Statuses, number > >(
				( s, r ) => {
					s[ r.status ] = ( s[ r.status ] ?? 0 ) + 1;
					s.all++;
					return s;
				},
				{ all: 0 }
			),
		[ restrictions ]
	)();

	// If the current status tab has no results, switch to all.
	useEffect( () => {
		const count = activeStatusCounts?.[ status ];

		if ( ! count || count <= 0 ) {
			setFilters( { status: 'all' } );
		}
	}, [ activeStatusCounts ] );

	/**
	 * Checks if Status button should be visible.
	 *
	 * @param s Status to check
	 * @returns True if button should be available.
	 */
	const isStatusActive = ( s: Statuses ) => activeStatusCounts?.[ s ] > 0;

	// Filtered list of restrictions for the current status filter.
	const filteredRestrictions = useCallback(
		() =>
			restrictions.filter( ( r ) =>
				status === 'all' ? true : status === r.status
			),
		[ restrictions ]
	);

	return (
		<>
			{ /*// TODO Move to a new sub component */ }
			<div className="list-table-status-filters">
				{ Object.entries( statusOptionLabels ).map( ( [ s, label ] ) =>
					isStatusActive( s ) ? (
						<Button
							key={ s }
							variant="link"
							onClick={ () => setFilters( { status: s } ) }
							className={ s === status ? 'active' : '' }
						>
							<span className="label">{ label }</span>
							<span className="count">{ `(${ activeStatusCounts[ s ] })` }</span>
						</Button>
					) : null
				) }
			</div>

			<div className="list-table-container">
				{ isLoading && (
					<div className="is-loading">
						<Spinner />
					</div>
				) }
				<ListTable
					className="striped"
					items={ ! isLoading ? filteredRestrictions() : [] }
					columns={ {
						enabled: () => (
							<>
								<Tooltip
									text={ __(
										'Enable or disable the restriction',
										'content-control'
									) }
									position="top right"
								>
									<span>
										<Icon icon={ info } />
									</span>
								</Tooltip>
							</>
						),
						title: __( 'Title', 'content-control' ),
						description: __( 'Description', 'content-control' ),
					} }
					sortableColumns={ [ 'title' ] }
					renderCell={ (
						col:
							| string
							| keyof Pick<
									Restriction,
									'id' | 'title' | 'description'
							  >
							| keyof Restriction[ 'settings' ],
						restriction
					) => {
						switch ( col ) {
							case 'enabled':
								return (
									<ToggleControl
										checked={
											restriction.status === 'publish'
										}
										onChange={ ( checked ) => {
											updateRestriction( {
												...restriction,
												status: checked
													? 'publish'
													: 'draft',
											} );
										} }
									/>
								);
							case 'title':
								const isTrash = restriction.status === 'trash';
								return (
									<>
										<Button
											variant="link"
											onClick={ () =>
												setEditorId( restriction.id )
											}
										>
											{ restriction.title }
										</Button>

										<div className="item-actions">
											{ `${ __(
												'ID',
												'content-control'
											) }: ${ restriction.id }` }
											<Button
												text={ __(
													'Edit',
													'content-control'
												) }
												variant="link"
												onClick={ () =>
													setEditorId(
														restriction.id
													)
												}
											/>

											<Button
												text={
													isTrash
														? __(
																'Untrash',
																'content-control'
														  )
														: __(
																'Trash',
																'content-control'
														  )
												}
												variant="link"
												isDestructive={ true }
												isBusy={ !! isDeleting }
												onClick={ () =>
													isTrash
														? updateRestriction( {
																...restriction,
																status: 'draft',
														  } )
														: deleteRestriction(
																restriction.id
														  )
												}
											/>

											{ isTrash && (
												<Button
													text={ __(
														'Delete Permanently',
														'content-control'
													) }
													variant="link"
													isDestructive={ true }
													isBusy={ !! isDeleting }
													onClick={ () =>
														window.confirm() &&
														deleteRestriction(
															restriction.id,
															true
														)
													}
												/>
											) }
										</div>
									</>
								);
							default:
								return (
									restriction[ col ] ??
									restriction.settings[ col ] ??
									''
								);
						}
					} }
				/>
			</div>
		</>
	);
};

export default List;
