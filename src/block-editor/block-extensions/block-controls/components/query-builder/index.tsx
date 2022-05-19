/** External Imports */
import classNames from 'classnames';

/** WordPress Imports */
import { Button, ButtonGroup } from '@wordpress/components';
import { _x } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';

/** Internal Imports */
import { BuilderOptionsContext, BuilderQueryContext } from './contexts';
import QueryBuilderObjects from './components/objects';

/** Type Imports */
import { BuilderProps } from './types';

/** Style Imports */
import './index.scss';

import { newRule, newGroup } from './templates';

const QueryBuilder = ( { query, onChange, options }: BuilderProps ) => {
	const { objects } = query;

	return (
		<BuilderOptionsContext.Provider value={ options }>
			<BuilderQueryContext.Provider value={ query }>
				<div
					className={ classNames( [
						'cc__component-condition-editor',
						'cc__condition-editor',
					] ) }
				>
					<QueryBuilderObjects
						type="builder"
						query={ query }
						onChange={ onChange }
					/>

					<ButtonGroup className="cc__component-condition-editor__add-buttons">
						<Button
							icon={ plus }
							variant="link"
							onClick={ () => {
								onChange( {
									...query,
									objects: [ ...objects, newRule() ],
								} );
							} }
						>
							{ _x(
								'Add condition',
								'Conditional editor main add buttons',
								'content-control'
							) }
						</Button>

						<Button
							icon={ plus }
							variant="link"
							onClick={ () => {
								onChange( {
									...query,
									objects: [ ...objects, newGroup() ],
								} );
							} }
						>
							{ _x(
								'Add condition group',
								'Conditional editor main add buttons',
								'content-control'
							) }
						</Button>
					</ButtonGroup>
				</div>
			</BuilderQueryContext.Provider>
		</BuilderOptionsContext.Provider>
	);
};

export default QueryBuilder;
