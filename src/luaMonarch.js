/* eslint-disable */
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

export function get() {
	let exports = {};
	exports.language = exports.conf = void 0;
	exports.conf = {
		comments: {
			lineComment: '--',
			blockComment: ['--[[', ']]']
		},
		brackets: [
			['{', '}'],
			['[', ']'],
			['(', ')']
		],
		autoClosingPairs: [
			{ open: '{', close: '}' },
			{ open: '[', close: ']' },
			{ open: '(', close: ')' },
			{ open: '"', close: '"' },
			{ open: "'", close: "'" }
		],
		surroundingPairs: [
			{ open: '{', close: '}' },
			{ open: '[', close: ']' },
			{ open: '(', close: ')' },
			{ open: '"', close: '"' },
			{ open: "'", close: "'" }
		]
	};
	exports.language = {
		defaultToken: '',
		tokenPostfix: '.qsclua',
		modules: [
		],
		globals: [
		],
		keywords: [
		],
		brackets: [
			{ token: 'delimiter.bracket', open: '{', close: '}' },
			{ token: 'delimiter.array', open: '[', close: ']' },
			{ token: 'delimiter.parenthesis', open: '(', close: ')' }
		],
		operators: [
			'+',
			'-',
			'*',
			'/',
			'%',
			'^',
			'#',
			'==',
			'~=',
			'<=',
			'>=',
			'<',
			'>',
			'=',
			';',
			':',
			',',
			'.',
			'..',
			'...'
		],
		// we include these common regular expressions
		symbols: /[=><!~?:&|+\-*\/\^%]+/,
		escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
		// The main tokenizer for our languages
		tokenizer: {
			root: [
				// identifiers and keywords
				// options appear to be 
				/*
					invalid emphasis strong variable variable.predefined  variable.parameter
					constant comment number number.hex regexp annotation type
					delimiter delimiter.html delimiter.xml tag tag.id.pug tag.class.pug 
					meta.scss meta.tag metatag metatag.content.html metatag.html metatag.xml
					metatag.php key string.key.json string.value.json attribute.name
					attribute.value attribute.value.number.css attribute.value.unit.css attribute.value.hex.css
					string string.sql keyword keyword.flow keyword.json keyword.flow.scss operator.scss
					operator.sql operator.swift predefined.sql
				*/
				[
					/[a-zA-Z_]\w*/,
					{
						cases: {
							'@modules': { token: 'annotation' },
							'@globals': { token: 'metatag' },
							'@keywords': { token: 'keyword.$0' },
							'@default': 'identifier'
						}
					}
				],
				// whitespace
				{ include: '@whitespace' },
				// keys
				[/(,)(\s*)([a-zA-Z_]\w*)(\s*)(:)(?!:)/, ['delimiter', '', 'key', '', 'delimiter']],
				[/({)(\s*)([a-zA-Z_]\w*)(\s*)(:)(?!:)/, ['@brackets', '', 'key', '', 'delimiter']],
				// delimiters and operators
				[/[{}()\[\]]/, '@brackets'],
				[
					/@symbols/,
					{
						cases: {
							'@operators': 'delimiter',
							'@default': ''
						}
					}
				],
				// numbers
				[/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
				[/0[xX][0-9a-fA-F_]*[0-9a-fA-F]/, 'number.hex'],
				[/\d+?/, 'number'],
				// delimiter: after number because of .\d floats
				[/[;,.]/, 'delimiter'],
				// strings: recover on non-terminated strings
				[/"([^"\\]|\\.)*$/, 'string.invalid'],
				[/'([^'\\]|\\.)*$/, 'string.invalid'],
				[/"/, 'string', '@string."'],
				[/'/, 'string', "@string.'"]
			],
			whitespace: [
				[/[ \t\r\n]+/, ''],
				[/--\[([=]*)\[/, 'comment', '@comment.$1'],
				[/--.*$/, 'comment']
			],
			comment: [
				[/[^\]]+/, 'comment'],
				[
					/\]([=]*)\]/,
					{
						cases: {
							'$1==$S2': { token: 'comment', next: '@pop' },
							'@default': 'comment'
						}
					}
				],
				[/./, 'comment']
			],
			string: [
				[/[^\\"']+/, 'string'],
				[/@escapes/, 'string.escape'],
				[/\\./, 'string.escape.invalid'],
				[
					/["']/,
					{
						cases: {
							'$#==$S2': { token: 'string', next: '@pop' },
							'@default': 'string'
						}
					}
				]
			]
		}
	}
	return exports;
}

