const eslintConfig = {
	root: true,
	extends: [ 'plugin:@code-atlantic/eslint-plugin/recommended' ],
	globals: {
		wp: 'readonly',
		contentControlBlockEditorVars: 'readonly',
	},
	env: {
		browser: true,
		jquery: true,
	},
	settings: {
		jsdoc: {
			mode: 'typescript',
		},
		'import/resolver': {
			node: {
				moduleDirectory: [ 'node_modules', 'src/' ],
			},
		},
	},
	rules: {},
};

module.exports = eslintConfig;
