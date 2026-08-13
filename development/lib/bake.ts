import HCL from '@tree-sitter-grammars/tree-sitter-hcl';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import Parser from 'tree-sitter';

export const BAKE_MANIFEST = 'docker-bake.hcl';

export interface ImageManifest {
	name: string;
	version: string;
}

export type BakeVariable =
	| string
	| boolean
	| number
	| null
	| BakeVariable[]
	| {
			[key: string]: BakeVariable;
	  };

const hclParser = new Parser();
hclParser.setLanguage(HCL);

function parseHcl(contents: string): Parser.SyntaxNode {
	const root = hclParser.parse(contents).rootNode;
	if (root.hasError) {
		throw new Error('Could not parse Bake manifest as HCL.');
	}
	return root;
}

function topLevelBody(root: Parser.SyntaxNode): Parser.SyntaxNode {
	return root.namedChildren.find((child) => child.type === 'body') ?? root;
}

function variableBlocks(contents: string): Parser.SyntaxNode[] {
	return topLevelBody(parseHcl(contents)).namedChildren.filter(
		(node) => node.type === 'block' && node.namedChildren[0]?.text === 'variable'
	);
}

function decodeStringLiteral(node: Parser.SyntaxNode, context: string): string {
	if (
		node.type !== 'string_lit' ||
		node.namedChildren.some(
			(child) =>
				![
					'quoted_template_start',
					'template_literal',
					'quoted_template_end'
				].includes(child.type)
		)
	) {
		throw new Error(`${context} is not a literal string.`);
	}
	try {
		return JSON.parse(node.text) as string;
	} catch {
		throw new Error(`${context} is not a JSON-compatible HCL string literal.`);
	}
}

function variableBlock(contents: string, variable: string): Parser.SyntaxNode {
	const matches = variableBlocks(contents).filter((node) => {
		const [kind, label] = node.namedChildren;
		return (
			kind?.type === 'identifier' &&
			kind.text === 'variable' &&
			label?.type === 'string_lit' &&
			decodeStringLiteral(label, 'Bake variable label') === variable
		);
	});
	if (matches.length !== 1) {
		throw new Error(
			matches.length === 0
				? `Could not find Bake variable ${variable}.`
				: `Bake variable ${variable} is declared more than once.`
		);
	}
	return matches[0];
}

function attributeNode(
	body: Parser.SyntaxNode,
	attribute: string
): Parser.SyntaxNode | undefined {
	return body.namedChildren.find(
		(node) =>
			node.type === 'attribute' &&
			node.namedChildren[0]?.type === 'identifier' &&
			node.namedChildren[0].text === attribute
	);
}

function directStringLiteral(
	node: Parser.SyntaxNode | undefined
): Parser.SyntaxNode | undefined {
	let current = node;
	while (
		current &&
		['expression', 'literal_value'].includes(current.type) &&
		current.namedChildren.length === 1
	) {
		[current] = current.namedChildren;
	}
	return current?.type === 'string_lit' ? current : undefined;
}

function stringLiteralNode(
	contents: string,
	variable: string,
	attribute?: string
): Parser.SyntaxNode {
	const block = variableBlock(contents, variable);
	const body = block.namedChildren.find((node) => node.type === 'body');
	const defaultAttribute = body && attributeNode(body, 'default');
	if (!defaultAttribute) {
		throw new Error(`Bake variable ${variable} has no default attribute.`);
	}
	let valueExpression = defaultAttribute.namedChildren[1];
	if (attribute) {
		const object = valueExpression?.descendantsOfType('object')[0];
		const element = object?.namedChildren.find(
			(node) =>
				node.type === 'object_elem' && node.namedChildren[0]?.text === attribute
		);
		valueExpression = element?.namedChildren[1];
	}
	const literal = directStringLiteral(valueExpression);
	if (!literal) {
		const key = attribute ?? 'default';
		throw new Error(
			`Bake variable ${variable} has no string ${key} attribute.`
		);
	}
	decodeStringLiteral(literal, `Bake variable ${variable}`);
	return literal;
}

export function readBakeScalar(contents: string, variable: string): string {
	return decodeStringLiteral(
		stringLiteralNode(contents, variable),
		`Bake variable ${variable}`
	);
}

export function readBakeValue(
	contents: string,
	variable: string,
	attribute?: string
): string {
	if (!attribute) {
		return readBakeScalar(contents, variable);
	}
	return decodeStringLiteral(
		stringLiteralNode(contents, variable, attribute),
		`Bake variable ${variable}.${attribute}`
	);
}

export function replaceBakeValue(
	contents: string,
	variable: string,
	attribute: string | undefined,
	value: string
): string {
	const literal = stringLiteralNode(contents, variable, attribute);
	return (
		contents.slice(0, literal.startIndex) +
		JSON.stringify(value) +
		contents.slice(literal.endIndex)
	);
}

export function readImageManifest(path: string): ImageManifest {
	const contents = readFileSync(path, 'utf8');
	return {
		name: readBakeScalar(contents, 'IMAGE_NAME'),
		version: readBakeScalar(contents, 'IMAGE_VERSION')
	};
}

function parseBakeValue(value: string): BakeVariable {
	if (/^(?:\{|\[|true$|false$|null$|-?\d)/u.test(value)) {
		try {
			return JSON.parse(value) as BakeVariable;
		} catch {
			// Non-JSON primitive strings are returned unchanged.
		}
	}
	return value;
}

export function resolveBakeVariables(
	contents: string,
	cwd: string
): Map<string, BakeVariable> {
	const environment = { ...process.env };
	for (const block of variableBlocks(contents)) {
		const label = block.namedChildren[1];
		if (label?.type === 'string_lit') {
			delete environment[decodeStringLiteral(label, 'Bake variable label')];
		}
	}
	const result = spawnSync(
		'docker',
		['buildx', 'bake', '--file', '-', '--list=type=variables,format=json'],
		{
			cwd,
			encoding: 'utf8',
			env: environment,
			input: contents,
			maxBuffer: 10 * 1024 * 1024
		}
	);
	if (result.status !== 0) {
		throw new Error(
			`Could not resolve Bake manifest: ${result.stderr || result.stdout}`
		);
	}
	const variables = JSON.parse(result.stdout) as Array<{
		name: string;
		value?: string;
	}>;
	return new Map(
		variables.map(({ name, value }) => [name, parseBakeValue(value ?? '')])
	);
}

export function readResolvedBakeVariables(
	path: string
): Map<string, BakeVariable> {
	return resolveBakeVariables(readFileSync(path, 'utf8'), dirname(path));
}

export function bakeObject(
	variables: Map<string, BakeVariable>,
	name: string
): Record<string, BakeVariable> {
	const value = variables.get(name);
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new Error(`Bake variable ${name} is not an object.`);
	}
	return value;
}
